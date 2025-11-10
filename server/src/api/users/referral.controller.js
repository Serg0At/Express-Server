import ReferralService from './referral.service.js';

export default class ReferralController {
  // Get user's referral information
  static async getReferralInfo(req, res, next) {
    try {
      console.log(req.user.id);
      const userId = req.user.id;
      const referralInfo = await ReferralService.getReferralInfo(userId);

      return res.json({
        success: true,
        data: referralInfo,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get referral statistics
  static async getReferralStats(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await ReferralService.getReferralStats(userId);

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // Validate a referral code
  static async validateReferralCode(req, res, next) {
    try {
      const { referralCode } = req.params;
      const isValid = await ReferralService.validateReferralCode(referralCode);

      return res.json({
        success: true,
        valid: !!isValid,
        referrer: isValid || null,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get invited users list
  static async getInvitedUsers(req, res, next) {
    try {
      const userId = req.user.id;
      const invitedUsers = await ReferralService.getInvitedUsers(userId);

      return res.json({
        success: true,
        data: invitedUsers,
      });
    } catch (error) {
      next(error);
    }
  }
}
