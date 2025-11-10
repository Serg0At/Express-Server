import express from 'express';

import TrialController from './trial.controller.js';

const router = express.Router();

router.post('/trial', TrialController.getTrial);

export default router;
