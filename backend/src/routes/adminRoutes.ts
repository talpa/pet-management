import { Router, Request, Response } from 'express';
import { clearAndSeedDatabase } from '../scripts/seedDatabase';
import { uploadRealImages } from '../scripts/uploadImages';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Všechny admin routes vyžadují autentifikaci a admin roli
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * POST /api/admin/seed-database
 * Vyčistí databázi a naplní ji testovacími daty
 * Vyžaduje admin oprávnění
 */
router.post('/seed-database', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🌱 Admin database seed request from user:', (req as any).user?.email);

    const result = await clearAndSeedDatabase();

    res.json({
      success: true,
      message: 'Databáze byla úspěšně vyčištěna a naplněna testovacími daty',
      data: result
    });

  } catch (error) {
    console.error('❌ Chyba při seed databáze:', error);
    res.status(500).json({
      success: false,
      message: 'Nepodařilo se vyčistit a naplnit databázi',
      error: error instanceof Error ? error.message : 'Neznámá chyba'
    });
  }
});

/**
 * GET /api/admin/database-stats
 * Vrátí statistiky databáze
 */
router.get('/database-stats', async (req: Request, res: Response): Promise<void> => {
  try {
    // Import modelů
    const { User } = await import('../models/User');
    const AnimalSpecies = await import('../models/AnimalSpecies');
    const Animal = await import('../models/Animal');
    const AnimalImage = await import('../models/AnimalImage');

    const stats = {
      users: await User.count(),
      species: await AnimalSpecies.default.count(),
      animals: await Animal.default.count(),
      images: await AnimalImage.default.count(),
      activeAnimals: await Animal.default.count({ where: { isActive: true } }),
      activeUsers: await User.count({ where: { status: 'active' } })
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Chyba při získávání statistik:', error);
    res.status(500).json({
      success: false,
      message: 'Nepodařilo se získat statistiky databáze',
      error: error instanceof Error ? error.message : 'Neznámá chyba'
    });
  }
});

/**
 * POST /api/admin/upload-images
 * Stáhne a nahraje skutečné obrázky zvířat
 * Vyžaduje admin oprávnění
 */
router.post('/upload-images', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(`🖼️ Admin ${(req as any).user?.email} spouští upload obrázků...`);

    const result = await uploadRealImages();

    res.json({
      success: true,
      message: 'Obrázky byly úspěšně staženy a nahrány',
      data: result
    });

  } catch (error) {
    console.error('❌ Chyba při uploadu obrázků:', error);
    res.status(500).json({
      success: false,
      message: 'Nepodařilo se nahrát obrázky',
      error: error instanceof Error ? error.message : 'Neznámá chyba'
    });
  }
});

export default router;