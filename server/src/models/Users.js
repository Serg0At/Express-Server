import knex from 'knex';
import knexConfigs from '../config/knex.configs.js';

const pg = knex(knexConfigs.development);

export default class UsersModel {
  static async getOAuthStatus(userId) {
    return await pg('users').select('is_oauth').where({ id: userId }).first();
  }

  static async get2FaStatus(userId) {
    return await pg('users').select('is_twofa').where({ id: userId }).first();
  }

  static async getUserData(userId) {
    return await pg('users')
      .select(
        'id',
        'email',
        'name',
        'avatar_url',
        'is_twofa',
        'is_oauth',
        'is_verified',
        'otp_code',
        'otp_code_expires_at',
      )
      .where({ id: userId })
      .first();
  }

  static async deleteAccount(userId) {
    return await pg('users').where({ id: userId }).del();
  }

  static async changeEmail(userId, email) {
    const updated = await pg('users')
      .where({ id: userId })
      .update({ email })
      .returning('*');
    return updated[0];
  }

  static async changeName(userId, name) {
    const updated = await pg('users')
      .where({ id: userId })
      .update({ name })
      .returning('*');
    return updated[0];
  }

  static async updateAvatar(userId, avatarPath) {
    const updated = await pg('users')
      .where({ id: userId })
      .update({ avatar_url: avatarPath })
      .returning('*');
    return updated[0];
  }

  static async updateOtpCode(userId, otpCode, expiresAt) {
    const updated = await pg('users')
      .where({ id: userId })
      .update({
        otp_code: otpCode,
        otp_code_expires_at: expiresAt,
      })
      .returning('*');
    return updated[0];
  }

  static async clearOtpCode(userId) {
    const updated = await pg('users')
      .where({ id: userId })
      .update({
        otp_code: null,
        otp_code_expires_at: null,
      })
      .returning('*');
    return updated[0];
  }

  static async getUserPassword(userId) {
    return await pg('users').select('password').where({ id: userId }).first();
  }

  static async updatePassword(userId, hashedPassword) {
    const updated = await pg('users')
      .where({ id: userId })
      .update({ password: hashedPassword })
      .returning('*');
    return updated[0];
  }
}
