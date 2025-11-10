import Users from '../../../models/Auth.js';
import Payload from '../../../utils/payload.js';
import Tokens from '../../../config/jwt.js';
import OAuthModel from '../../../models/OAuth.js';
import createError from '../../../utils/create-error.js';

export default class OAuthService {
  static async handleGoogleOAuth(profile, ip, referralCode = null) {
    try {
      const { id: google_id, displayName, emails, photos } = profile;
      const email = emails?.[0]?.value;
      const avatar = photos?.[0]?.value;

      if (!email) throw createError('Email not provided by Google', 400);

      const user = await OAuthModel.findUserAndUpdate(
        google_id,
        displayName,
        email,
        avatar,
        referralCode,
      );

      const payload = new Payload(user);
      const tokens = Tokens.generateTokens({ ...payload });

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          is_oauth: user.is_oauth,
          is_verified: user.is_verified,
        },
      };
    } catch (error) {
      console.error('Google OAuth handling error:', error);
      throw createError('Failed to process Google OAuth', 500, error);
    }
  }

  static async disconnectGoogleOAuth(userId) {
    const user = await Users.findById(userId);
    if (!user) throw createError('User not found', 404);

    await OAuthModel.disconnectGoogleOAuth(userId); // make sure this is awaited

    return {
      message: 'Google OAuth disconnected successfully',
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
