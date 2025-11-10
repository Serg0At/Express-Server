import bcrypt from 'bcrypt';
import UsersModel from '../../models/Users.js';
import Users from '../../models/Auth.js';
import ReferralModel from '../../models/Referral.js';
import createError from '../../utils/create-error.js';

export default class UsersService {
  static async getOAuthStatus(userId) {
    return await UsersModel.getOAuthStatus(userId);
  }

  static async get2FaStatus(userId) {
    return await UsersModel.get2FaStatus(userId);
  }

  static async getUserData(userId) {
    const userData = await UsersModel.getUserData(userId);

    // Get referral information
    try {
      const referralInfo = await ReferralModel.getUserReferralInfo(userId);
      if (referralInfo) {
        userData.referralCode = referralInfo.own_refferal_code;
        userData.referralUrl = `${process.env.CLIENT_URL}/auth/register?ref=${referralInfo.own_refferal_code}`;
        userData.inviteCount = referralInfo.own_invites_count || 0;
      }
    } catch (error) {
      // If referral info doesn't exist, create it for backward compatibility
      console.log(
        'No referral info found for user:',
        userId,
        'Creating one...',
      );
      try {
        const generateReferralCode = (
          await import('../../utils/generateReferralCode.js')
        ).default;
        const referralCode = await generateReferralCode(userData.email);
        await ReferralModel.createReferralRecord(userId, referralCode);

        userData.referralCode = referralCode;
        userData.referralUrl = `${process.env.CLIENT_URL}/auth/register?ref=${referralCode}`;
        userData.inviteCount = 0;
      } catch (createError) {
        console.error(
          'Failed to create referral code for user:',
          userId,
          createError,
        );
      }
    }

    return userData;
  }

  static async changeEmail(userId, newEmail) {
    if (!newEmail) throw createError('New email is required', 400);

    const existingUser = await Users.findByEmail(newEmail);
    if (existingUser && existingUser.id !== userId) {
      throw createError('Email already in use', 409);
    }

    return await UsersModel.changeEmail(userId, newEmail);
  }

  static async changeName(userId, newName) {
    if (!newName) throw createError('New name is required', 400);

    return await UsersModel.changeName(userId, newName);
  }

  static async updateAvatar(userId, avatarPath) {
    if (!avatarPath) throw createError('Avatar file is required', 400);

    return await UsersModel.updateAvatar(userId, avatarPath);
  }

  static async deleteAccount(userId) {
    return await UsersModel.deleteAccount(userId);
  }

  static async sendVerificationCode(userId) {
    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration time (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Update user with OTP code and expiration
    const updatedUser = await UsersModel.updateOtpCode(
      userId,
      otpCode,
      expiresAt,
    );

    if (!updatedUser) {
      throw createError('User not found', 404);
    }

    return {
      email: updatedUser.email,
      otpCode: otpCode,
      expiresAt: expiresAt,
    };
  }

  static async validateVerificationCode(userId, otpCode) {
    if (!otpCode) {
      throw createError('Verification code is required', 400);
    }

    const user = await UsersModel.getUserData(userId);

    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.otp_code) {
      throw createError(
        'No verification code found. Please request a new one.',
        400,
      );
    }

    if (user.otp_code !== otpCode) {
      throw createError('Invalid verification code', 400);
    }

    // Check if code has expired
    const now = new Date();
    const expiresAt = new Date(user.otp_code_expires_at);

    if (now > expiresAt) {
      throw createError(
        'Verification code has expired. Please request a new one.',
        400,
      );
    }

    // Clear the OTP code after successful validation
    await UsersModel.clearOtpCode(userId);

    return {
      success: true,
      message: 'Verification code validated successfully',
    };
  }

  static async changePassword(userId, oldPassword, newPassword) {
    if (!oldPassword || !newPassword) {
      throw createError('Both current and new passwords are required', 400);
    }

    // Get user's current password
    const user = await UsersModel.getUserPassword(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      oldPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw createError('Current password is incorrect', 400);
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw createError(
        'New password must be different from current password',
        400,
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password in database
    const updatedUser = await UsersModel.updatePassword(
      userId,
      hashedNewPassword,
    );

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }
}
