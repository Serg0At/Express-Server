import Subscription from '../../models/Subscription.js';

export default class SubscriptionService {
  static async getEndTime(userId) {
    return await Subscription.getEndTime(userId);
  }

  static async getStatus(userId) {
    return await Subscription.getStatus(userId);
  }

  static async getPayedAmount(userId) {
    return await Subscription.getPayedAmount(userId);
  }
}
