import TrialService from './trial.service.js';

export default class TrialController {
  static async getTrial(req, res) {
    try {
      const { os, browser, resolution, timezone, language, touch } = req.body;
      const ip = req.ip;

      const reqData = { os, browser, resolution, timezone, language, touch };

      const result = await TrialService.getTrial(reqData, ip);

      if (!result.allowed) {
        return res.status(403).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
}
