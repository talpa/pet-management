import express from 'express';
import { AnimalSpeciesController } from '../controllers/animalSpeciesController';

const router = express.Router();

// Animal Species routes
router.get('/species', AnimalSpeciesController.getAll);
router.get('/species/categories', AnimalSpeciesController.getCategories);
router.get('/species/:id', AnimalSpeciesController.getById);
router.post('/species', AnimalSpeciesController.create);
router.put('/species/:id', AnimalSpeciesController.update);
router.delete('/species/:id', AnimalSpeciesController.delete);

export default router;