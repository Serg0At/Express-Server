import UsersService from './user.service.js';
import {
  validateOtpCodeValidation,
  changeNameValidation,
  changeEmailValidation,
  changePasswordValidation,
} from '../../validations/user.validation.js';

export default class UsersController {
  static async getOAuthStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const status = await UsersService.getOAuthStatus(userId);
      return res.json({ success: true, status });
    } catch (error) {
      next(error);
    }
  }

  static async get2FaStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const status = await UsersService.get2FaStatus(userId);
      return res.json({ success: true, status });
    } catch (error) {
      next(error);
    }
  }

  static async getUserData(req, res, next) {
    try {
      const userId = req.user.id;
      const data = await UsersService.getUserData(userId);
      console.log('User data fetched from base'); // Debug log
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }


  static async changeEmail(req, res, next) {
    try {
      const userId = req.user.id;
      const { newEmail } = req.body;

      // Validate input
      const { error } = changeEmailValidation({ newEmail });
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
      }

      const data = await UsersService.changeEmail(userId, newEmail);
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async changeName(req, res, next) {
    try {
      const userId = req.user.id;
      const { newName } = req.body;

      // Validate input
      const { error } = changeNameValidation({ newName });
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
      }

      const data = await UsersService.changeName(userId, newName);
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async uploadAvatar(req, res, next) {
    try {
      const userId = req.user.id;
      const avatarPath = req.file ? req.file.filename : null;

      if (!avatarPath) {
        return res.status(400).json({
          success: false,
          error: 'Avatar file is required',
        });
      }

      const data = await UsersService.updateAvatar(userId, avatarPath);
      return res.json({
        success: true,
        message: 'Avatar updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword, confirmPassword } = req.body;

      // Validate input
      const { error } = changePasswordValidation({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
      }

      const result = await UsersService.changePassword(
        userId,
        oldPassword,
        newPassword,
      );
      return res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req, res, next) {
    try {
      const userId = req.user.id;
      await UsersService.deleteAccount(userId);
      return res.json({ success: true, message: 'Account was removed' });
    } catch (error) {
      next(error);
    }
  }

  static async sendVerify(req, res, next) {
    try {
      const userId = req.user.id;
      const verificationData = await UsersService.sendVerificationCode(userId);

      // Import and use MailSender
      const MailSender = (await import('../../utils/mail-sender.js')).default;
      const mailSender = new MailSender();

      // Send verification email
      await mailSender.sendVerificationEmail(
        verificationData.email,
        verificationData.otpCode,
      );

      return res.json({
        success: true,
        message: 'Verification code sent to your email',
        expiresAt: verificationData.expiresAt,
      });
    } catch (error) {
      next(error);
    }
  }

  static async validateVerify(req, res, next) {
    try {
      const userId = req.user.id;
      const { otpCode } = req.body;

      // Validate input
      const { error } = validateOtpCodeValidation({ otpCode });
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
      }

      const result = await UsersService.validateVerificationCode(
        userId,
        otpCode,
      );

      return res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
