import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword,
} from '../controllers/userController';
import { validateUser } from '../middleware/validation';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Všechny user management routes vyžadují admin práva
router.use(authenticateToken);
router.use(requireAdmin);

// Routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', validateUser, createUser);
router.put('/:id', validateUser, updateUser);
router.put('/:id/password', changeUserPassword);
router.delete('/:id', deleteUser);

export default router;