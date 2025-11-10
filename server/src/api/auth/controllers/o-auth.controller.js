import passport from 'passport';
import OAuthService from '../services/o-auth.service.js';

export default class OAuthController {
  // Step 1: initiate OAuth
  static googleOAuth(req, res, next) {
    // Store referral code in session if provided
    const referralCode = req.query.ref;
    if (referralCode) {
      req.session.referralCode = referralCode;
    }

    passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account',
    })(req, res, next);
  }

  // Step 2: handle callback
  static googleOAuthCallback(req, res, next) {
    passport.authenticate(
      'google',
      { session: false },
      async (err, profile) => {
        try {
          if (err || !profile) {
            return res.redirect(
              `${process.env.CLIENT_URL}/auth/login?message=oauth_failed`,
            );
          }

          const ip = req.ip || req.connection.remoteAddress;
          const referralCode = req.session?.referralCode || null;

          // Clear referral code from session after use
          if (req.session?.referralCode) {
            delete req.session.referralCode;
          }

          const userData = await OAuthService.handleGoogleOAuth(
            profile,
            ip,
            referralCode,
          );

          // Redirect with tokens as query parameters for frontend to handle
          const params = new URLSearchParams({
            accessToken: userData.accessToken,
            refreshToken: userData.refreshToken,
            user: JSON.stringify(userData.user),
          });

          return res.redirect(
            `${process.env.CLIENT_URL}/home?${params.toString()}`,
          );
        } catch (error) {
          next(error);
        }
      },
    )(req, res, next);
  }

  // Disconnect OAuth
  static async disconnectGoogleOAuth(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await OAuthService.disconnectGoogleOAuth(userId);
      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}
