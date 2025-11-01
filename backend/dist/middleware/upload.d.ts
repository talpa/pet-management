import multer from 'multer';
export declare const uploadAnimalImages: multer.Multer;
export declare const processImage: (inputPath: string, outputPath: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "jpeg" | "png" | "webp";
}) => Promise<string>;
export declare const generateThumbnail: (inputPath: string, outputPath: string) => Promise<string>;
export declare const deleteImageFile: (filePath: string) => boolean;
export default uploadAnimalImages;
//# sourceMappingURL=upload.d.ts.map