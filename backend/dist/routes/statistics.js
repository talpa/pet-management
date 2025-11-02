"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const statisticsController_1 = require("../controllers/statisticsController");
const auth_1 = require("../middleware/auth");
const auditMiddleware_1 = require("../middleware/auditMiddleware");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/page-visits', (0, auditMiddleware_1.logAdminAction)('VIEW_PAGE_STATS', 'statistics'), statisticsController_1.getPageVisitStats);
router.get('/animals', (0, auditMiddleware_1.logAdminAction)('VIEW_ANIMAL_STATS', 'statistics'), statisticsController_1.getAnimalStats);
router.get('/locations', (0, auditMiddleware_1.logAdminAction)('VIEW_LOCATION_STATS', 'statistics'), statisticsController_1.getLocationStats);
router.get('/system', (0, auditMiddleware_1.logAdminAction)('VIEW_SYSTEM_STATS', 'statistics'), statisticsController_1.getSystemStats);
router.post('/save', (0, auditMiddleware_1.logAdminAction)('SAVE_STATISTIC', 'statistics'), statisticsController_1.saveStatistic);
router.get('/stored', (0, auditMiddleware_1.logAdminAction)('VIEW_STORED_STATS', 'statistics'), statisticsController_1.getStoredStats);
exports.default = router;
