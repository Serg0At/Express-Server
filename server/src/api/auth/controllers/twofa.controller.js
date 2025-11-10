import TwoFactorService from '../services/twofa.service.js';

export default class TwoFactorController {
  // Generate secret and otpauth url
  static async generate2FASecretController(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await TwoFactorService.generate2FASecret(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Activate 2FA
  static async activate2FAController(req, res, next) {
    try {
      const userId = req.user.id;
      const { code } = req.body;
      const result = await TwoFactorService.activate2FA(userId, code);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Verify 2FA during login
  static async verify2FAController(req, res, next) {
    try {
      const userId = req.user.id;
      const { code } = req.body;
      const result = await TwoFactorService.verify2FA(userId, code);

      res.json({
        success: true,
        message: '2FA verification successful',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Disable 2FA
  static async disable2FAController(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await TwoFactorService.disable2FA(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
