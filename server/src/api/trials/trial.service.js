import Trial from '../../models/Trial.js';
import { hashFingerprint, compareFingerprints } from '../../utils/hashFP.js';

export default class TrialService {
  static async getTrial(reqData) {
    try {
      const fpHash = hashFingerprint(reqData, ip);

      // --- HARD MATCH ---
      const hardMatch = await Trial.checkForFP(fpHash);
      if (hardMatch.length > 0) {
        return { allowed: false, reason: 'HARD_MATCH' }; // 100% same hash
      }

      // --- SOFT MATCH ---
      const allTrials = await Trial.getAllTrials();
      for (const trial of allTrials) {
        const similarity = compareFingerprints(reqData, trial.fp_data);
        if (similarity >= 0.7) {
          // 70% similarity
          return { allowed: false, reason: 'SOFT_MATCH', similarity };
        }
      }

      // New Trial
      await Trial.saveTrial(fpHash, reqData, ip);
      return { allowed: true, reason: 'NEW' };
    } catch (error) {}
  }
}
