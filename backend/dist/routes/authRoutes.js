"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const handleOAuthError = (err, req, res, next) => {
    console.error('OAuth Error:', err);
    (0, authController_1.loginFailure)(req, res);
};
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport_1.default.authenticate('google', { session: false }), handleOAuthError, authController_1.loginSuccess);
router.get('/facebook', passport_1.default.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport_1.default.authenticate('facebook', { session: false }), handleOAuthError, authController_1.loginSuccess);
router.get('/user', auth_1.authenticateToken, authController_1.getCurrentUser);
router.post('/logout', authController_1.logout);
router.post('/verify', authController_1.verifyToken);
router.post('/login', authController_1.classicLogin);
router.post('/register', authController_1.classicRegister);
exports.default = router;
