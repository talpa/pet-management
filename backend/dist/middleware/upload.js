"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImageFile = exports.generateThumbnail = exports.processImage = exports.uploadAnimalImages = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const uploadDir = path_1.default.join(__dirname, '../../uploads');
const animalImagesDir = path_1.default.join(uploadDir, 'animals');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
if (!fs_1.default.existsSync(animalImagesDir)) {
    fs_1.default.mkdirSync(animalImagesDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, animalImagesDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path_1.default.extname(file.originalname);
        cb(null, `animal-${uniqueSuffix}${extension}`);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'));
    }
};
exports.uploadAnimalImages = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10,
    },
});
const processImage = async (inputPath, outputPath, options = {}) => {
    const { width = 800, height = 600, quality = 85, format = 'jpeg' } = options;
    try {
        await (0, sharp_1.default)(inputPath)
            .resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true
        })
            .jpeg({ quality })
            .toFile(outputPath);
        return outputPath;
    }
    catch (error) {
        console.error('Image processing error:', error);
        throw new Error('Failed to process image');
    }
};
exports.processImage = processImage;
const generateThumbnail = async (inputPath, outputPath) => {
    try {
        await (0, sharp_1.default)(inputPath)
            .resize(200, 200, {
            fit: 'cover',
            position: 'center'
        })
            .jpeg({ quality: 80 })
            .toFile(outputPath);
        return outputPath;
    }
    catch (error) {
        console.error('Thumbnail generation error:', error);
        throw new Error('Failed to generate thumbnail');
    }
};
exports.generateThumbnail = generateThumbnail;
const deleteImageFile = (filePath) => {
    try {
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
            return true;
        }
        return false;
    }
    catch (error) {
        console.error('File deletion error:', error);
        return false;
    }
};
exports.deleteImageFile = deleteImageFile;
exports.default = exports.uploadAnimalImages;
//# sourceMappingURL=upload.js.map