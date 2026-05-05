const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../database/db');
const { normalizePlanType } = require('./credits-service');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
const SALT_ROUNDS = 12;

// Ensure Google OAuth columns exist (idempotent)
async function ensureGoogleColumns() {
  try {
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`);
    await db.query(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_type VARCHAR(20) DEFAULT 'free'`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 20`);
    await db.query(`ALTER TABLE users ALTER COLUMN credits SET DEFAULT 20`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_last_refreshed TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    await db.query(`UPDATE users SET plan_type = 'free' WHERE plan_type IS NULL`);
    await db.query(`UPDATE users SET credits = 20 WHERE credits IS NULL`);
    await db.query(`UPDATE users SET credits_last_refreshed = CURRENT_TIMESTAMP WHERE credits_last_refreshed IS NULL`);
  } catch (_) { }
}
ensureGoogleColumns();

class AuthService {
  /**
   * Hash password using bcrypt
   */
  async hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate access token (short-lived)
   */
  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  }

  /**
   * Generate refresh token (long-lived)
   */
  generateRefreshToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        tokenId: crypto.randomBytes(16).toString('hex')
      },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
      return null;
    }
  }

  /**
   * Store refresh token in database
   */
  async storeRefreshToken(userId, token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const query = `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id
    `;

    const result = await db.query(query, [userId, tokenHash, expiresAt]);
    return result.rows[0].id;
  }

  /**
   * Verify refresh token exists and is valid in database
   */
  async verifyRefreshTokenInDb(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const query = `
      SELECT rt.*, u.id as user_id, u.email, u.role, u.is_active
      FROM refresh_tokens rt
      JOIN users u ON rt.user_id = u.id
      WHERE rt.token_hash = $1 
        AND rt.revoked = false 
        AND rt.expires_at > NOW()
        AND u.is_active = true
    `;

    const result = await db.query(query, [tokenHash]);
    return result.rows[0] || null;
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const query = `
      UPDATE refresh_tokens 
      SET revoked = true, revoked_at = NOW()
      WHERE token_hash = $1
    `;

    await db.query(query, [tokenHash]);
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId) {
    const query = `
      UPDATE refresh_tokens 
      SET revoked = true, revoked_at = NOW()
      WHERE user_id = $1 AND revoked = false
    `;

    await db.query(query, [userId]);
  }

  /**
   * Register new user
   */
  async registerUser(email, password, fullName = null, planType = 'free') {
    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Set initial credits based on plan
    const normalizedPlanType = normalizePlanType(planType);
    let credits = 20;
    if (normalizedPlanType === 'pro') credits = 50;
    if (normalizedPlanType === 'max') credits = 75;

    // Insert user
    const query = `
      INSERT INTO users (email, password_hash, full_name, plan_type, credits)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, full_name, role, plan_type, credits, created_at
    `;

    const result = await db.query(query, [email, passwordHash, fullName, normalizedPlanType, credits]);
    return result.rows[0];
  }

  /**
   * Authenticate user and return tokens
   */
  async loginUser(email, password, ipAddress = null) {
    console.log('\n=== AUTH SERVICE: loginUser ===');
    console.log('Email:', email);
    console.log('IP:', ipAddress);

    // Get user by email
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    console.log('Executing user query...');

    try {
      const userResult = await db.query(userQuery, [email]);
      console.log('Query result rows:', userResult.rows.length);

      if (userResult.rows.length === 0) {
        console.log('❌ User not found in database');
        await this.recordLoginAttempt(email, ipAddress, false);
        return { success: false, error: 'Invalid email or password' };
      }

      const user = userResult.rows[0];
      console.log('✅ User found:', { id: user.id, email: user.email, is_active: user.is_active });

      // Check if user is active
      if (!user.is_active) {
        console.log('❌ User account is disabled');
        return { success: false, error: 'Account is disabled' };
      }

      // Verify password
      console.log('Verifying password...');
      console.log('Password hash from DB:', user.password_hash?.substring(0, 20) + '...');

      const isValidPassword = await this.verifyPassword(password, user.password_hash);
      console.log('Password valid:', isValidPassword);

      if (!isValidPassword) {
        console.log('❌ Invalid password');
        await this.recordLoginAttempt(email, ipAddress, false);
        return { success: false, error: 'Invalid email or password' };
      }

      console.log('✅ Password verified');

      // Record successful login
      await this.recordLoginAttempt(email, ipAddress, true);
      await this.updateLastLogin(user.id);

      // Generate tokens
      console.log('Generating tokens...');
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);
      console.log('Access token generated:', !!accessToken);
      console.log('Refresh token generated:', !!refreshToken);

      // Store refresh token
      console.log('Storing refresh token...');
      await this.storeRefreshToken(user.id, refreshToken);
      console.log('✅ Refresh token stored');

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          planType: normalizePlanType(user.plan_type),
          credits: user.credits,
          storeVisits: user.store_visits || 0
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      console.error('❌ Database error in loginUser:', error);
      console.error('Error details:', error.message, error.stack);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    // Verify token signature
    const decoded = this.verifyRefreshToken(refreshToken);
    if (!decoded) {
      return { success: false, error: 'Invalid refresh token' };
    }

    // Verify token in database
    const tokenData = await this.verifyRefreshTokenInDb(refreshToken);
    if (!tokenData) {
      return { success: false, error: 'Invalid or expired refresh token' };
    }

    // Generate new access token
    const accessToken = this.generateAccessToken({
      id: tokenData.user_id,
      email: tokenData.email,
      role: tokenData.role
    });

    return {
      success: true,
      accessToken
    };
  }

  /**
   * Record login attempt for rate limiting
   */
  async recordLoginAttempt(email, ipAddress, success) {
    const query = `
      INSERT INTO login_attempts (email, ip_address, success)
      VALUES ($1, $2, $3)
    `;
    await db.query(query, [email, ipAddress, success]);
  }

  /**
   * Check if email/IP is rate limited
   */
  async checkRateLimit(email, ipAddress) {
    const query = `
      SELECT COUNT(*) as attempt_count
      FROM login_attempts
      WHERE (email = $1 OR ip_address = $2)
        AND success = false
        AND attempted_at > NOW() - INTERVAL '15 minutes'
    `;

    const result = await db.query(query, [email, ipAddress]);
    const attemptCount = parseInt(result.rows[0].attempt_count);

    // Allow max 5 failed attempts in 15 minutes
    return attemptCount >= 5;
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId) {
    const query = 'UPDATE users SET last_login = NOW() WHERE id = $1';
    await db.query(query, [userId]);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const query = `
      SELECT id, email, full_name, phone, address, preferences, theme_preference, role, plan_type, credits, credits_last_refreshed, store_visits, is_active, email_verified, created_at, last_login
      FROM users
      WHERE id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Check if email exists
   */
  async emailExists(email) {
    const query = 'SELECT COUNT(*) as count FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Find or create a user via Google OAuth
   */
  async loginOrRegisterGoogleUser(googleId, email, fullName, avatarUrl) {
    // Try to find existing user by google_id
    let userResult = await db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);

    if (userResult.rows.length === 0) {
      // Check if email already registered — link accounts
      const byEmail = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (byEmail.rows.length > 0) {
        await db.query(
          'UPDATE users SET google_id=$1, avatar_url=$2, email_verified=true WHERE id=$3',
          [googleId, avatarUrl, byEmail.rows[0].id]
        );
      } else {
        // Create new user
        await db.query(
          `INSERT INTO users (email, full_name, google_id, avatar_url, email_verified)
           VALUES ($1, $2, $3, $4, true)`,
          [email, fullName, googleId, avatarUrl]
        );
      }
      userResult = await db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    } else {
      await db.query(
        'UPDATE users SET avatar_url=$1, last_login=NOW() WHERE id=$2',
        [avatarUrl, userResult.rows[0].id]
      );
    }

    const user = userResult.rows[0];
    if (!user) throw new Error('Google user not found after upsert');

    await this.updateLastLogin(user.id);
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    await this.storeRefreshToken(user.id, refreshToken);

    return {
      success: true,
      user: { id: user.id, email: user.email, fullName: user.full_name, avatarUrl: user.avatar_url, role: user.role, storeVisits: user.store_visits || 0 },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Update user profile information
   */
  async updateUserProfile(userId, data) {
    const { fullName, phone, address, themePreference, preferences } = data;
    const query = `
      UPDATE users 
      SET full_name = COALESCE($1, full_name),
          phone = COALESCE($2, phone),
          address = COALESCE($3, address),
          theme_preference = COALESCE($4, theme_preference),
          preferences = COALESCE($5, preferences),
          updated_at = NOW()
      WHERE id = $6
      RETURNING id, email, full_name, phone, address, theme_preference, preferences
    `;
    const result = await db.query(query, [fullName, phone, address, themePreference, preferences, userId]);
    return result.rows[0];
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId, preferences) {
    const query = 'UPDATE users SET preferences = $1, updated_at = NOW() WHERE id = $2 RETURNING id, preferences';
    const result = await db.query(query, [preferences, userId]);
    return result.rows[0];
  }

  /**
   * Change user password with security verification
   */
  async updateUserPassword(userId, currentPassword, newPassword) {
    // Get current user password
    const userResult = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user || !user.password_hash) {
      return { success: false, error: 'Password not set for this account (OAuth user?)' };
    }

    // Verify current password
    const isValid = await this.verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return { success: false, error: 'Incorrect current password' };
    }

    // Hash and update new password
    const newHash = await this.hashPassword(newPassword);
    await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, userId]);

    return { success: true };
  }

  /**
   * Permanently delete a user account and revoke all tokens
   */
  async deleteUser(userId) {
    await db.query('BEGIN');
    try {
      // 1. Get user email before deletion (for login_attempts which lacks user_id)
      const userRes = await db.query('SELECT email FROM users WHERE id = $1', [userId]);
      const email = userRes.rows[0]?.email;

      if (email) {
        // 2. Delete login attempts (not linked by FK, uses email)
        await db.query('DELETE FROM login_attempts WHERE email = $1', [email]);
      }

      // 3. Delete the user (This will cascade to refresh_tokens, bag_items, cart_items, and search_history)
      const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
      
      await db.query('COMMIT');
      return { success: result.rows.length > 0 };
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('deleteUser service error:', error);
      throw error;
    }
  }

  /**
   * Increment store visits count
   */
  async incrementStoreVisits(userId) {
    const query = 'UPDATE users SET store_visits = store_visits + 1 WHERE id = $1 RETURNING store_visits';
    const result = await db.query(query, [userId]);
    return result.rows[0]?.store_visits || 0;
  }
}

module.exports = new AuthService();
