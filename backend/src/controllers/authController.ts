import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Use bcryptjs instead of bcrypt
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3300';

// Generate JWT token
const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions
  );
};

// Login success callback (after OAuth)
export const loginSuccess = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('🔐 OAuth login success callback');
    console.log('👤 User object:', req.user);
    
    if (!req.user) {
      console.log('❌ No user object in request');
      res.status(401).json({
        success: false,
        message: 'Authentication failed',
      });
      return;
    }

    const token = generateToken(req.user);
    console.log('🎫 Generated JWT token for user:', req.user.email);
    
    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Přímé přesměrování na hlavní stránku - žádné popup
    console.log('✅ OAuth success - redirecting directly to main page');
    res.redirect(`${CLIENT_URL}?auth=success&timestamp=${Date.now()}`);
    
  } catch (error) {
    console.error('❌ Login success error:', error);
    res.redirect(`${CLIENT_URL}?auth=error&timestamp=${Date.now()}`);
  }
};

// Login failure callback
export const loginFailure = async (req: Request, res: Response): Promise<void> => {
  console.error('OAuth login failure');
  // Přímé přesměrování na hlavní stránku s chybou
  res.redirect(`${CLIENT_URL}?auth=error&timestamp=${Date.now()}`);
};

// Get current user
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'status', 'provider', 'avatar'],
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear the token cookie
    res.clearCookie('token');
    
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Verify token endpoint
export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔍 Verify token endpoint called');
    console.log('🍪 Cookies:', req.cookies);
    console.log('🔑 Authorization header:', req.headers.authorization);
    
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      console.log('❌ No token provided');
      res.status(401).json({
        success: false,
        message: 'No token provided',
      });
      return;
    }

    console.log('🔍 Token found, verifying...');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('✅ Token decoded:', decoded);
    
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'role', 'status', 'provider', 'avatar'],
    });

    if (!user) {
      console.log('❌ User not found for token');
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
      return;
    }

    console.log('✅ Token verification successful for user:', user.email);
    res.json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('❌ Verify token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

// Classic login with email/password
export const classicLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email a heslo jsou povinné',
      });
      return;
    }

    // Find user by email
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Neplatný email nebo heslo',
      });
      return;
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.password) {
      res.status(401).json({
        success: false,
        message: 'Tento účet je registrován přes sociální sítě. Použijte přihlášení přes Google, Facebook nebo Microsoft.',
      });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Neplatný email nebo heslo',
      });
      return;
    }

    // Check if user is active
    if (user.status !== 'active') {
      res.status(401).json({
        success: false,
        message: 'Účet není aktivní',
      });
      return;
    }

    // Generate token
    const token = generateToken(user);
    
    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    res.json({
      success: true,
      message: 'Přihlášení úspěšné',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    console.error('Classic login error:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba serveru',
    });
  }
};

// Classic registration with email/password
export const classicRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Jméno, email a heslo jsou povinné',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Heslo musí mít alespoň 6 znaků',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Neplatný email formát',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Uživatel s tímto emailem již existuje',
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      provider: 'local',
      status: 'active',
      role: 'user',
      avatar: undefined, // Use undefined instead of null for TypeScript
    });

    console.log('New user registered:', newUser.id, newUser.email);

    res.status(201).json({
      success: true,
      message: 'Registrace úspěšná! Můžete se nyní přihlásit.',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });
  } catch (error) {
    console.error('Classic register error:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba serveru při registraci',
    });
  }
};