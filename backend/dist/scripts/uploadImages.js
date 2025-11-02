"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRealImages = uploadRealImages;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const Animal_1 = __importDefault(require("../models/Animal"));
const AnimalImage_1 = __importDefault(require("../models/AnimalImage"));
const sharp_1 = __importDefault(require("sharp"));
const ANIMAL_IMAGES = [
    {
        animalName: 'Rex',
        urls: [
            'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=800&h=600&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800&h=600&fit=crop&crop=face'
        ]
    },
    {
        animalName: 'Bella',
        urls: [
            'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop&crop=face'
        ]
    },
    {
        animalName: 'Max',
        urls: [
            'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop&crop=face'
        ]
    },
    {
        animalName: 'Luna',
        urls: [
            'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&h=600&fit=crop&crop=face'
        ]
    },
    {
        animalName: 'Whiskers',
        urls: [
            'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=600&fit=crop&crop=face'
        ]
    },
    {
        animalName: 'Bobík',
        urls: [
            'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&h=600&fit=crop&crop=face'
        ]
    },
    {
        animalName: 'Sněhurka',
        urls: [
            'https://images.unsplash.com/photo-1553736277-055142d018f0?w=800&h=600&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1606425271394-c3ca9aa1b2eb?w=800&h=600&fit=crop&crop=face'
        ]
    },
    {
        animalName: 'Pepíček',
        urls: [
            'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800&h=600&fit=crop&crop=face'
        ]
    },
    {
        animalName: 'Ořešek',
        urls: [
            'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop&crop=face'
        ]
    },
    {
        animalName: 'Zlatíčko',
        urls: [
            'https://images.unsplash.com/photo-1554456854-55a089fd4cb2?w=800&h=600&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800&h=600&fit=crop&crop=face'
        ]
    },
    {
        animalName: 'Duhový',
        urls: [
            'https://images.unsplash.com/photo-1544526226-d4568090ffb8?w=800&h=600&fit=crop&crop=face'
        ]
    },
    {
        animalName: 'Pomalka',
        urls: [
            'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800&h=600&fit=crop&crop=face'
        ]
    }
];
async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs_1.default.createWriteStream(filepath);
        https_1.default.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
            file.on('error', (err) => {
                fs_1.default.unlink(filepath, () => { });
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}
async function processImage(inputPath, outputDir, filename) {
    const outputPath = path_1.default.join(outputDir, filename);
    const thumbnailPath = path_1.default.join(outputDir, `thumb_${filename}`);
    await (0, sharp_1.default)(inputPath)
        .resize(800, 600, {
        fit: 'inside',
        withoutEnlargement: true
    })
        .jpeg({ quality: 85 })
        .toFile(outputPath);
    await (0, sharp_1.default)(inputPath)
        .resize(200, 150, {
        fit: 'cover',
        position: 'centre'
    })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
    return {
        mainPath: outputPath,
        thumbnailPath: thumbnailPath,
        size: fs_1.default.statSync(outputPath).size
    };
}
async function uploadRealImages() {
    try {
        console.log('🖼️ Začínám upload skutečných obrázků zvířat...');
        const uploadsDir = path_1.default.join(__dirname, '../../uploads');
        const animalsDir = path_1.default.join(uploadsDir, 'animals');
        const tempDir = path_1.default.join(uploadsDir, 'temp');
        [uploadsDir, animalsDir, tempDir].forEach(dir => {
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
            }
        });
        console.log(`📁 Složky vytvořeny: ${uploadsDir}`);
        let totalProcessed = 0;
        for (const animalData of ANIMAL_IMAGES) {
            console.log(`\n🐾 Zpracovávám obrázky pro: ${animalData.animalName}`);
            const animal = await Animal_1.default.findOne({
                where: { name: animalData.animalName }
            });
            if (!animal) {
                console.log(`⚠️ Zvíře ${animalData.animalName} nenalezeno v databázi`);
                continue;
            }
            await AnimalImage_1.default.destroy({
                where: { animalId: animal.id }
            });
            for (let i = 0; i < animalData.urls.length; i++) {
                const url = animalData.urls[i];
                const isPrimary = i === 0;
                try {
                    console.log(`  📥 Stahuji obrázek ${i + 1}/${animalData.urls.length}...`);
                    const tempFilename = `temp_${animal.id}_${i}.jpg`;
                    const tempPath = path_1.default.join(tempDir, tempFilename);
                    await downloadImage(url, tempPath);
                    const finalFilename = `animal_${animal.id}_${isPrimary ? 'primary' : `img${i}`}.jpg`;
                    const processed = await processImage(tempPath, animalsDir, finalFilename);
                    await AnimalImage_1.default.create({
                        animalId: animal.id,
                        filename: finalFilename,
                        originalName: `${animalData.animalName}_photo${i > 0 ? i + 1 : ''}.jpg`,
                        processedFilename: finalFilename,
                        thumbnailFilename: `thumb_${finalFilename}`,
                        filePath: `/uploads/animals/${finalFilename}`,
                        size: processed.size,
                        mimeType: 'image/jpeg',
                        isPrimary: isPrimary,
                        uploadedBy: 1,
                        uploadedAt: new Date()
                    });
                    fs_1.default.unlinkSync(tempPath);
                    console.log(`    ✅ Obrázek ${finalFilename} úspěšně zpracován (${Math.round(processed.size / 1024)}KB)`);
                    totalProcessed++;
                }
                catch (error) {
                    console.error(`    ❌ Chyba při zpracování obrázku ${i + 1}:`, error);
                }
            }
        }
        console.log(`\n🎉 Upload dokončen! Zpracováno ${totalProcessed} obrázků`);
        console.log(`📁 Obrázky jsou uloženy v: ${animalsDir}`);
        return { processedImages: totalProcessed };
    }
    catch (error) {
        console.error('❌ Chyba při uploadu obrázků:', error);
        throw error;
    }
}
if (require.main === module) {
    uploadRealImages()
        .then((result) => {
        console.log('✅ Upload obrázků dokončen:', result);
        process.exit(0);
    })
        .catch((error) => {
        console.error('❌ Upload obrázků selhal:', error);
        process.exit(1);
    });
}
