import Tokens from '../config/jwt.js';
export default class AdminMiddleware {
  static async checkIfAdmin(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or malformed token' });
      }

      const token = authHeader.split(' ')[1];
      const userData = Tokens.verifyAccessToken(token);

      if (!userData) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      if (userData.role !== 'admin') {
        return res
          .status(403)
          .json({ message: 'Access denied. Admin rights required.' });
      }

      req.user = userData;
      next();
    } catch (err) {
      console.error('Admin middleware error:', err);
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }
}
