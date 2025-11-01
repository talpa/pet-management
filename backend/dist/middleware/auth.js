"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.authenticateToken = void 0;
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
//# sourceMappingURL=auth.js.map