import Tokens from '../config/jwt.js';

export default class AuthMiddleware {
  static async checkIfAuthorized(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or malformed token' });
      }

      const token = authHeader.split(' ')[1];
      const userData = Tokens.verifyAccessToken(token);

      if (!userData) {
        // return res.status(401).json({ message: 'Invalid or expired token' });
      }

      req.user = userData;
      next();
    } catch (err) {
      next(err);
      // console.error('Auth middleware error:', err);
      // return res.status(401).json({ message: 'Unauthorized' });
    }
  }
}
