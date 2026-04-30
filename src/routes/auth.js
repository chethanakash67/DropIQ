const express = require('express');
const router = express.Router();
const passport = require('passport');
const authService = require('../services/auth-service');
const { authenticate } = require('../middleware/auth');
const { normalizePlanType } = require('../services/credits-service');
const db = require('../database/db');


// Simple in-memory rate limiter (use Redis in production for distributed systems)
const rateLimitMap = new Map();

/**
 * Rate limiting middleware
 * Limits: 5 requests per 15 minutes per IP
 */
const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const requests = rateLimitMap.get(ip);

  // Remove expired requests
  const validRequests = requests.filter(time => now - time < windowMs);

  if (validRequests.length >= 5) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.'
    });
  }

  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);

  next();
};

/**
 * Input validation helper
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
  return password && password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);
};

/**
 * POST /api/auth/signup
 * Register new user
 * 
 * Request: { email, password, fullName }
 * Response: { success, user, accessToken, refreshToken }
 */
router.post('/signup', rateLimiter, async (req, res) => {
  try {
    console.log('\n=== SIGNUP REQUEST ===');
    const { email, password, fullName } = req.body;
    console.log('Email:', email);
    console.log('Full Name:', fullName);
    console.log('Password provided:', !!password);

    // Validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    if (!validateEmail(email)) {
      console.log('❌ Invalid email format');
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    if (!validatePassword(password)) {
      console.log('❌ Invalid password format');
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters with uppercase, lowercase, and number'
      });
    }

    console.log('✅ Validation passed');

    // Check if email exists
    console.log('Checking if email exists...');
    const emailExists = await authService.emailExists(email);
    console.log('Email exists:', emailExists);

    if (emailExists) {
      console.log('❌ Email already registered');
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Register user
    console.log('Registering user...');
    const user = await authService.registerUser(email, password, fullName);
    console.log('✅ User registered:', user.id, user.email);

    console.log('✅ User registered:', user.id, user.email);

    // Generate tokens
    console.log('Generating tokens...');
    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user);
    console.log('✅ Tokens generated');

    console.log('Storing refresh token...');
    await authService.storeRefreshToken(user.id, refreshToken);
    console.log('✅ Refresh token stored');

    const responseData = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        planType: normalizePlanType(user.plan_type),
        credits: user.credits
      },
      accessToken,
      refreshToken
    };

    console.log('✅ Signup successful! Sending response...');
    res.status(201).json(responseData);

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user
 * 
 * Request: { email, password }
 * Response: { success, user, accessToken, refreshToken }
 */
router.post('/login', rateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    console.log('\n=== LOGIN REQUEST ===');
    console.log('Email:', email);
    console.log('Password provided:', !!password);
    console.log('IP Address:', ipAddress);

    // Validation
    if (!email || !password) {
      console.log('❌ Validation failed: Missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Check rate limit
    console.log('Checking rate limit...');
    const isRateLimited = await authService.checkRateLimit(email, ipAddress);
    if (isRateLimited) {
      console.log('❌ Rate limited');
      return res.status(429).json({
        success: false,
        error: 'Too many failed login attempts. Please try again in 15 minutes.'
      });
    }

    // Authenticate
    console.log('Attempting authentication...');
    const result = await authService.loginUser(email, password, ipAddress);
    console.log('Auth result:', { success: result.success, error: result.error });

    if (!result.success) {
      console.log('❌ Authentication failed:', result.error);
      return res.status(401).json({
        success: false,
        error: result.error
      });
    }

    console.log('✅ Login successful for user:', result.user.email);
    res.json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 * 
 * Request: { refreshToken }
 * Response: { success, accessToken }
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      accessToken: result.accessToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user and revoke refresh token
 * 
 * Request: { refreshToken }
 * Response: { success, message }
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await authService.revokeRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

/**
 * POST /api/auth/logout-all
 * Logout from all devices (revoke all refresh tokens)
 * 
 * Response: { success, message }
 */
router.post('/logout-all', authenticate, async (req, res) => {
  try {
    await authService.revokeAllUserTokens(req.user.id);

    res.json({
      success: true,
      message: 'Logged out from all devices'
    });

  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 * 
 * Response: { success, user }
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        address: user.address,
        preferences: user.preferences,
        themePreference: user.theme_preference,
        role: user.role,
        planType: req.user.planType || normalizePlanType(user.plan_type),
        credits: req.user.credits ?? user.credits,
        creditsLastRefreshed: user.credits_last_refreshed,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user info'
    });
  }
});

/**
 * GET /api/auth/google
 * Initiate Google OAuth flow
 */
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback, issue JWTs, redirect to frontend
 */
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_failed` }),
  async (req, res) => {
    try {
      const { googleId, email, name, picture } = req.user;
      const result = await authService.loginOrRegisterGoogleUser(googleId, email, name, picture);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}&refresh=${result.refreshToken}`);
    } catch (err) {
      console.error('Google OAuth callback error:', err);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }
);

