"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const animalSpeciesController_1 = require("../controllers/animalSpeciesController");
const router = express_1.default.Router();
router.get('/species', animalSpeciesController_1.AnimalSpeciesController.getAll);
router.get('/species/categories', animalSpeciesController_1.AnimalSpeciesController.getCategories);
router.get('/species/:id', animalSpeciesController_1.AnimalSpeciesController.getById);
router.post('/species', animalSpeciesController_1.AnimalSpeciesController.create);
router.put('/species/:id', animalSpeciesController_1.AnimalSpeciesController.update);
router.delete('/species/:id', animalSpeciesController_1.AnimalSpeciesController.delete);
exports.default = router;
