import fs from 'fs';
import path from 'path';
import https from 'https';
import { sequelize } from '../config/database';
import Animal from '../models/Animal';
import AnimalImage from '../models/AnimalImage';
import sharp from 'sharp';

/**
 * Skript pro stažení a upload skutečných obrázků zvířat
 */

// Krásné obrázky zvířat z Unsplash (volně dostupné)
const ANIMAL_IMAGES = [
  {
    animalName: 'Rex',
    urls: [
      'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=800&h=600&fit=crop&crop=face', // Německý ovčák
      'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800&h=600&fit=crop&crop=face'
    ]
  },
  {
    animalName: 'Bella',
    urls: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop&crop=face', // Zlatý retrívr
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop&crop=face'
    ]
  },
  {
    animalName: 'Max',
    urls: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop&crop=face' // Rottweiler
    ]
  },
  {
    animalName: 'Luna',
    urls: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop&crop=face', // Perská kočka
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&h=600&fit=crop&crop=face'
    ]
  },
  {
    animalName: 'Whiskers',
    urls: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=600&fit=crop&crop=face' // Mainský mýval
    ]
  },
  {
    animalName: 'Bobík',
    urls: [
      'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&h=600&fit=crop&crop=face' // Lop králík
    ]
  },
  {
    animalName: 'Sněhurka',
    urls: [
      'https://images.unsplash.com/photo-1553736277-055142d018f0?w=800&h=600&fit=crop&crop=face', // Bílý králík
      'https://images.unsplash.com/photo-1606425271394-c3ca9aa1b2eb?w=800&h=600&fit=crop&crop=face'
    ]
  },
  {
    animalName: 'Pepíček',
    urls: [
      'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800&h=600&fit=crop&crop=face' // Andulka
    ]
  },
  {
    animalName: 'Ořešek',
    urls: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop&crop=face' // Morče
    ]
  },
  {
    animalName: 'Zlatíčko',
    urls: [
      'https://images.unsplash.com/photo-1554456854-55a089fd4cb2?w=800&h=600&fit=crop&crop=face', // Křeček
      'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800&h=600&fit=crop&crop=face'
    ]
  },
  {
    animalName: 'Duhový',
    urls: [
      'https://images.unsplash.com/photo-1544526226-d4568090ffb8?w=800&h=600&fit=crop&crop=face' // Gupka
    ]
  },
  {
    animalName: 'Pomalka',
    urls: [
      'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800&h=600&fit=crop&crop=face' // Želva
    ]
  }
];

// Funkce pro stažení obrázku
async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
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
        fs.unlink(filepath, () => {}); // Smazat neúplný soubor
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Funkce pro zpracování obrázku (resize a thumbnail)
async function processImage(inputPath: string, outputDir: string, filename: string) {
  const outputPath = path.join(outputDir, filename);
  const thumbnailPath = path.join(outputDir, `thumb_${filename}`);
  
  // Zpracování hlavního obrázku (max 800x600)
  await sharp(inputPath)
    .resize(800, 600, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .jpeg({ quality: 85 })
    .toFile(outputPath);
  
  // Vytvoření thumbnails (200x150)
  await sharp(inputPath)
    .resize(200, 150, { 
      fit: 'cover',
      position: 'centre'
    })
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath);
  
  return {
    mainPath: outputPath,
    thumbnailPath: thumbnailPath,
    size: fs.statSync(outputPath).size
  };
}

export async function uploadRealImages() {
  try {
    console.log('🖼️ Začínám upload skutečných obrázků zvířat...');
    
    // Vytvořit složky pro upload
    const uploadsDir = path.join(__dirname, '../../uploads');
    const animalsDir = path.join(uploadsDir, 'animals');
    const tempDir = path.join(uploadsDir, 'temp');
    
    [uploadsDir, animalsDir, tempDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    console.log(`📁 Složky vytvořeny: ${uploadsDir}`);
    
    let totalProcessed = 0;
    
    // Projít všechna zvířata
    for (const animalData of ANIMAL_IMAGES) {
      console.log(`\n🐾 Zpracovávám obrázky pro: ${animalData.animalName}`);
      
      // Najít zvíře v databázi
      const animal = await Animal.findOne({
        where: { name: animalData.animalName }
      });
      
      if (!animal) {
        console.log(`⚠️ Zvíře ${animalData.animalName} nenalezeno v databázi`);
        continue;
      }
      
      // Smazat existující obrázky
      await AnimalImage.destroy({
        where: { animalId: animal.id }
      });
      
      // Stáhnout a zpracovat každý obrázek
      for (let i = 0; i < animalData.urls.length; i++) {
        const url = animalData.urls[i];
        const isPrimary = i === 0;
        
        try {
          console.log(`  📥 Stahuji obrázek ${i + 1}/${animalData.urls.length}...`);
          
          // Stáhnout do temp složky
          const tempFilename = `temp_${animal.id}_${i}.jpg`;
          const tempPath = path.join(tempDir, tempFilename);
          
          await downloadImage(url, tempPath);
          
          // Zpracovat obrázek
          const finalFilename = `animal_${animal.id}_${isPrimary ? 'primary' : `img${i}`}.jpg`;
          const processed = await processImage(tempPath, animalsDir, finalFilename);
          
          // Vytvořit záznam v databázi
          await AnimalImage.create({
            animalId: animal.id,
            filename: finalFilename,
            originalName: `${animalData.animalName}_photo${i > 0 ? i + 1 : ''}.jpg`,
            processedFilename: finalFilename,
            thumbnailFilename: `thumb_${finalFilename}`,
            filePath: `/uploads/animals/${finalFilename}`,
            size: processed.size,
            mimeType: 'image/jpeg',
            isPrimary: isPrimary,
            uploadedBy: 1, // Admin user
            uploadedAt: new Date()
          });
          
          // Smazat temp soubor
          fs.unlinkSync(tempPath);
          
          console.log(`    ✅ Obrázek ${finalFilename} úspěšně zpracován (${Math.round(processed.size / 1024)}KB)`);
          totalProcessed++;
          
        } catch (error) {
          console.error(`    ❌ Chyba při zpracování obrázku ${i + 1}:`, error);
        }
      }
    }
    
    console.log(`\n🎉 Upload dokončen! Zpracováno ${totalProcessed} obrázků`);
    console.log(`📁 Obrázky jsou uloženy v: ${animalsDir}`);
    
    return { processedImages: totalProcessed };
    
  } catch (error) {
    console.error('❌ Chyba při uploadu obrázků:', error);
    throw error;
  }
}

// Pokud je soubor spuštěn přímo
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