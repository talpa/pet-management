"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.canViewAllAnimals = exports.canCreateAnimals = exports.requireOwnershipOrAdmin = exports.requireAdmin = exports.requirePermission = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const authenticateToken = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required. Please provide a token or x-user-id header.',
                });
                return;
            }
            req.userId = parseInt(userId, 10);
            if (isNaN(req.userId)) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid user ID format',
                });
                return;
            }
            const user = await User_1.User.findByPk(req.userId);
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }
            req.user = user;
            next();
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await User_1.User.findByPk(decoded.id);
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        req.userId = user.id;
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.authenticateToken = authenticateToken;
const requirePermission = (permissionName) => {
    return async (req, res, next) => {
        try {
            console.log(`Checking permission: ${permissionName} for user: ${req.userId}`);
            next();
        }
        catch (error) {
            res.status(403).json({
                success: false,
                message: `Permission '${permissionName}' required`,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };
};
exports.requirePermission = requirePermission;
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Přístup odepřen. Prosím přihlaste se.'
            });
            return;
        }
        if (req.user.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Přístup odepřen. Pouze administrátoři mají přístup k této funkci.'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Admin auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Chyba autorizace'
        });
    }
};
exports.requireAdmin = requireAdmin;
const requireOwnershipOrAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Přístup odepřen. Prosím přihlaste se.'
            });
            return;
        }
        if (req.user.role === 'admin') {
            return next();
        }
        const animalId = req.params.id;
        if (animalId) {
            const { Animal } = require('../models/animalAssociations');
            const animal = await Animal.findByPk(animalId);
            if (!animal) {
                res.status(404).json({
                    success: false,
                    message: 'Zvíře nenalezeno.'
                });
                return;
            }
            if (animal.ownerId !== req.user.id) {
                res.status(403).json({
                    success: false,
                    message: 'Přístup odepřen. Můžete upravovat pouze svá vlastní zvířata.'
                });
                return;
            }
        }
        next();
    }
    catch (error) {
        console.error('Ownership auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Chyba autorizace'
        });
    }
};
exports.requireOwnershipOrAdmin = requireOwnershipOrAdmin;
const canCreateAnimals = (user) => {
    return user && (user.role === 'admin' || user.role === 'user');
};
exports.canCreateAnimals = canCreateAnimals;
const canViewAllAnimals = (user) => {
    return user && user.role === 'admin';
};
exports.canViewAllAnimals = canViewAllAnimals;
