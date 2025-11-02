import express from 'express';
import { AnimalController } from '../controllers/animalController';
import { uploadAnimalImages } from '../middleware/upload';
import { authenticateToken, requireOwnershipOrAdmin, canCreateAnimals } from '../middleware/auth';

const router = express.Router();

// Optional auth middleware - passes user info if available, but doesn't require it
const optionalAuth = async (req: any, res: any, next: any) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    const userId = req.headers['x-user-id'];
    
    if (token) {
      // If token exists, try to verify it
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      const { User } = require('../models/User');
      const user = await User.findByPk(decoded.id);
      if (user) {
        req.userId = user.id;
        req.user = user;
      }
    } else if (userId && !isNaN(parseInt(userId as string))) {
      // Fallback to x-user-id header
      req.userId = parseInt(userId as string, 10);
    }
    
    next();
  } catch (error) {
    // On auth error, continue without user info (public access)
    console.log('Optional auth failed, continuing as public:', error);
    next();
  }
};

// Public routes with optional auth
router.get('/', optionalAuth, AnimalController.getAll); // Public gallery with optional user context

// Protected route for user's own animals (must be before /:id route)
router.get('/my', authenticateToken, AnimalController.getMyAnimals); // Only authenticated user's animals

router.get('/by-seo/:seoUrl', AnimalController.getBySeoUrl); // Public animal detail
router.get('/:id', AnimalController.getById); // Public animal detail

// QR Code public route
router.get('/:id/qrcode', AnimalController.generateQRCode);

// Protected routes (auth required)
router.post('/', authenticateToken, AnimalController.create); // Only authenticated users can create
router.put('/:id', authenticateToken, requireOwnershipOrAdmin, AnimalController.update); // Only owner or admin can update
router.delete('/:id', authenticateToken, requireOwnershipOrAdmin, AnimalController.delete); // Only owner or admin can delete

// Image management (requires ownership or admin)
router.post('/:id/images', authenticateToken, requireOwnershipOrAdmin, uploadAnimalImages.array('images', 10), AnimalController.uploadImages);
router.delete('/:id/images/:imageId', authenticateToken, requireOwnershipOrAdmin, AnimalController.deleteImage);
router.put('/:id/images/:imageId/primary', authenticateToken, requireOwnershipOrAdmin, AnimalController.setPrimaryImage);

// QR Code management (requires ownership or admin)
router.post('/:id/qr-code', authenticateToken, requireOwnershipOrAdmin, AnimalController.generateQRCode);

// SEO URL routes (public check, admin suggest)
router.get('/check-seo-url/:seoUrl', AnimalController.checkSeoUrl);
router.post('/suggest-seo-url', authenticateToken, AnimalController.suggestSeoUrl);

export default router;