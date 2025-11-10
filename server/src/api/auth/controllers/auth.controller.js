import AuthService from '../services/auth.service.js';

export default class AuthController {
  static async registration(req, res, next) {
    try {
      const { email, password, referralCode } = req.body;
      const ip = req.ip;
      const userData = await AuthService.registration(
        email,
        password,
        ip,
        referralCode,
      );
      return res.status(201).json(userData);
    } catch (error) {
      next(error);
    }
  }

  static async registrationWithReferral(req, res, next) {
    try {
      const { email, password } = req.body;
      const { referralCode } = req.params;
      const ip = req.ip;
      const userData = await AuthService.registration(
        email,
        password,
        ip,
        referralCode,
      );
      return res.status(201).json(userData);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const ip = req.ip;
      const userData = await AuthService.login(email, password, ip);
      return res.status(200).json(userData);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      return res
        .status(200)
        .json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      return res
        .status(200)
        .json({ success: true, message: 'Logged out successfully' });
    }
  }

  static async verifyEmail(req, res, next) {
    try {
      const { otpCode } = req.body;
      const { tokens, user, message } = await AuthService.verifyEmail(otpCode);
      res
        .status(200)
        .json({
          message,
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
    } catch (error) {
      next(error);
    }
  }

  static async resendOtp(req, res, next) {
    try {
      const { email } = req.body;
      const userData = await AuthService.resendOtp(email);
      return res.status(200).json(userData);
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const userData = await AuthService.forgotPassword(email);
      return res.status(200).json(userData);
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtpForResetPassword(req, res, next) {
    try {
      const { otpCode } = req.body;
      const userData = await AuthService.verifyOtpForResetPassword(otpCode);
      res.status(200).json(userData);
    } catch (error) {
      next(error);
    }
  }

  static async resendOtpForResetPasword(req, res, next) {
    try {
      const { email } = req.body;
      const userData = await AuthService.resendOtpForResetPasword(email);
      return res.status(200).json(userData);
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { resetToken, newPassword } = req.body;
      const result = await AuthService.resetPassword(resetToken, newPassword);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async validateAccessToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const err = new Error('Access token not provided');
        err.status = 401;
        throw err;
      }

      const token = authHeader.split(' ')[1];
      const userData = await AuthService.validateAccessToken(token);
      return res
        .status(200)
        .json({
          success: true,
          message: 'Access token is valid',
          user: userData,
        });
    } catch (error) {
      next(error);
    }
  }

  static async validateRefreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        const err = new Error('Refresh token not provided');
        err.status = 401;
        throw err;
      }
      const userData = await AuthService.validateRefreshToken(refreshToken);
      return res
        .status(200)
        .json({
          success: true,
          message: 'Refresh token is valid',
          user: userData,
        });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        const err = new Error('Refresh token not found. Please login again.');
        err.status = 401;
        throw err;
      }
      const userData = await AuthService.refreshToken(refreshToken);
      return res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        accessToken: userData.accessToken,
        refreshToken: userData.refreshToken,
        user: userData.user,
      });
    } catch (error) {
      next(error);
    }
  }
}
