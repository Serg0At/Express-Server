import rateLimit from 'express-rate-limit';

// Utility handler for consistency
const handler = (req, res) => {
  res.status(429).json(req.rateLimit.message || {
    error: 'Too many requests, please try again later',
  });
};

// Registration rate limiter
export const registrationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Max 5 registration attempts per IP
  message: { error: 'Too many registration attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Login rate limiter
export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Max 5 login attempts per IP
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Password reset limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 4,
  message: { error: 'Too many password reset attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Email verification limiter
export const otpVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many verification email requests, please try later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Forgot password limiter
export const forgotPasswordLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5,
  message: { error: 'Too many forgot password requests, please try later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Refresh token limiter
export const refreshTokenLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  message: { error: 'Too many refresh requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Sensitive account actions limiter (change email, password, 2FA, etc.)
export const sensitiveActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many account changes, please try later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});