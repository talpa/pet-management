"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.classicRegister = exports.classicLogin = exports.verifyToken = exports.logout = exports.getCurrentUser = exports.loginFailure = exports.loginSuccess = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3300';
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};
const loginSuccess = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication failed',
            });
            return;
        }
        const token = generateToken(req.user);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Login Successful</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .success { color: green; }
            .info { color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h2 class="success">✅ Přihlášení úspěšné!</h2>
          <p class="info">Toto okno se automaticky zavře...</p>
          
          <script>
            console.log('OAuth Success page loaded');
            console.log('User data:', ${JSON.stringify(req.user)});
            
            // Close popup and notify parent window
            function closePopup() {
              try {
                if (window.opener && !window.opener.closed) {
                  console.log('Sending postMessage to parent window');
                  
                  // Send message to specific origin for security
                  window.opener.postMessage({ 
                    type: 'OAUTH_SUCCESS',
                    user: ${JSON.stringify(req.user)},
                    timestamp: Date.now()
                  }, '${CLIENT_URL}');
                  
                  console.log('PostMessage sent, waiting before close...');
                  
                  // Wait a bit longer to ensure message is received
                  setTimeout(() => {
                    console.log('Closing popup window now');
                    window.close();
                  }, 1000);
                } else {
                  console.log('No opener or opener closed, using redirect fallback');
                  // Fallback redirect for non-popup flow
                  window.location.href = '${CLIENT_URL}?auth=success';
                }
              } catch (e) {
                console.error('Error in popup flow:', e);
                // Force close after error
                setTimeout(() => {
                  console.log('Force closing popup after error');
                  window.close();
                }, 1500);
              }
            }
            
            // Try to close immediately and also set backup timers
            closePopup();
            
            // Backup auto-close in case postMessage fails
            setTimeout(() => {
              console.log('Backup auto-close triggered');
              window.close();
            }, 3000);
            
            // Manual close button backup
            document.addEventListener('DOMContentLoaded', function() {
              setTimeout(() => {
                if (!window.closed) {
                  document.body.innerHTML += '<br><button onclick="window.close()" style="padding: 10px 20px; margin-top: 20px;">Zavřít okno ručně</button>';
                }
              }, 2000);
            });
          </script>
        </body>
      </html>
    `);
    }
    catch (error) {
        console.error('Login success error:', error);
        res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Login Error</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_ERROR' }, '${CLIENT_URL}');
              window.close();
            } else {
              window.location.href = '${CLIENT_URL}?auth=error';
            }
          </script>
          <p>Login failed. This window should close automatically...</p>
        </body>
      </html>
    `);
    }
};
exports.loginSuccess = loginSuccess;
const loginFailure = async (req, res) => {
    console.error('OAuth login failure');
    res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Login Error</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .error { color: red; }
          .info { color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h2 class="error">❌ Chyba přihlášení</h2>
        <p class="info">Toto okno se automaticky zavře...</p>
        
        <script>
          console.log('OAuth Error page loaded');
          
          function closePopup() {
            try {
              if (window.opener && !window.opener.closed) {
                console.log('Sending error postMessage to parent window');
                window.opener.postMessage({ 
                  type: 'OAUTH_ERROR',
                  error: 'Authentication failed',
                  timestamp: Date.now()
                }, '${CLIENT_URL}');
                
                setTimeout(() => {
                  console.log('Closing error popup');
                  window.close();
                }, 1000);
              } else {
                console.log('No opener, using redirect fallback');
                window.location.href = '${CLIENT_URL}?auth=error';
              }
            } catch (e) {
              console.error('Error in popup error flow:', e);
              setTimeout(() => window.close(), 1500);
            }
          }
          
          closePopup();
          
          // Backup auto-close
          setTimeout(() => {
            console.log('Backup error auto-close');
            window.close();
          }, 3000);
        </script>
      </body>
    </html>
  `);
};
exports.loginFailure = loginFailure;
const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
            return;
        }
        const user = await User_1.User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email', 'role', 'status', 'provider', 'avatar'],
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.getCurrentUser = getCurrentUser;
const logout = async (req, res) => {
    try {
        res.clearCookie('token');
        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.logout = logout;
const verifyToken = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'No token provided',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await User_1.User.findByPk(decoded.id, {
            attributes: ['id', 'name', 'email', 'role', 'status', 'provider', 'avatar'],
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
            return;
        }
        res.json({
            success: true,
            data: {
                user,
                token,
            },
        });
    }
    catch (error) {
        console.error('Verify token error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
};
exports.verifyToken = verifyToken;
const classicLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email a heslo jsou povinné',
            });
            return;
        }
        const user = await User_1.User.findOne({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Neplatný email nebo heslo',
            });
            return;
        }
        if (!user.password) {
            res.status(401).json({
                success: false,
                message: 'Tento účet je registrován přes sociální sítě. Použijte přihlášení přes Google, Facebook nebo Microsoft.',
            });
            return;
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({
                success: false,
                message: 'Neplatný email nebo heslo',
            });
            return;
        }
        if (user.status !== 'active') {
            res.status(401).json({
                success: false,
                message: 'Účet není aktivní',
            });
            return;
        }
        const token = generateToken(user);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        await user.update({ lastLoginAt: new Date() });
        res.json({
            success: true,
            message: 'Přihlášení úspěšné',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                },
            },
        });
    }
    catch (error) {
        console.error('Classic login error:', error);
        res.status(500).json({
            success: false,
            message: 'Chyba serveru',
        });
    }
};
exports.classicLogin = classicLogin;
const classicRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: 'Jméno, email a heslo jsou povinné',
            });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({
                success: false,
                message: 'Heslo musí mít alespoň 6 znaků',
            });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                message: 'Neplatný email formát',
            });
            return;
        }
        const existingUser = await User_1.User.findOne({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'Uživatel s tímto emailem již existuje',
            });
            return;
        }
        const saltRounds = 12;
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        const newUser = await User_1.User.create({
            name: name.trim(),
            email: email.toLowerCase(),
            password: hashedPassword,
            provider: 'local',
            status: 'active',
            role: 'user',
            avatar: undefined,
        });
        console.log('New user registered:', newUser.id, newUser.email);
        res.status(201).json({
            success: true,
            message: 'Registrace úspěšná! Můžete se nyní přihlásit.',
            data: {
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                },
            },
        });
    }
    catch (error) {
        console.error('Classic register error:', error);
        res.status(500).json({
            success: false,
            message: 'Chyba serveru při registraci',
        });
    }
};
exports.classicRegister = classicRegister;
