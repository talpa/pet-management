"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_facebook_1 = require("passport-facebook");
const User_1 = require("../models/User");
const oauth2PermissionService_1 = require("../services/oauth2PermissionService");
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await User_1.User.findByPk(id);
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: `http://localhost:4444/api/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
            return done(new Error('No email found in Google profile'), false);
        }
        let user = await User_1.User.findOne({
            where: {
                email: email,
            },
        });
        if (user) {
            await user.update({
                provider: 'google',
                providerId: profile.id,
                avatar: profile.photos?.[0]?.value,
                refreshToken: refreshToken,
            });
        }
        else {
            user = await User_1.User.create({
                name: profile.displayName,
                email: email,
                provider: 'google',
                providerId: profile.id,
                avatar: profile.photos?.[0]?.value,
                refreshToken: refreshToken,
                role: 'user',
                status: 'active',
            });
        }
        await oauth2PermissionService_1.OAuth2PermissionService.assignPermissionsToUser(user);
        return done(null, user);
    }
    catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, false);
    }
}));
passport_1.default.use(new passport_facebook_1.Strategy({
    clientID: process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '',
    callbackURL: `http://localhost:4444/api/auth/facebook/callback`,
    profileFields: ['id', 'displayName', 'emails', 'photos'],
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
            return done(new Error('No email found in Facebook profile'), false);
        }
        let user = await User_1.User.findOne({
            where: {
                email: email,
            },
        });
        if (user) {
            await user.update({
                provider: 'facebook',
                providerId: profile.id,
                avatar: profile.photos?.[0]?.value,
                refreshToken: refreshToken,
            });
        }
        else {
            user = await User_1.User.create({
                name: profile.displayName,
                email: email,
                provider: 'facebook',
                providerId: profile.id,
                avatar: profile.photos?.[0]?.value,
                refreshToken: refreshToken,
                role: 'user',
                status: 'active',
            });
        }
        await oauth2PermissionService_1.OAuth2PermissionService.assignPermissionsToUser(user);
        return done(null, user);
    }
    catch (error) {
        console.error('Facebook OAuth error:', error);
        return done(error, false);
    }
}));
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map