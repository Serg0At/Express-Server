import express from 'express';

import SubscriptionController from './subscription.controller.js';
import AuthMiddleware from '../../middlewares/auth.js';

const router = express.Router();

// GET requests
router.get(
  '/getEndTime',
  AuthMiddleware.checkIfAuthorized,
  SubscriptionController.getEndTime,
);
router.get(
  '/getStatus',
  AuthMiddleware.checkIfAuthorized,
  SubscriptionController.getStatus,
);
router.get(
  '/getPayedAmount',
  AuthMiddleware.checkIfAuthorized,
  SubscriptionController.getPayedAmount,
);

export default router;
