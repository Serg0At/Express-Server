// NPM Modules
import knex from 'knex';
import knexConfigs from '../src/config/knex.configs.js';

function up(pg) {
  return (
    pg.schema

      // Users
      .createTable('users', table => {
        table.increments('id').primary();

        table.string('role').notNullable().defaultTo('user');
        table.string('email').notNullable().unique();
        table.string('password'); // nullable, if OAuth

        table.boolean('is_verified').defaultTo(false);

        table.boolean('is_oauth').defaultTo(false);
        table.string('provider').defaultTo('Google');
        table.string('provider_id').unique();

        table.string('name');
        table.string('avatar_url');

        table.string('twofa_code');
        table.boolean('is_twofa').notNullable().defaultTo(false);

        table.string('last_login_ip');
        table.dateTime('last_login_at').defaultTo(pg.fn.now());

        table.string('otp_code');
        table.dateTime('otp_code_expires_at');

        table.timestamp('created_at').defaultTo(pg.fn.now());
      })

      // Reset passwords tokens
      .createTable('reset_pswd_otp_codes', table => {
        table.increments('id').primary();

        table
          .integer('user_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('users')
          .onDelete('CASCADE');

        table.string('reset_token');

        table.boolean('used_otp').notNullable().defaultTo(false);
        table.string('otp_code');
        table.dateTime('otp_code_expires_at');

        table.timestamp('created_at').defaultTo(pg.fn.now());
      })

      // News
      .createTable('news', table => {
        table.increments('id').primary();

        table
          .integer('admin_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('users')
          .onDelete('CASCADE');

        table.string('image');
        table.string('title').notNullable();
        table.integer('views').notNullable().unsigned().defaultTo(0);
        table.text('content').notNullable();

        table.timestamp('created_at').defaultTo(pg.fn.now());
      })

      // News
      .createTable('blogs', table => {
        table.increments('id').primary();

        table
          .integer('admin_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('users')
          .onDelete('CASCADE');

        table.string('image');
        table.string('title').notNullable();
        table.text('content').notNullable();
        table.integer('views').notNullable().unsigned().defaultTo(0);

        table.timestamp('created_at').defaultTo(pg.fn.now());
      })

      // Arbitrage
      .createTable('arbitrage', table => {
        table.increments('id').primary();
        table.string('exchange_from', 50).notNullable();
        table.string('exchange_to', 50).notNullable();
        table.decimal('price_from', 20, 10).notNullable();
        table.decimal('price_to', 20, 10).notNullable();
        table.decimal('profit', 10, 4).notNullable();
        table.string('token', 50).notNullable();
        table.timestamp('created_at').defaultTo(pg.fn.now());
        table.timestamp('updated_at').defaultTo(pg.fn.now());
      })

      // Free trial
      .createTable('trials', table => {
        table.increments('id').primary();

        table.string('fp_hash').unique();

        table
          .integer('user_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('users')
          .onDelete('CASCADE');

        table.string('user_ip');

        // Trial start + expiry
        table.timestamp('started_at').defaultTo(pg.fn.now());
        table.timestamp('expires_at').notNullable();

        table.timestamp('created_at').defaultTo(pg.fn.now());
      })

      // Plans
      .createTable('plans', table => {
        table.increments('id').primary();
        table.string('name').notNullable().unique(); // 'lite', 'standard', 'pro', 'trial'
        table.integer('price_cents').notNullable(); // price in cents
        table.integer('duration').notNullable().defaultTo(1); // 1 month, 2 month ...
        table.integer('trial_days').defaultTo(0); // trial days
        table.timestamp('created_at').defaultTo(pg.fn.now());
      })

      // Subscriptions
      .createTable('subscriptions', table => {
        table.increments('id').primary();

        table
          .integer('user_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('users')
          .onDelete('CASCADE');

        table
          .integer('plan_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('plans')
          .onDelete('RESTRICT');

        table.string('status').notNullable().defaultTo('active'); // active, canceled, trialing, past_due

        table.integer('payed_amount_cents').defaultTo(0);

        table.dateTime('expires_at');

        table.timestamp('created_at').defaultTo(pg.fn.now());
      })

      // Promocodes
      .createTable('promocodes', table => {
        table.increments('id').primary();

        table.string('promocode');

        table
          .integer('user_id')
          .unsigned()
          .references('id')
          .inTable('users')
          .onDelete('CASCADE');

        table.boolean('used_promo').notNullable().defaultTo(false);

        table.timestamp('created_at').defaultTo(pg.fn.now());
      })

      // Refferals
      .createTable('refferals', table => {
        table.increments('id').primary();

        table
          .integer('user_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('users')
          .onDelete('CASCADE');

        table.string('own_refferal_code');
        table.integer('own_invites_count').unsigned();

        table.string('invited_by');
        table.string('invited_by_code');

        table.timestamp('created_at').defaultTo(pg.fn.now());
      })
  );
}

async function init() {
  try {
    const options =
      process.env.NODE_ENV === 'production'
        ? knexConfigs.production
        : knexConfigs.development;

    const pg = knex(options);

    await pg.transaction(async trx => {
      await up(trx);
    });

    console.log('✅ Successfully created all tables in transaction');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

init();
