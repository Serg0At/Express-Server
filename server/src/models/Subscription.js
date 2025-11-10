import knex from 'knex';
import knexConfigs from '../config/knex.configs.js';

const pg = knex(knexConfigs.development);

export default class Subscription {
  // Get expired time
  static async getEndTime(userId) {
    const subscription = await pg('subscriptions')
      .where({ user_id: userId, status: 'active' })
      .orderBy('expires_at', 'desc')
      .first();

    if (!subscription || !subscription.expires_at) {
      return null;
    }

    const now = new Date();
    const expires = new Date(subscription.expires_at);

    let diffMs = expires - now;

    if (diffMs <= 0) return 'expired';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );

    if (diffDays >= 1) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}, ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    }
  }

  // Get subscription status (active, canceled, trialing, past_due)
  static async getStatus(userId) {
    const subscription = await pg('subscriptions')
      .where({ user_id: userId })
      .orderBy('expires_at', 'desc')
      .first();

    return subscription ? subscription.status : null;
  }

  // Get paid amount in cents
  static async getPayedAmount(userId) {
    const subscription = await pg('subscriptions')
      .where({ user_id: userId })
      .orderBy('expires_at', 'desc')
      .first();

    return subscription ? subscription.payed_amount_cents : 0;
  }
}
