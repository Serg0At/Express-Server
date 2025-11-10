import ReferralModel from '../../models/Referral.js';
import createError from '../../utils/create-error.js';
import logger from '../../utils/logger.js';

export default class ReferralService {
  // Get user's referral information
  static async getReferralInfo(userId) {
    try {
      const referralInfo = await ReferralModel.getUserReferralInfo(userId);

      if (!referralInfo) {
        throw createError('Referral information not found', 404);
      }

      return {
        referralCode: referralInfo.own_refferal_code,
        inviteCount: referralInfo.own_invites_count || 0,
        invitedBy: referralInfo.invited_by,
        invitedByCode: referralInfo.invited_by_code,
        referralUrl: `${process.env.CLIENT_URL}/auth/register?ref=${referralInfo.own_refferal_code}`

      };
    } catch (error) {
      logger.error('Error getting referral info:', error);
      if (error.status) throw error;
      throw createError(
        'Internal server error while getting referral info',
        500,
        error,
      );
    }
  }

  // Get detailed referral statistics
  static async getReferralStats(userId) {
    try {
      const stats = await ReferralModel.getReferralStats(userId);

      if (!stats) {
        throw createError('Referral statistics not found', 404);
      }

      return {
        ...stats,
        referralUrl: `${process.env.CLIENT_URL}/auth/register?ref=${stats.referralCode}`

      };
    } catch (error) {
      logger.error('Error getting referral stats:', error);
      if (error.status) throw error;
      throw createError(
        'Internal server error while getting referral stats',
        500,
        error,
      );
    }
  }

  // Validate referral code
  static async validateReferralCode(referralCode) {
    try {
      const referrer = await ReferralModel.validateReferralCode(referralCode);
      return referrer;
    } catch (error) {
      logger.error('Error validating referral code:', error);
      throw createError(
        'Internal server error while validating referral code',
        500,
        error,
      );
    }
  }

  // Get list of invited users
  static async getInvitedUsers(userId) {
    try {
      const invitedUsers = await ReferralModel.getInvitedUsers(userId);

      return invitedUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        joinedAt: user.created_at,
      }));
    } catch (error) {
      logger.error('Error getting invited users:', error);
      throw createError(
        'Internal server error while getting invited users',
        500,
        error,
      );
    }
  }

  // Handle subscription purchase (for future use when subscription is ready)
  static async handleSubscriptionPurchase(userId, subscriptionPlan) {
    try {
      // Get user's referral info to find who invited them
      const referralInfo = await ReferralModel.getUserReferralInfo(userId);

      if (referralInfo && referralInfo.invited_by_code) {
        // Find the inviter
        const inviter = await ReferralModel.validateReferralCode(
          referralInfo.invited_by_code,
        );

        if (inviter) {
          // Generate promo code for the inviter
          const promoCode = await this.generatePromoCode();

          // Save promo code to database
          await this.savePromoCode(inviter.id, promoCode);

          // Send email to inviter with promo code
          await this.sendPromoCodeEmail(inviter.email, inviter.name, promoCode);

          logger.info(
            `Promo code ${promoCode} sent to inviter ${inviter.email} for user ${userId} subscription`,
          );
        }
      }
    } catch (error) {
      logger.error('Error handling subscription purchase for referral:', error);
      // Don't throw error here as this shouldn't break the subscription process
    }
  }

  // Generate a unique promo code
  static async generatePromoCode() {
    const crypto = await import('crypto');
    return `PROMO${crypto.default.randomBytes(4).toString('hex').toUpperCase()}`;
  }

  // Save promo code to database
  static async savePromoCode(userId, promoCode) {
    const knex = await import('knex');
    const knexConfigs = await import('../../config/knex.configs.js');
    const pg = knex.default(knexConfigs.default.development);

    return await pg('promocodes').insert({
      user_id: userId,
      promocode: promoCode,
      used_promo: false,
    });
  }

  // Send promo code email to inviter
  static async sendPromoCodeEmail(email, name, promoCode) {
    try {
      const MailSender = (await import('../../utils/mail-sender.js')).default;
      const mailSender = new MailSender();

      // You'll need to add this method to your MailSender class
      await mailSender.sendPromoCodeEmail(email, name, promoCode);
    } catch (error) {
      logger.error('Error sending promo code email:', error);
    }
  }
}
