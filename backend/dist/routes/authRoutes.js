"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const auditMiddleware_1 = require("../middleware/auditMiddleware");
const router = (0, express_1.Router)();
const handleOAuthError = (err, req, res, next) => {
    console.error('OAuth Error:', err);
    (0, authController_1.loginFailure)(req, res);
};
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport_1.default.authenticate('google', { session: false }), handleOAuthError, authController_1.loginSuccess);
router.get('/facebook', passport_1.default.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport_1.default.authenticate('facebook', { session: false }), handleOAuthError, authController_1.loginSuccess);
router.get('/user', auth_1.authenticateToken, (0, auditMiddleware_1.auditMiddleware)('GET_CURRENT_USER', 'auth'), authController_1.getCurrentUser);
router.post('/verify', (0, auditMiddleware_1.auditMiddleware)('VERIFY_TOKEN', 'auth'), authController_1.verifyToken);
router.post('/login', (0, auditMiddleware_1.auditMiddleware)('USER_LOGIN', 'auth'), authController_1.classicLogin);
router.post('/register', (0, auditMiddleware_1.auditMiddleware)('USER_REGISTER', 'auth'), authController_1.classicRegister);
router.post('/logout', (0, auditMiddleware_1.auditMiddleware)('USER_LOGOUT', 'auth'), authController_1.logout);
exports.default = router;
