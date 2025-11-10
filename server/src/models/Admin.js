import knex from 'knex';
import knexConfigs from '../config/knex.configs.js';
import { nanoid } from 'nanoid';

const pg = knex(knexConfigs.development);

export async function getSubscriptionCounts() {
  try {
    const result = await pg('subscriptions as s')
      .join('plans as p', 's.plan_id', 'p.id')
      .select(
        pg.raw(`
          CASE 
            WHEN UPPER(p.name) LIKE 'LITE%' THEN 'Lite'
            WHEN UPPER(p.name) LIKE 'STANDARD%' THEN 'Standard'
            WHEN UPPER(p.name) LIKE 'PRO%' THEN 'Pro'
            ELSE p.name
          END AS plan
        `),
      )
      .count('* as count')
      .where('s.status', 'active').groupByRaw(`
        CASE 
          WHEN UPPER(p.name) LIKE 'LITE%' THEN 'Lite'
          WHEN UPPER(p.name) LIKE 'STANDARD%' THEN 'Standard'
          WHEN UPPER(p.name) LIKE 'PRO%' THEN 'Pro'
          ELSE p.name
        END
      `);

    const subscriptions = { Lite: 0, Standard: 0, Pro: 0 };
    result.forEach(row => {
      const plan = row.plan;
      if (subscriptions.hasOwnProperty(plan)) {
        subscriptions[plan] = Number(row.count);
      }
    });

    return subscriptions;
  } catch (err) {
    console.error('Error getting subscription counts:', err);
    return { Lite: 0, Standard: 0, Pro: 0 }; // fallback
  }
}

export async function getTrialsCount() {
  try {
    const result = await pg('trials')
    .count('id as count')
    .first();

    return result
  } catch (err) {
    console.error('Error getting trials count:', err);
    throw err;
  }
}


export async function getAllUsers() {
  try {
    const result = await pg('users')
      .select(
        'id',
        'name',
        'email',
        'role',
        'is_verified',
        'created_at',
        'last_login_at',
      )
      .orderBy('created_at', 'desc');
    return result;
  } catch (err) {
    console.error('Error getting all users:', err);
    throw err;
  }
}

export async function getTotalUsersCount() {
  try {
    const result = await pg('users').count('id as total').first();
    return parseInt(result.total);
  } catch (err) {
    console.error('Error getting total users count:', err);
    throw err;
  }
}

export async function assignSubscription(userId, planId, duration) {
  try {
    // Find plan
    const plan = await pg('plans').where({ id: planId }).first();

    if (!plan) {
      return { success: false, message: `Plan "${planId}" not found` };
    }

    let expiresAt = null;

    if (plan.trial_days > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + plan.trial_days);
    } else if (duration > 0) {
      expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + parseInt(duration));
    }

    // Existing sub / trial
    const existingSub = await pg('subscriptions')
      .where('user_id', userId)
      .first();

    const existingTrial = await pg('trials').where('user_id', userId).first();

    // If trying to assign TRIAL but user has ACTIVE subscription → block
    if (
      plan.trial_days > 0 &&
      existingSub &&
      existingSub.status !== 'canceled'
    ) {
      return {
        success: false,
        message: 'User already has an active subscription, cannot assign trial',
      };
    }

    // If trying to assign SUBSCRIPTION but user has trial → block
    if (plan.trial_days === 0 && existingTrial) {
      return {
        success: false,
        message: 'User already has a trial, cannot assign subscription',
      };
    }

    // Insert trial
    if (plan.trial_days > 0 && !existingTrial) {
      await pg('trials').insert({
        user_id: userId,
        expires_at: expiresAt,
      });
      return { success: true, message: 'Trial assigned successfully' };
    }

    // Insert or update subscription
    if (existingSub) {
      await pg('subscriptions').where('user_id', userId).update({
        plan_id: planId,
        status: 'active',
        expires_at: expiresAt,
      });
    } else {
      await pg('subscriptions').insert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        expires_at: expiresAt,
      });
    }

    return { success: true, message: 'Subscription assigned successfully' };
  } catch (err) {
    console.error('Error assigning subscription:', err);
    throw err;
  }
}

export async function removeSubscription(userId) {
  try {
    const existingTrial = await pg('trials').where({ user_id: userId }).first();

    if (existingTrial) {
      await pg('trials').where({ user_id: userId }).del();

      return { success: true, message: 'Trial removed' };
    }

    const existingSub = await pg('subscriptions')
      .where({ user_id: userId })
      .first();

    if (existingSub) {
      await pg('subscriptions').where({ user_id: userId }).update({
        status: 'canceled',
        expires_at: new Date(),
      });

      return { success: true, message: 'Subscription canceled' };
    }

    return { success: false, message: 'No subscription or trial found' };
  } catch (err) {
    console.error('Error removing subscription:', err);
    throw err;
  }
}

export async function createNews(adminId, title, content, image) {
  try {
    // Проверяем, существует ли таблица news
    const tableExists = await pg.schema.hasTable('news');

    if (!tableExists) {
      // Если таблицы нет, создаем её
      await pg.schema.createTable('news', table => {
        table.increments('id').primary();
        table.integer('admin_id').notNullable();
        table.string('title').notNullable();
        table.text('content').notNullable();
        table.string('image');
        table.timestamp('created_at').defaultTo(pg.fn.now());
        table.foreign('admin_id').references('id').inTable('users');
      });
    }

    const result = await pg('news')
      .insert({
        admin_id: adminId,
        title: title,
        content: content,
        image: image,
      })
      .returning('id');

    return result[0];
  } catch (err) {
    console.error('Error creating news:', err);
    throw err;
  }
}

export async function createBlog(adminId, title, content, image) {
  try {
    // Проверяем, существует ли таблица blogs
    const tableExists = await pg.schema.hasTable('blogs');

    if (!tableExists) {
      // Если таблицы нет, создаем её
      await pg.schema.createTable('blogs', table => {
        table.increments('id').primary();
        table.integer('admin_id').notNullable();
        table.string('title').notNullable();
        table.text('content').notNullable();
        table.string('image');
        table.timestamp('created_at').defaultTo(pg.fn.now());
        table.foreign('admin_id').references('id').inTable('users');
      });
    }

    const result = await pg('blogs')
      .insert({
        admin_id: adminId,
        title: title,
        content: content,
        image: image,
      })
      .returning('id');

    return result[0];
  } catch (err) {
    console.error('Error creating blog:', err);
    throw err;
  }
}

export async function generatePromoCode() {
  try {
    // Генерируем 6-значный промокод
    const promoCode = nanoid(6).toUpperCase();

    // Проверяем, существует ли таблица promo_codes
    const tableExists = await pg.schema.hasTable('promo_codes');

    if (!tableExists) {
      // Если таблицы нет, создаем её
      await pg.schema.createTable('promo_codes', table => {
        table.increments('id').primary();
        table.string('code').notNullable().unique();
        table.boolean('is_active').defaultTo(true);
        table.integer('max_uses').defaultTo(100);
        table.integer('used_count').defaultTo(0);
        table.timestamp('expires_at');
        table.timestamp('created_at').defaultTo(pg.fn.now());
      });
    }

    // Сохраняем промокод в базу
    await pg('promo_codes').insert({
      code: promoCode,
      is_active: true,
      max_uses: 100,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 год
    });

    return promoCode;
  } catch (err) {
    console.error('Error generating promo code:', err);
    throw err;
  }
}
