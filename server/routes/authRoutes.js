const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);

// OTP and Password routes for Google OAuth users
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/set-password', authController.setPassword);

// Google OAuth routes - lazy load passport only when needed
router.get('/google', (req, res, next) => {
  try {
    const passport = require('../config/passport');
    passport.authenticate('google', { 
      scope: ['profile', 'email'] 
    })(req, res, next);
  } catch (error) {
    console.error('Google OAuth not configured:', error.message);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.status(302).location(frontendUrl + '/login?error=google_not_configured').end();
  }
});

// Google OAuth callback - return JSON response untuk frontend handle redirect
router.get('/google/callback', 
  (req, res, next) => {
    try {
      const passport = require('../config/passport');
      // Custom callback untuk Passport
      passport.authenticate('google', { 
        session: false
      }, (err, user, info) => {
        if (err) {
          console.error('❌ Passport authenticate error:', err);
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          return res.status(401).json({ success: false, error: 'Authentication error' });
        }
        if (!user) {
          console.error('❌ No user from passport:', info);
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          return res.status(401).json({ success: false, error: 'User not found' });
        }
        console.log('✅ Passport authenticated user:', user.email);
        // Attach user ke req dan lanjutkan ke controller
        req.user = user;
        next();
      })(req, res, next);
    } catch (error) {
      console.error('❌ Google OAuth callback route error:', error.message);
      return res.status(500).json({ success: false, error: 'Google OAuth not configured' });
    }
  },
  authController.googleCallback
);

module.exports = router;