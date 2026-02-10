const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
const SALT_ROUNDS = 12;

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
  async registerUser(email, password, fullName = null) {
    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Insert user
    const query = `
      INSERT INTO users (email, password_hash, full_name)
      VALUES ($1, $2, $3)
      RETURNING id, email, full_name, role, created_at
    `;
    
    const result = await db.query(query, [email, passwordHash, fullName]);
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
          role: user.role
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
      SELECT id, email, full_name, role, is_active, email_verified, created_at, last_login
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
}

module.exports = new AuthService();
