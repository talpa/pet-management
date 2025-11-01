"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const animalController_1 = require("../controllers/animalController");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
router.get('/', animalController_1.AnimalController.getAll);
router.get('/by-seo/:seoUrl', animalController_1.AnimalController.getBySeoUrl);
router.get('/:id', animalController_1.AnimalController.getById);
router.post('/', animalController_1.AnimalController.create);
router.put('/:id', animalController_1.AnimalController.update);
router.delete('/:id', animalController_1.AnimalController.delete);
router.post('/:id/images', upload_1.uploadAnimalImages.array('images', 10), animalController_1.AnimalController.uploadImages);
router.delete('/:id/images/:imageId', animalController_1.AnimalController.deleteImage);
router.put('/:id/images/:imageId/primary', animalController_1.AnimalController.setPrimaryImage);
router.get('/:id/qrcode', animalController_1.AnimalController.generateQRCode);
router.post('/:id/qr-code', animalController_1.AnimalController.generateQRCode);
router.get('/check-seo-url/:seoUrl', animalController_1.AnimalController.checkSeoUrl);
router.post('/suggest-seo-url', animalController_1.AnimalController.suggestSeoUrl);
exports.default = router;
//# sourceMappingURL=animals.js.map