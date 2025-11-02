import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface AuthenticatedRequest extends Request {
  userId?: number;
  user?: any;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// JWT Token authentication middleware
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      // Fallback to the original x-user-id header for backward compatibility
      const userId = req.headers['x-user-id'];
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required. Please provide a token or x-user-id header.',
        });
        return;
      }

      // Set userId in request for use in controllers (backward compatibility)
      req.userId = parseInt(userId as string, 10);
      
      if (isNaN(req.userId)) {
        res.status(401).json({
          success: false,
          message: 'Invalid user ID format',
        });
        return;
      }

      // Load user from database for x-user-id header
      const user = await User.findByPk(req.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found',
        });
        return;
      }
      
      req.user = user;
      next();
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get user from database
    const user = await User.findByPk(decoded.id);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Set user data in request
    req.userId = user.id;
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Middleware to check if user has specific permission
export const requirePermission = (permissionName: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // This would typically check user permissions from database
      // For demo purposes, we'll assume all authenticated users have all permissions
      console.log(`Checking permission: ${permissionName} for user: ${req.userId}`);
      next();
    } catch (error) {
      res.status(403).json({
        success: false,
        message: `Permission '${permissionName}' required`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
};

// Middleware pro ověření admin role
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Přístup odepřen. Prosím přihlaste se.'
      });
      return;
    }

    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Přístup odepřen. Pouze administrátoři mají přístup k této funkci.'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba autorizace'
    });
  }
};

// Middleware pro kontrolu vlastnictví zvířete (user může upravovat jen svoje zvířata)
export const requireOwnershipOrAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Přístup odepřen. Prosím přihlaste se.'
      });
      return;
    }

    // Admin má přístup ke všemu
    if (req.user.role === 'admin') {
      return next();
    }

    // Pro běžné uživatele kontrolujeme vlastnictví
    const animalId = req.params.id;
    if (animalId) {
      const { Animal } = require('../models/animalAssociations');
      const animal = await Animal.findByPk(animalId);
      
      if (!animal) {
        res.status(404).json({
          success: false,
          message: 'Zvíře nenalezeno.'
        });
        return;
      }

      if (animal.ownerId !== req.user.id) {
        res.status(403).json({
          success: false,
          message: 'Přístup odepřen. Můžete upravovat pouze svá vlastní zvířata.'
        });
        return;
      }
    }

    next();
  } catch (error) {
    console.error('Ownership auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba autorizace'
    });
  }
};

// Helper pro kontrolu, zda user může vytvářet zvířata
export const canCreateAnimals = (user: any): boolean => {
  return user && (user.role === 'admin' || user.role === 'user');
};

// Helper pro kontrolu, zda user může vidět všechna zvířata
export const canViewAllAnimals = (user: any): boolean => {
  return user && user.role === 'admin';
};