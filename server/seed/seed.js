// NPM Modules
import knex from 'knex';
import bcrypt from 'bcryptjs';
import knexConfigs from '../src/config/knex.configs.js';
import config from '../src/config/variables.config.js';

const { ADMIN_PASSWORD } = config;

async function seed(pg) {
  const trx = await pg.transaction();
  try {
    const hashedPassword = bcrypt.hashSync(
      ADMIN_PASSWORD,
      bcrypt.genSaltSync(10),
      null,
    );

    // await trx('users').insert([
    //   {
    //     role: 'admin',
    //     email: 'admin@mail.com',
    //     name: 'Programist',
    //     provider: null,
    //     password: hashedPassword,
    //     is_verified: true,
    //     created_at: new Date().toISOString(),
    //   },
    // ]);

    await trx('plans').insert([
      {
        name: 'lite',
        price_cents: 2500, // $25
        duration: 1,
        trial_days: 0,
        created_at: new Date().toISOString(),
      },
      {
        name: 'standard',
        price_cents: 5000, // $50
        duration: 1,
        trial_days: 0,
        created_at: new Date().toISOString(),
      },
      {
        name: 'pro',
        price_cents: 10000, // $100
        duration: 1,
        trial_days: 0,
        created_at: new Date().toISOString(),
      },
      {
        name: 'trial',
        price_cents: 0,
        duration: 0,
        trial_days: 1,
        created_at: new Date().toISOString(),
      },
    ]);

    await trx.commit();
    console.log('✅ Seed data inserted successfully.');
  } catch (error) {
    await trx.rollback();
    console.error('❌ Error inserting data:', error.message);
    throw error;
  }
}

async function init() {
  try {
    const options =
      process.env.NODE_ENV === 'production'
        ? knexConfigs.production
        : knexConfigs.development;

    const pg = knex(options);

    await seed(pg);

    // Close the database connection
    await pg.destroy();

    console.log('🌱 Database seeding completed.');
  } catch (error) {
    console.error('Initialization error:', error.message);
  }
}

init();
