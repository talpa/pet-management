import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Všechny profile routes vyžadují autentifikaci
router.use(authenticateToken);

// Routes
router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', changePassword);

export default router;