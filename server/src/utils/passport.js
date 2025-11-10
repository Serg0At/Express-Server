import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from '../config/variables.config.js';
import Users from '../models/Auth.js';

const { GOOGLE_OAUTH } = config;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_OAUTH.CLIENT_ID,
      clientSecret: GOOGLE_OAUTH.CLIENT_SECRET,
      callbackURL: GOOGLE_OAUTH.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth profile received:', {
          provider_id: profile.id,
          email: profile.emails[0].value,
          displayName: profile.displayName,
        });

        // Pass the entire profile to the controller
        return done(null, profile);
      } catch (error) {
        console.error('Google OAuth strategy error:', error);
        return done(error, null);
      }
    },
  ),
);

// These are required but won't be used since we're using session: false
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Users.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
