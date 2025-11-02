"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const animalController_1 = require("../controllers/animalController");
const upload_1 = require("../middleware/upload");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
        const userId = req.headers['x-user-id'];
        if (token) {
            const jwt = require('jsonwebtoken');
            const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
            const decoded = jwt.verify(token, JWT_SECRET);
            const { User } = require('../models/User');
            const user = await User.findByPk(decoded.id);
            if (user) {
                req.userId = user.id;
                req.user = user;
            }
        }
        else if (userId && !isNaN(parseInt(userId))) {
            req.userId = parseInt(userId, 10);
        }
        next();
    }
    catch (error) {
        console.log('Optional auth failed, continuing as public:', error);
        next();
    }
};
router.get('/', optionalAuth, animalController_1.AnimalController.getAll);
router.get('/my', auth_1.authenticateToken, animalController_1.AnimalController.getMyAnimals);
router.get('/by-seo/:seoUrl', animalController_1.AnimalController.getBySeoUrl);
router.get('/:id', animalController_1.AnimalController.getById);
router.get('/:id/qrcode', animalController_1.AnimalController.generateQRCode);
router.post('/', auth_1.authenticateToken, animalController_1.AnimalController.create);
router.put('/:id', auth_1.authenticateToken, auth_1.requireOwnershipOrAdmin, animalController_1.AnimalController.update);
router.delete('/:id', auth_1.authenticateToken, auth_1.requireOwnershipOrAdmin, animalController_1.AnimalController.delete);
router.post('/:id/images', auth_1.authenticateToken, auth_1.requireOwnershipOrAdmin, upload_1.uploadAnimalImages.array('images', 10), animalController_1.AnimalController.uploadImages);
router.delete('/:id/images/:imageId', auth_1.authenticateToken, auth_1.requireOwnershipOrAdmin, animalController_1.AnimalController.deleteImage);
router.put('/:id/images/:imageId/primary', auth_1.authenticateToken, auth_1.requireOwnershipOrAdmin, animalController_1.AnimalController.setPrimaryImage);
router.post('/:id/qr-code', auth_1.authenticateToken, auth_1.requireOwnershipOrAdmin, animalController_1.AnimalController.generateQRCode);
router.get('/check-seo-url/:seoUrl', animalController_1.AnimalController.checkSeoUrl);
router.post('/suggest-seo-url', auth_1.authenticateToken, animalController_1.AnimalController.suggestSeoUrl);
exports.default = router;
