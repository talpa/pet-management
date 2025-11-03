import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { OAuth2PermissionService } from '../services/oauth2PermissionService';

interface OAuthProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string; verified?: boolean }>;
  photos: Array<{ value: string }>;
  provider: string;
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4444'}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'), false);
        }

        // Check if user already exists
        let user = await User.findOne({
          where: {
            email: email,
          },
        });

        if (user) {
          // Update existing user with Google data
          await user.update({
            provider: 'google',
            providerId: profile.id,
            avatar: profile.photos?.[0]?.value,
            refreshToken: refreshToken,
          });
        } else {
          // Create new user
          user = await User.create({
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

        // Assign permissions based on email/domain
        await OAuth2PermissionService.assignPermissionsToUser(user);

        return done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, false);
      }
    }
  )
);

// Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || '',
      clientSecret: process.env.FACEBOOK_APP_SECRET || '',
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4444'}/api/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'name', 'picture.type(large)'],
      enableProof: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Facebook profile received:', profile);
        
        // Pro Facebook nemusíme mít email - použijeme Facebook ID jako unikátní identifikátor
        const facebookId = profile.id;
        const displayName = profile.displayName || 
                          `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() ||
                          `Facebook User ${facebookId}`;
        
        // Vytvoříme "fake" email pro Facebook uživatele
        const fakeEmail = `facebook_${facebookId}@facebook.local`;

        // Check if user already exists by Facebook ID or fake email
        let user = await User.findOne({
          where: {
            [Op.or]: [
              { providerId: facebookId, provider: 'facebook' },
              { email: fakeEmail }
            ]
          },
        });

        if (user) {
          // Update existing user with Facebook data
          await user.update({
            provider: 'facebook',
            providerId: facebookId,
            avatar: profile.photos?.[0]?.value,
            refreshToken: refreshToken,
          });
        } else {
          // Create new user with fake email
          user = await User.create({
            name: displayName,
            email: fakeEmail,
            provider: 'facebook',
            providerId: facebookId,
            avatar: profile.photos?.[0]?.value,
            refreshToken: refreshToken,
            role: 'user',
            status: 'active',
          });
        }

        // Assign permissions based on user data
        await OAuth2PermissionService.assignPermissionsToUser(user);

        return done(null, user);
      } catch (error) {
        console.error('Facebook OAuth error:', error);
        return done(error, false);
      }
    }
  )
);

export default passport;