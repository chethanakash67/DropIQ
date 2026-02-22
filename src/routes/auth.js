const express = require('express');
const router = express.Router();
const passport = require('passport');
const authService = require('../services/auth-service');
const { authenticate } = require('../middleware/auth');


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
        role: user.role
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
        role: user.role,
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

module.exports = router;
