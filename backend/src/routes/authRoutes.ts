import { Router } from 'express';
import passport from 'passport';
import {
  loginSuccess,
  loginFailure,
  getCurrentUser,
  logout,
  verifyToken,
  classicLogin,
  classicRegister,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// OAuth error handler middleware
const handleOAuthError = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('OAuth Error:', err);
  // Redirect to failure handler
  loginFailure(req, res);
};

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  handleOAuthError,
  loginSuccess
);

// Facebook OAuth routes
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  handleOAuthError,
  loginSuccess
);

// Protected routes
router.get('/user', authenticateToken, getCurrentUser);
router.post('/logout', logout);
router.post('/verify', verifyToken);

// Classic authentication routes
router.post('/login', classicLogin);
router.post('/register', classicRegister);

export default router;