// NPM Modules
import knex from 'knex';
import knexConfigs from '../src/config/knex.configs.js';

function down(pg) {
  return (
    pg.schema

      // .dropTableIfExists('users')

      // first this then the users
      .dropTableIfExists('reset_pswd_otp_codes')
      .dropTableIfExists('arbitrage')
      .dropTableIfExists('blogs')
      .dropTableIfExists('news')
      .dropTableIfExists('subscriptions')
      .dropTableIfExists('promocodes')
      .dropTableIfExists('refferals')
      .dropTableIfExists('trials')
      .dropTableIfExists('plans')
  );
}

async function init() {
  try {
    const options =
      process.env.NODE_ENV === 'production'
        ? knexConfigs.production
        : knexConfigs.development;
    const pg = knex(options);
    await down(pg);
    console.log('Successfully dropped all tables');
  } catch (error) {
    console.log(error.message);
  }
}

init();
