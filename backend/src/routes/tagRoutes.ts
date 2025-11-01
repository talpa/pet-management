import { Router } from 'express';
import { 
  getTags, 
  createTag, 
  updateTag, 
  deleteTag, 
  assignTagsToAnimal, 
  getAnimalTags 
} from '../controllers/tagController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getTags);

// Protected routes (require authentication)
router.use(authenticateToken);

// Animal tag assignments (for users managing their animals)
router.get('/animal/:animalId', getAnimalTags);
router.put('/animal/:animalId', assignTagsToAnimal);

// Admin-only routes for tag management
router.post('/', requireAdmin, createTag);
router.put('/:id', requireAdmin, updateTag);
router.delete('/:id', requireAdmin, deleteTag);

export default router;