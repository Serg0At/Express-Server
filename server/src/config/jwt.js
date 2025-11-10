import jwt from 'jsonwebtoken';

import config from './variables.config.js';

const { AUTH } = config;
const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  REFRESH_TOKEN_ACTIVE_TIME,
  ACCESS_TOKEN_ACTIVE_TIME,
} = AUTH;

export default class Tokens {
  static generateTokens(payload) {
    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn: ACCESS_TOKEN_ACTIVE_TIME || '15m',
    });

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_ACTIVE_TIME || '7d',
    });

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token) {
    return jwt.verify(token, JWT_ACCESS_SECRET);
  }

  static verifyRefreshToken(token) {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  }
}
