import knex from 'knex';
import knexConfigs from '../config/knex.configs.js';

const pg = knex(knexConfigs.development);

export default class Trial {
  static async checkForFP(fpHash) {
    return await pg('trials').where('fp_hash', fpHash);
  }

  static async getAllTrials() {
    return await pg('trials').select('fp_data');
  }

  static async saveTrial(fpHash, fpData, ip) {
    return await pg('trials').insert({
      fp_hash: fpHash,
      fp_data: JSON.stringify(fpData),
      user_ip: ip,
    });
  }
}
