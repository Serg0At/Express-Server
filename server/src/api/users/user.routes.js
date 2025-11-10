import express from 'express';

import UsersController from './user.controller.js';
import ReferralController from './referral.controller.js';
import upload from '../../middlewares/multer.js';
import {
  otpVerificationLimiter,
  sensitiveActionLimiter,
} from '../../middlewares/rateLimiter.js';
import AuthMiddleware from '../../middlewares/auth.js';

const router = express.Router();

// --- GET requests ---
router.get(
  '/getData',
  AuthMiddleware.checkIfAuthorized,
  UsersController.getUserData,
);

router.get(
  '/getOAuthStatus',
  AuthMiddleware.checkIfAuthorized,
  UsersController.getOAuthStatus,
);

router.get(
  '/get2FaStatus',
  AuthMiddleware.checkIfAuthorized,
  UsersController.get2FaStatus,
);

// --- Edits ---
router.post(
  '/editName',
  AuthMiddleware.checkIfAuthorized,
  sensitiveActionLimiter,
  UsersController.changeName,
);

router.post(
  '/editEmail',
  AuthMiddleware.checkIfAuthorized,
  sensitiveActionLimiter,
  UsersController.changeEmail,
);

router.post(
  '/changePassword',
  AuthMiddleware.checkIfAuthorized,
  sensitiveActionLimiter,
  UsersController.changePassword,
);

router.post(
  '/upload-avatar',
  AuthMiddleware.checkIfAuthorized,
  upload.single('avatar'),
  UsersController.uploadAvatar,
);

// --- Email verifications ---
router.post(
  '/send-verify-code',
  AuthMiddleware.checkIfAuthorized,
  UsersController.sendVerify,
);

router.post(
  '/validate-verify-code',
  AuthMiddleware.checkIfAuthorized,
  UsersController.validateVerify,
);

// --- Permanent delete ---
router.delete(
  '/delete-acc',
  AuthMiddleware.checkIfAuthorized,
  UsersController.deleteAccount,
);

// --- Referral routes ---
router.get(
  '/referral/info',
  AuthMiddleware.checkIfAuthorized,
  ReferralController.getReferralInfo,
);
router.get(
  '/referral/stats',
  AuthMiddleware.checkIfAuthorized,
  ReferralController.getReferralStats,
);
router.get(
  '/referral/invited-users',
  AuthMiddleware.checkIfAuthorized,
  ReferralController.getInvitedUsers,
);

// Public route to validate referral codes (no auth required)
router.get(
  '/referral/validate/:referralCode',
  ReferralController.validateReferralCode,
);

export default router;
