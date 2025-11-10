// NPM Modules
import knex from 'knex';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Local Modules
import knexConfigs from '../../../config/knex.configs.js';
import Tokens from '../../../config/jwt.js';

import TwofaService from '../services/twofa.service.js';

import Payload from '../../../utils/payload.js';
import MailSender from '../../../utils/mail-sender.js';
import createError from '../../../utils/create-error.js';
import logger from '../../../utils/logger.js';
import generateRandomName from '../../../utils/generateRandomName.js';

import Users from '../../../models/Auth.js';
import TokenResetPassword from '../../../models/TokenResetPassword.js';
import ReferralModel from '../../../models/Referral.js';
import generateReferralCode from '../../../utils/generateReferralCode.js';

const pg = knex(knexConfigs.development);

export default class AuthService {
  // Registration
  static async registration(email, password, ip, referralCode = null) {
    let trx;
    try {
      trx = await pg.transaction();

      // Check if email already exists in database
      const existingUser = await Users.findByEmail(email);

      if (existingUser) {
        if (existingUser.is_verified === false) {
        } else if (existingUser.is_verified === true) {
          throw createError('User with this email already exists', 409);
        }
      }

      // Validate referral code if provided
      if (referralCode) {
        const referrer = await ReferralModel.validateReferralCode(referralCode);
        if (!referrer) {
          throw createError('Invalid referral code', 400);
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Generate verification token
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      const randomName = generateRandomName();

      const userData = {
        email,
        password: hashedPassword,
        last_login_at: new Date(),
        last_login_ip: ip,
        is_verified: false,
        is_oauth: false,
        is_twofa: false,
        role: 'user',
        provider: null,
        provider_id: null,
        name: randomName,
        avatar_url: null,
        otp_code_expires_at: codeExpiry,
      };

      const [userID] = await Users.register(otpCode, userData, trx);
      const userId = userID.id;
      // Generate and create referral record for the new user
      const userReferralCode = await generateReferralCode(email);
      await ReferralModel.createReferralRecord(
        userId,
        userReferralCode,
        referralCode,
        trx,
      );

      await trx.commit();

      // Send email with token
      const mailSender = new MailSender();
      await mailSender.sendVerificationEmail(email, otpCode);

      return {
        message:
          'Registration successful. Please check your email to verify your account.',
        email,
        referralCode: userReferralCode,
      };
    } catch (error) {
      if (trx) await trx.rollback();
      logger.error(error);
      if (error.status) throw error;
      throw createError('Internal server error during register', 500, error);
    }
  }

  // Verify email after registration
  static async verifyEmail(otpCode) {
    try {
      const userData = await Users.getUserByOtpCode(otpCode);

      if (!userData) {
        throw createError('Invalid or expired verification code', 400);
      }

      const payload = new Payload(userData);
      const tokens = Tokens.generateTokens({ ...payload });

      await Users.saveVerifiedUser(userData.id);

      return {
        tokens,
        user: payload,
        message: 'Email verified successfully!',
      };
    } catch (error) {
      logger.error(error);
      if (error.status) throw error;
      throw createError(
        'Internal server error during verifying otp for email verification',
        500,
        error,
      );
    }
  }

  // Resending OTP code by email
  static async resendOtp(email) {
    try {
      const user = await Users.getUserByEmailToVerifyResend(email);

      if (!user) {
        throw createError('User with this email does not exist', 404);
      }

      // Generate code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Save code
      await Users.saveResendedOtpCode(email, otpCode, codeExpiry);

      const mailSender = new MailSender();
      await mailSender.sendVerificationEmail(email, otpCode);

      return { message: 'Password reset email sent' };
    } catch (error) {
      logger.error(error);
      if (error.status) throw error;
      throw createError(
        'Internal server error during resending OTP code',
        500,
        error,
      );
    }
  }

  // Login
  static async login(email, password, ip) {
    try {
      const user = await Users.findByEmail(email);
      if (!user) throw createError('Invalid credentials', 401);

      if (user.email === email && user.is_oauth === true && !user.password) {
        throw createError('Invalid credentials', 401);
      }

      const isPassEquals = await bcrypt.compare(password, user.password);
      if (!isPassEquals) throw createError('Invalid credentials', 401);

      // Suspicious login
      if (user.last_login_ip && user.last_login_ip !== ip) {
        const mailSender = new MailSender();
        await mailSender.sendSecurityAlertEmail(
          user.email,
          ip,
          user.last_login_ip,
        );
      }

      // 2FA setup required
      if (user.is_twofa === true && !user.twofa_secret) {
        const { secret, otpauth_url } = await TwofaService.generate2FASecret(
          user.id,
          user.email,
        );
        return {
          requires2FA: true,
          message: '2FA setup required. Scan QR or enter secret in your app.',
          secret,
          otpauth_url,
          user: { id: user.id, email: user.email },
        };
      }

      // 2FA login required
      if (user.is_twofa === true && user.twofa_secret) {
        return {
          requires2FA: true,
          message:
            '2FA code required. Please enter the code from your authenticator app.',
          user: { id: user.id, email: user.email },
        };
      }

      await Users.updateLastLoginInfo(user.id, ip);
      const payload = new Payload(user);
      const tokens = Tokens.generateTokens({ ...payload });

      return { ...tokens, user: payload };
    } catch (error) {
      logger.error(error);
      if (error.status) throw error;
      throw createError('Internal server error during login', 500, error);
    }
  }

  // Verify reset passwords otp
  static async forgotPassword(email) {
    let trx;
    try {
      trx = await pg.transaction();

      const user = await TokenResetPassword.getUserByEmail(email);
      if (!user) throw createError('User with this email does not exist', 404);

      const otpCode = crypto.randomInt(100000, 1000000).toString();
      const codeExpiry = new Date(Date.now() + 5 * 60 * 1000);

      await TokenResetPassword.saveOTPCode(user.id, otpCode, codeExpiry, trx);

      await trx.commit();

      const mailSender = new MailSender();
      await mailSender.sendPasswordResetRequestEmail(
        email,
        otpCode,
        codeExpiry,
      );

      return { message: 'Password reset email sent' };
    } catch (error) {
      if (trx) await trx.rollback();
      logger.error(error);
      if (error.status) throw error;
      throw createError(
        'Internal server error during checking email for forgot function',
        500,
        error,
      );
    }
  }

  // Verifying OTP code for resetting password
  static async verifyOtpForResetPassword(otpCode) {
    let trx;
    try {
      trx = await pg.transaction();

      const userData = await TokenResetPassword.findUserByOTPCode(otpCode, trx);

      const resetToken =
        crypto.randomBytes(16).toString('hex') + Date.now().toString();
      if (!userData) {
        await TokenResetPassword.updateTokenTable(otpCode, trx);
        throw createError('Invalid or expired verification code', 400);
      }
      await TokenResetPassword.saveResetToken(
        userData.user_id,
        resetToken,
        trx,
      );
      await TokenResetPassword.unableOTPCode(userData.user_id, otpCode, trx);

      await trx.commit();
      return {
        message: 'Otp code was correct!',
        resetToken: resetToken,
      };
    } catch (error) {
      if (trx) await trx.rollback();
      logger.error(error);
      if (error.status) throw error;
      throw createError(
        'Internal server error during verifing OTP code',
        500,
        error,
      );
    }
  }

  // Resending OTP code by email for reset-password
  static async resendOtpForResetPasword(email) {
    let trx;
    try {
      trx = await pg.transaction();

      const user = await TokenResetPassword.getUserByEmailToVerifyResend(email);

      if (!user) {
        throw createError('User with this email does not exist', 404);
      }

      // Generate code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Save code to Reset pswd table
      await TokenResetPassword.unableOTPCodeAfterResend(user.id, trx);
      await TokenResetPassword.saveResendedResetToken(
        user.id,
        otpCode,
        codeExpiry,
        trx,
      );

      await trx.commit();

      const mailSender = new MailSender();
      await mailSender.sendPasswordResetRequestEmail(email, otpCode);

      return { message: 'Password reset email sent' };
    } catch (error) {
      if (trx) await trx.rollback();
      logger.error(error);
      if (error.status) throw error;
      throw createError(
        'Internal server error during resending OTP code',
        500,
        error,
      );
    }
  }

  // Reset password
  static async resetPassword(resetToken, newPassword) {
    let trx;
    try {
      trx = await pg.transaction();

      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      const userId = await TokenResetPassword.findUserByResetToken(
        resetToken,
        trx,
      );
      if (!userId) {
        throw createError('Invalid or expired reset token', 400);
      }

      await TokenResetPassword.setNewPassword(userId, hashedNewPassword, trx);
      await TokenResetPassword.nullifyResetToken(resetToken, trx);

      await trx.commit();

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      if (trx) await trx.rollback();
      logger.error(error);
      if (error.status) throw error;
      throw createError(
        'Internal server error during reseting password',
        500,
        error,
      );
    }
  }

  // Generate new tokens using refresh token
  static async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw createError('Refresh token not provided', 400);
    }

    let decoded;
    try {
      decoded = Tokens.verifyRefreshToken(refreshToken);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw createError('Refresh token expired', 401, err);
      }
      if (err.name === 'JsonWebTokenError') {
        throw createError('Invalid refresh token', 401, err);
      }
      throw createError('Token verification failed', 500, err);
    }

