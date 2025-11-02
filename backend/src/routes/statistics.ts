import express from 'express';
import {
  getPageVisitStats,
  getAnimalStats,
  getLocationStats,
  getSystemStats,
  saveStatistic,
  getStoredStats
} from '../controllers/statisticsController';
import { authenticateToken } from '../middleware/auth';
import { logAdminAction } from '../middleware/auditMiddleware';

const router = express.Router();

// Všechny statistiky vyžadují autentifikaci
router.use(authenticateToken);

// Statistiky návštěvnosti stránek (pouze pro adminy)
router.get('/page-visits', logAdminAction('VIEW_PAGE_STATS', 'statistics'), getPageVisitStats);

// Statistiky zvířat (pouze pro adminy)
router.get('/animals', logAdminAction('VIEW_ANIMAL_STATS', 'statistics'), getAnimalStats);

// Statistiky lokací (pouze pro adminy)
router.get('/locations', logAdminAction('VIEW_LOCATION_STATS', 'statistics'), getLocationStats);

// Obecné statistiky systému (pouze pro adminy)
router.get('/system', logAdminAction('VIEW_SYSTEM_STATS', 'statistics'), getSystemStats);

// API pro ukládání statistik (pouze pro adminy)
router.post('/save', logAdminAction('SAVE_STATISTIC', 'statistics'), saveStatistic);

// API pro získání uložených statistik (pouze pro adminy)
router.get('/stored', logAdminAction('VIEW_STORED_STATS', 'statistics'), getStoredStats);

export default router;