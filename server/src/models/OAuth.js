import knex from 'knex';
import knexConfigs from '.././config/knex.configs.js';
import ReferralModel from './Referral.js';
import generateReferralCode from '../utils/generateReferralCode.js';

const pg = knex(knexConfigs.development);

export default class OAuthModel {
  static async findUserAndUpdate(google_id, name, email, avatar, referralCode = null) {
    let user = await pg('users').
    where({ provider_id: google_id })
    .andWhere({ password: null })
    .first();

    if (user) {
      await pg('users')
      .where({ provider_id: google_id })
      .update({
        email,
        name,
        avatar_url: avatar,
        last_login_at: new Date(),
      });

      user = await pg('users')
      .where({ provider_id: google_id })
      .first();

    } else {
      // Check if user exists with this email (regular registration)
      const existingUser = await pg('users')
      .where({ email })
      .whereNotNull('password')
      .first();

      if (existingUser) {
        // Link OAuth to existing account - preserve existing name and avatar
        await pg('users')
        .where({ email })
        .update({
          provider_id: google_id,
          is_oauth: true,
          is_verified: true,
          last_login_at: new Date(),
        });

        user = await pg('users')
        .where({ email })
        .first();

        // Check if user already has referral record, if not create one
        try {
          const existingReferral = await ReferralModel.getUserReferralInfo(existingUser.id);
          if (!existingReferral) {
            const userReferralCode = await generateReferralCode(email);
            await ReferralModel.createReferralRecord(existingUser.id, userReferralCode);
          }
        } catch (referralError) {
          console.error('Failed to create referral record for existing user:', referralError);
        }
        
      } else {
        // Create new OAuth user with transaction to handle referral
        const trx = await pg.transaction();
        
        try {
          // Validate referral code if provided
          if (referralCode) {
            const referrer = await ReferralModel.validateReferralCode(referralCode);
            if (!referrer) {
              throw new Error('Invalid referral code');
            }
          }

          // Create new OAuth user
          [user] = await pg('users')
            .insert({
              provider: 'Google',
              provider_id: google_id,
              email,
              name,
              avatar_url: avatar,
              is_oauth: true,
              is_verified: true,
              last_login_at: new Date(),
            })
            .returning('*')
            .transacting(trx);

          // Generate and create referral record for the new user
          const userReferralCode = await generateReferralCode(email);
          await ReferralModel.createReferralRecord(user.id, userReferralCode, referralCode, trx);

          await trx.commit();
        } catch (error) {
          await trx.rollback();
          throw error;
        }
      }
    }

    return user;
  };

  static async disconnectGoogleOAuth(userId) {
    const user = await pg('users')
      .where({ id: userId })
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.password) {
      throw new Error('OAuth-only account, cannot disconnect without password');
    }

    return await pg('users')
      .where({ id: userId })
      .update({
        is_oauth: false,
        provider_id: null,
        provider: null,
      })
      .returning('*');
  }

}
