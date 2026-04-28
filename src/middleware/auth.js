const authService = require('../services/auth-service');
const creditsService = require('../services/credits-service');

/**
 * Authentication middleware - verifies JWT access token
 * Usage: router.get('/protected', authenticate, (req, res) => {...})
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = authService.verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Get user data
    const user = await authService.getUserById(decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive'
      });
    }

    const refreshed = await creditsService.maybeRefreshAndGetUser(user.id);

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      phone: user.phone,
      address: user.address,
      preferences: user.preferences,
      themePreference: user.theme_preference,
      planType: refreshed?.plan_type || creditsService.normalizePlanType(user.plan_type),
      credits: refreshed?.credits ?? user.credits,
      creditsLastRefreshed: refreshed?.credits_last_refreshed ?? user.credits_last_refreshed
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Role-based authorization middleware
 * Usage: router.get('/admin', authenticate, authorize('admin'), (req, res) => {...})
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Optional authentication - attaches user if token is valid, but doesn't require it
 * Usage: router.get('/public', optionalAuth, (req, res) => {...})
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyAccessToken(token);
    
    if (decoded) {
      const user = await authService.getUserById(decoded.userId);
      if (user && user.is_active) {
        const refreshed = await creditsService.maybeRefreshAndGetUser(user.id);
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.full_name,
          phone: user.phone,
          address: user.address,
          preferences: user.preferences,
          themePreference: user.theme_preference,
          planType: refreshed?.plan_type || creditsService.normalizePlanType(user.plan_type),
          credits: refreshed?.credits ?? user.credits,
          creditsLastRefreshed: refreshed?.credits_last_refreshed ?? user.credits_last_refreshed
        };
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};
