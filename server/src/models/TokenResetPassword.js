import knex from 'knex';
import knexConfigs from '.././config/knex.configs.js';

const pg = knex(knexConfigs.development);

export default class TokenResetPassword {
  static async getUserByEmail(email) {
    return await pg('users')
    .where({ email: email, is_verified: true })
    .first();
  }

  static async saveOTPCode(userId, otp_code, otpExpiry, trx) {
    return await pg('reset_pswd_otp_codes').insert({
      user_id: userId,
      otp_code: otp_code,
      otp_code_expires_at: otpExpiry,
    })
    .transacting(trx);
  }

  static async saveResetToken(userId, resetToken, trx) {
    return await pg('reset_pswd_otp_codes').insert({
      user_id: userId,
      reset_token: resetToken,
    })
    .transacting(trx);
  }

  static async unableOTPCodeAfterResend(userId, trx) {
    return await pg('reset_pswd_otp_codes')
      .where({ user_id: userId })
      .update({
        used_otp: true,
      })
      .transacting(trx);
  }

  static async saveResendedResetToken(userId, otp_code, otpExpiry, trx) {
    return await pg('reset_pswd_otp_codes')
    .insert({
      user_id: userId,
      otp_code: otp_code,
      otp_code_expires_at: otpExpiry,
    })
      .transacting(trx);
  }

  static async getUserByEmailToVerifyResend(email) {
    return await pg('users')
      .where({ email: email })
      .andWhere({ is_verified: true })
      .first();
  }

  static async findUserByOTPCode(otp_code, trx) {
    return await pg('reset_pswd_otp_codes')
      .where({ otp_code: otp_code, used_otp: false })
      .andWhere('otp_code_expires_at', '>', new Date())
      .first()
      .transacting(trx);
  }

  static async findUserByResetToken(resetToken, trx) {
    const result = await pg('reset_pswd_otp_codes')
      .select('user_id')
      .where({ reset_token: resetToken })
      .first()
      .transacting(trx);
    return result ? result.user_id : null;
  }

  static async updateTokenTable(otp_code, trx) {
    return await pg('reset_pswd_otp_codes')
      .where({ otp_code: otp_code })
      .update({ used_otp: true })
      .transacting(trx);
  }

  static async unableOTPCode(userId, otp_code, trx) {
    return await pg('reset_pswd_otp_codes')
      .where({ user_id: userId })
      .andWhere({ otp_code: otp_code })
      .update({
        used_otp: true,
      })
      .transacting(trx);
  }

  static async nullifyResetToken(resetToken, trx) {
    return await pg('reset_pswd_otp_codes')
      .where({ reset_token: resetToken })
      .update({
          reset_token: null,
      })
      .transacting(trx);
  }

  static async setNewPassword(userId, hashedNewPassword, trx) {
    return await pg('users')
      .where({ id: userId })
      .update({
        password: hashedNewPassword,
      })
      .transacting(trx);
  }
}
