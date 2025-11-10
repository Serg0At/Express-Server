import knex from 'knex';
import knexConfigs from '../config/knex.configs.js';

const pg = knex(knexConfigs.development);

export default class NewsModel {
  static async getAllNews(limit = 10, offset = 0) {
    return await pg('news')
      .select(
        'news.id',
        'news.title',
        'news.content',
        'news.image',
        'news.views',
        'news.created_at',
        'users.name as author_name',
      )
      .leftJoin('users', 'news.admin_id', 'users.id')
      .orderBy('news.created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  static async getNewsById(id) {
    return await pg('news')
      .select(
        'news.id',
        'news.title',
        'news.content',
        'news.image',
        'news.views',
        'news.created_at',
        'users.name as author_name',
      )
      .leftJoin('users', 'news.admin_id', 'users.id')
      .where('news.id', id)
      .first();
  }

  static async addView(id) {
    return await pg('news')
      .where('id', id)
      .increment('views', 1)
      .returning(['id', 'views']);
  }

  static async getNewsCount() {
    const result = await pg('news').count('id as count').first();
    return parseInt(result.count);
  }

  static async getLatestNews(limit = 5) {
    return await pg('news')
      .select(
        'news.id',
        'news.title',
        'news.content',
        'news.image',
        'news.views',
        'news.created_at',
        'users.name as author_name',
      )
      .leftJoin('users', 'news.admin_id', 'users.id')
      .orderBy('news.created_at', 'desc')
      .limit(limit);
  }
}
