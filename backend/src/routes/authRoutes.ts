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
import { auditMiddleware } from '../middleware/auditMiddleware';
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
router.get('/user', authenticateToken, auditMiddleware('GET_CURRENT_USER', 'auth'), getCurrentUser);
router.post('/verify', auditMiddleware('VERIFY_TOKEN', 'auth'), verifyToken);

// Classic authentication routes
router.post('/login', auditMiddleware('USER_LOGIN', 'auth'), classicLogin);
router.post('/register', auditMiddleware('USER_REGISTER', 'auth'), classicRegister);
router.post('/logout', auditMiddleware('USER_LOGOUT', 'auth'), logout);

export default router;