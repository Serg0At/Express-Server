import knex from 'knex';
import knexConfigs from '../config/knex.configs.js';

const pg = knex(knexConfigs.development);

export default class ReferralModel {
  // Create referral record for new user
  static async createReferralRecord(
    userId,
    referralCode,
    invitedByCode = null,
    trx,
  ) {
    const referralData = {
      user_id: userId,
      own_refferal_code: referralCode,
      own_invites_count: 0,
      invited_by_code: invitedByCode,
    };

    if (invitedByCode) {
      // Find the inviter by their referral code
      const inviter = await pg('refferals')
        .where({ own_refferal_code: invitedByCode })
        .first()
        .transacting(trx);

      if (inviter) {
        // Get inviter's user info
        const inviterUser = await pg('users')
          .where({ id: inviter.user_id })
          .first()
          .transacting(trx);

        if (inviterUser) {
          referralData.invited_by = inviterUser.name || inviterUser.email;

          // Increment inviter's invite count
          await pg('refferals')
            .where({ user_id: inviter.user_id })
            .increment('own_invites_count', 1)
            .transacting(trx);
        }
      }
    }

    return await pg('refferals').insert(referralData).transacting(trx);
  }

  // Get user's referral information
  static async getUserReferralInfo(userId) {
    return await pg('refferals').where({ user_id: userId }).first();
  }

  // Get referral code by user ID
  static async getReferralCodeByUserId(userId) {
    const result = await pg('refferals')
      .select('own_refferal_code')
      .where({ user_id: userId })
      .first();

    return result?.own_refferal_code;
  }

  // Validate referral code exists
  static async validateReferralCode(referralCode) {
    const result = await pg('refferals')
      .join('users', 'refferals.user_id', 'users.id')
      .select('users.id', 'users.name', 'users.email')
      .where({ 'refferals.own_refferal_code': referralCode })
      .andWhere({ 'users.is_verified': true })
      .first();

    return result;
  }

  // Get all users invited by a specific user
  static async getInvitedUsers(userId) {
    const userReferral = await pg('refferals')
      .select('own_refferal_code')
      .where({ user_id: userId })
      .first();

    if (!userReferral) return [];

    return await pg('refferals')
      .join('users', 'refferals.user_id', 'users.id')
      .select('users.id', 'users.name', 'users.email', 'users.created_at')
      .where({ 'refferals.invited_by_code': userReferral.own_refferal_code })
      .orderBy('users.created_at', 'desc');
  }

  // Get referral statistics for a user
  static async getReferralStats(userId) {
    const referralInfo = await this.getUserReferralInfo(userId);
    if (!referralInfo) return null;

    const invitedUsers = await this.getInvitedUsers(userId);

    return {
      referralCode: referralInfo.own_refferal_code,
      totalInvites: referralInfo.own_invites_count || 0,
      invitedBy: referralInfo.invited_by,
      invitedByCode: referralInfo.invited_by_code,
      invitedUsers: invitedUsers,
    };
  }
}