/**
 * PATCH /api/auth/me
 * Update user profile
 */
router.patch('/me', authenticate, async (req, res) => {
  try {
    const user = await authService.updateUserProfile(req.user.id, req.body);
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        address: user.address,
        preferences: user.preferences,
        themePreference: user.theme_preference
      } 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

/**
 * DELETE /api/auth/me
 * Permanently delete current user account
 */
router.delete('/me', authenticate, async (req, res) => {
  try {
    const result = await authService.deleteUser(req.user.id);
    if (result.success) {
      res.json({ success: true, message: 'Account deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
});

/**
 * DELETE /api/auth/me/data
 * Clear all user shopping data (cart and bag)
 */
router.delete('/me/data', authenticate, async (req, res) => {
  try {
    await itemsService.clearUserItems(req.user.id);
    res.json({ success: true, message: 'Shopping data cleared successfully' });
  } catch (error) {
    console.error('Clear data error:', error);
    res.status(500).json({ success: false, error: 'Failed to clear data' });
  }
});


/**
 * PATCH /api/auth/me/password
 * Change user password
 */
router.patch('/me/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new passwords are required' });
    }
    const result = await authService.updateUserPassword(req.user.id, currentPassword, newPassword);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ success: false, error: 'Failed to update password' });
  }
});

/**
 * PATCH /api/auth/me/preferences
 * Update user shopping preferences
 */
router.patch('/me/preferences', authenticate, async (req, res) => {
  try {
    const { preferences } = req.body;
    await authService.updateUserPreferences(req.user.id, preferences);
    res.json({ success: true, message: 'Preferences updated' });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ success: false, error: 'Failed' });
  }
});

/**
 * POST /api/auth/me/increment-visits
 * Increment the user's store visits count
 */
/**
 * POST /api/auth/me/increment-visits
 * Increment the user's store visits count
 */
router.post('/me/increment-visits', authenticate, async (req, res) => {
  try {
    const visits = await authService.incrementStoreVisits(req.user.id);
    res.json({ success: true, visits });
  } catch (error) {
    console.error('Increment visits error:', error);
    res.status(500).json({ success: false, error: 'Failed to increment visits' });
  }
});

/**
 * POST /api/auth/upgrade-plan
 * Upgrade user's plan and set credits accordingly
 */
router.post('/upgrade-plan', authenticate, async (req, res) => {
  try {
    const { planType } = req.body;
    if (!['pro', 'max', 'premium'].includes(planType)) {
      return res.status(400).json({ success: false, error: 'Invalid plan type' });
    }

    const credits = planType === 'pro' ? 50 : 75;
    
    const query = `
      UPDATE users 
      SET plan_type = $1, 
          credits = credits + $2, 
          credits_last_refreshed = NOW(),
          updated_at = NOW() 
      WHERE id = $3 
      RETURNING id, email, full_name, plan_type, credits, credits_last_refreshed, store_visits
    `;
    
    const result = await db.query(query, [planType, credits, req.user.id]);
    const user = result.rows[0];

    res.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        planType: normalizePlanType(user.plan_type),
        credits: user.credits,
        creditsLastRefreshed: user.credits_last_refreshed,
        storeVisits: user.store_visits || 0
      } 
    });
  } catch (error) {
    console.error('Upgrade plan error:', error);
    res.status(500).json({ success: false, error: 'Failed to upgrade plan' });
  }
});

// Import items service
const itemsService = require('../services/user-items-service');

/**
 * Bag (Wishlist) Endpoints
 */
router.get('/me/bag', authenticate, async (req, res) => {
  try {
    const items = await itemsService.getBag(req.user.id);
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch bag' });
  }
});

router.post('/me/bag', authenticate, async (req, res) => {
  try {
    const item = await itemsService.addToBag(req.user.id, req.body.product);
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to add to bag' });
  }
});

router.delete('/me/bag/:productId', authenticate, async (req, res) => {
  try {
    const { retailer } = req.query;
    await itemsService.removeFromBag(req.user.id, req.params.productId, retailer);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to remove from bag' });
  }
});

router.post('/me/bag/sync', authenticate, async (req, res) => {
  try {
    await itemsService.syncBag(req.user.id, req.body.items);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to sync bag' });
  }
});

/**
 * Cart Sync Endpoints
 */
router.get('/me/cart', authenticate, async (req, res) => {
  try {
    const items = await itemsService.getCart(req.user.id);
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch cart' });
  }
});

router.post('/me/cart/sync', authenticate, async (req, res) => {
  try {
    await itemsService.syncCart(req.user.id, req.body.items);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to sync cart' });
  }
});

module.exports = router;
