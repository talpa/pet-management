"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seedDatabase_1 = require("../scripts/seedDatabase");
const uploadImages_1 = require("../scripts/uploadImages");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.use(auth_1.requireAdmin);
router.post('/seed-database', async (req, res) => {
    try {
        console.log('🌱 Admin database seed request from user:', req.user?.email);
        const result = await (0, seedDatabase_1.clearAndSeedDatabase)();
        res.json({
            success: true,
            message: 'Databáze byla úspěšně vyčištěna a naplněna testovacími daty',
            data: result
        });
    }
    catch (error) {
        console.error('❌ Chyba při seed databáze:', error);
        res.status(500).json({
            success: false,
            message: 'Nepodařilo se vyčistit a naplnit databázi',
            error: error instanceof Error ? error.message : 'Neznámá chyba'
        });
    }
});
router.get('/database-stats', async (req, res) => {
    try {
        const { User } = await Promise.resolve().then(() => __importStar(require('../models/User')));
        const AnimalSpecies = await Promise.resolve().then(() => __importStar(require('../models/AnimalSpecies')));
        const Animal = await Promise.resolve().then(() => __importStar(require('../models/Animal')));
        const AnimalImage = await Promise.resolve().then(() => __importStar(require('../models/AnimalImage')));
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
    }
    catch (error) {
        console.error('❌ Chyba při získávání statistik:', error);
        res.status(500).json({
            success: false,
            message: 'Nepodařilo se získat statistiky databáze',
            error: error instanceof Error ? error.message : 'Neznámá chyba'
        });
    }
});
router.post('/upload-images', async (req, res) => {
    try {
        console.log(`🖼️ Admin ${req.user?.email} spouští upload obrázků...`);
        const result = await (0, uploadImages_1.uploadRealImages)();
        res.json({
            success: true,
            message: 'Obrázky byly úspěšně staženy a nahrány',
            data: result
        });
    }
    catch (error) {
        console.error('❌ Chyba při uploadu obrázků:', error);
        res.status(500).json({
            success: false,
            message: 'Nepodařilo se nahrát obrázky',
            error: error instanceof Error ? error.message : 'Neznámá chyba'
        });
    }
});
exports.default = router;
