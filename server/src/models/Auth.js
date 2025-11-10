import knex from 'knex';
import knexConfigs from '../config/knex.configs.js';

const pg = knex(knexConfigs.development);

export default class AuthModel {
  static async register(otpCode, userData, trx) {
    return await pg('users')
      .insert({
        ...userData,
        otp_code: otpCode,
      })
      .returning('id')
      .transacting(trx);
  }

  static async getUserByOtpCode(otpCode) {
    return await pg('users')
      .where({ otp_code: otpCode })
      .andWhere('otp_code_expires_at', '>', new Date())
      .first();
  }

  static async getUserByEmailToVerifyResend(email) {
    return await pg('users')
      .where({ email: email })
      .andWhere({ is_verified: false })
      .first();
  }

  static async saveResendedOtpCode(email, otpCode, codeExpiry) {
    return await pg('users').where({ email: email }).update({
      otp_code: otpCode,
      otp_code_expires_at: codeExpiry,
    });
  }

  static async saveVerifiedUser(id) {
    return await pg('users')
      .where({ id: id })
      .update({ is_verified: true, otp_code: null, otp_code_expires_at: null });
  }

  static async saveTwoFaSecret(id, twofasecret) {
    return await pg('users')
      .where({ id: id })
      .update({ twofa_code: twofasecret });
  }

  static async turn2FaTrue(id) {
    return await pg('users').where({ id: id }).update({ is_twofa: true });
  }

  static async disableTwoFa(userId) {
    return await pg('users').where({ id: userId }).update({
      is_twofa: false,
      twofa_code: null,
    });
  }

  static async findByEmail(email) {
    return await pg('users').where({ email: email }).first();
  }

  static async findById(id) {
    return await pg('users').where({ id: id }).first();
  }

  static async updateLastLoginInfo(id, ip) {
    return await pg('users').select('*').where({ id: id }).update({
      last_login_at: new Date(),
      last_login_ip: ip,
    });
  }
}
