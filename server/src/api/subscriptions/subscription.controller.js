import SubscriptionService from './subscriptions.service.js';

export default class SubscriptionController {
  static async getEndTime(req, res) {
    try {
      const userId = req.user.id;
      const result = await SubscriptionService.getEndTime(userId);

      if (!result) {
        return res
          .status(404)
          .json({ message: 'No active subscription found' });
      }

      res.json({ remaining: result });
    } catch (err) {
      console.error('Error fetching subscription end time:', err);
      res.status(500).json({ error: err.message });
    }
  }

  static async getStatus(req, res) {
    try {
      const userId = req.user.id;
      const status = await SubscriptionService.getStatus(userId);

      if (!status) {
        return res.status(404).json({ message: 'No subscription found' });
      }

      res.json({ status });
    } catch (err) {
      console.error('Error fetching subscription status:', err);
      res.status(500).json({ error: err.message });
    }
  }

  static async getPayedAmount(req, res) {
    try {
      const userId = req.user.id;
      const amountCents = await SubscriptionService.getPayedAmount(userId);

      // Convert to dollars
      const amount = amountCents / 100;

      res.json({ amount });
    } catch (err) {
      console.error('Error fetching paid amount:', err);
      res.status(500).json({ error: err.message });
    }
  }
}
