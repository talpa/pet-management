import express from 'express';
import { AnimalController } from '../controllers/animalController';
import { uploadAnimalImages } from '../middleware/upload';
import { authenticateToken, requireOwnershipOrAdmin, canCreateAnimals } from '../middleware/auth';

const router = express.Router();

// Public routes (no auth required)
router.get('/', AnimalController.getAll); // Public gallery can see all animals
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