    const user = await Users.findById(decoded.id);
    if (!user) {
      throw createError('User not found', 404);
    }
    if (!user.is_verified) {
      throw createError('User account not verified', 403);
    }

    // generate tokens and return data
    const payload = { id: user.id, role: user.role };
    const tokens = Tokens.generateTokens(payload);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        is_oauth: user.is_oauth,
        is_verified: user.is_verified,
        is_twofa: user.is_twofa,
      },
    };
  }

  // Validate Access Token
  static async validateAccessToken(token) {
    try {
      const decoded = Tokens.verifyAccessToken(token);

      // Check if user still exists
      const user = await Users.findById(decoded.id);
      if (!user) {
        throw createError('User not found', 404);
      }

      if (!user.is_verified) {
        throw createError('Account not verified', 403);
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        is_oauth: user.is_oauth,
        is_verified: user.is_verified,
        is_twofa: user.is_twofa,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw createError('Access token expired', 401);
      }
      if (error.name === 'JsonWebTokenError') {
        throw createError('Invalid access token', 401);
      }
      throw error;
    }
  }

  // Validate Access Token
  static async validateAccessToken(token) {
    try {
      const decoded = Tokens.verifyAccessToken(token);

      // Check if user still exists
      const user = await Users.findById(decoded.id);
      if (!user) {
        throw createError('User not found', 404);
      }

      if (!user.is_verified) {
        throw createError('Account not verified', 403);
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        is_oauth: user.is_oauth,
        is_verified: user.is_verified,
        is_twofa: user.is_twofa,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw createError('Access token expired', 401);
      }
      if (error.name === 'JsonWebTokenError') {
        throw createError('Invalid access token', 401);
      }
      throw error;
    }
  }

  // Validate Refresh Token
  static async validateRefreshToken(token) {
    try {
      const decoded = Tokens.verifyRefreshToken(token);

      // Check if user still exists
      const user = await Users.findById(decoded.id);
      if (!user) {
        throw createError('User not found', 404);
      }

      if (!user.is_verified) {
        throw createError('Account not verified', 403);
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        is_oauth: user.is_oauth,
        is_verified: user.is_verified,
        is_twofa: user.is_twofa,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw createError('Refresh token expired', 401);
      }
      if (error.name === 'JsonWebTokenError') {
        throw createError('Invalid refresh token', 401);
      }
      throw error;
    }
  }
}
