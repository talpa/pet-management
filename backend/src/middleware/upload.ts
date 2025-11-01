import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const animalImagesDir = path.join(uploadDir, 'animals');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(animalImagesDir)) {
  fs.mkdirSync(animalImagesDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, animalImagesDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `animal-${uniqueSuffix}${extension}`);
  },
});

// File filter to accept only images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'));
  }
};

// Configure multer
export const uploadAnimalImages = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 10, // Max 10 files per upload
  },
});

// Image processing utility
export const processImage = async (inputPath: string, outputPath: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
} = {}) => {
  const {
    width = 800,
    height = 600,
    quality = 85,
    format = 'jpeg'
  } = options;

  try {
    await sharp(inputPath)
      .resize(width, height, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality })
      .toFile(outputPath);
    
    return outputPath;
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
};

// Generate thumbnails
export const generateThumbnail = async (inputPath: string, outputPath: string) => {
  try {
    await sharp(inputPath)
      .resize(200, 200, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
    
    return outputPath;
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    throw new Error('Failed to generate thumbnail');
  }
};

// Cleanup old files
export const deleteImageFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('File deletion error:', error);
    return false;
  }
};

export default uploadAnimalImages;