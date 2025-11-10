// NPM Modules
import express from 'express';

// Local Modules
import AuthValidation from '../validations/auth.validator.js';
import AuthController from '../controllers/auth.controller.js';
import AuthMiddleware from '../../../middlewares/auth.js';

import {
  registrationLimiter,
  loginLimiter,
  passwordResetLimiter,
  otpVerificationLimiter,
  forgotPasswordLimiter,
  refreshTokenLimiter,
} from '../../../middlewares/rateLimiter.js';

import TwoFactorController from '../controllers/twofa.controller.js';
import OAuthController from '../controllers/o-auth.controller.js';

const router = express.Router();

// Authorization with rate limiting
router.post(
  '/register',
  registrationLimiter,
  AuthValidation.registration,
  AuthController.registration,
);

// Registration with referral code
router.post(
  '/register/:referralCode',
  registrationLimiter,
  AuthValidation.registration,
  AuthController.registrationWithReferral,
);

// Email verification by otp and forgot password verification
router.post('/verify-otp', otpVerificationLimiter, AuthController.verifyEmail);
router.post(
  '/verify-otp-reset',
  otpVerificationLimiter,
  AuthController.verifyOtpForResetPassword,
);

// Resending otp code for email verification and password reseting
router.post('/resend-otp', AuthController.resendOtp);
router.post('/resend-otp-reset', AuthController.resendOtpForResetPasword);

// Login with rate limiting
router.post('/login', loginLimiter, AuthValidation.login, AuthController.login);

// Logout
router.post('/logout', AuthController.logout);

// Forgot password with rate limiting
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  AuthValidation.forgotPassword,
  AuthController.forgotPassword,
);

// Reset password with rate limiting
router.post(
  '/reset-password',
  passwordResetLimiter,
  AuthValidation.resetPassword,
  AuthController.resetPassword,
);

// OAuth
router.get('/oauth/google', OAuthController.googleOAuth);
router.get('/oauth/google/callback', OAuthController.googleOAuthCallback);
router.post(
  '/oauth/google/disconnect',
  AuthMiddleware.checkIfAuthorized,
  OAuthController.disconnectGoogleOAuth,
);

// 2FA routes
router.post(
  '/2fa/generate',
  AuthMiddleware.checkIfAuthorized,
  TwoFactorController.generate2FASecretController,
);
router.post(
  '/2fa/activate',
  AuthMiddleware.checkIfAuthorized,
  TwoFactorController.activate2FAController,
);
router.post(
  '/2fa/verify',
  AuthMiddleware.checkIfAuthorized,
  TwoFactorController.verify2FAController,
);

// Validate and refresh tokens
router.post('/validate-access-token', AuthController.validateAccessToken);
router.post('/validate-refresh-token', AuthController.validateRefreshToken);

router.post(
  '/refresh-tokens',
  AuthController.refreshToken,
);

export default router;
