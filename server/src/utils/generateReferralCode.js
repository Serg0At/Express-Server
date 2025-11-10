import crypto from 'crypto';
import knex from 'knex';
import knexConfigs from '../config/knex.configs.js';

const pg = knex(knexConfigs.development);

export default async function generateReferralCode(email) {
  let referralCode;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Create a base from email and random string
    const emailPrefix = email.split('@')[0].substring(0, 3).toUpperCase();
    const randomString = crypto.randomBytes(3).toString('hex').toUpperCase();

    referralCode = `${emailPrefix}${randomString}`;

    // Check if this code already exists
    const existingCode = await pg('refferals')
      .where({ own_refferal_code: referralCode })
      .first();

    if (!existingCode) {
      isUnique = true;
    }

    attempts++;
  }

  if (!isUnique) {
    referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  return referralCode;
}
