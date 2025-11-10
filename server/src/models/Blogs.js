import knex from 'knex';
import knexConfigs from '../config/knex.configs.js';

const pg = knex(knexConfigs.development);

export default class BlogsModel {
  static async getAllBlogs(limit = 10, offset = 0) {
    return await pg('blogs')
      .select(
        'blogs.id',
        'blogs.title',
        'blogs.content',
        'blogs.image',
        'blogs.created_at',
        'blogs.views',
        'users.name as author_name',
      )
      .leftJoin('users', 'blogs.admin_id', 'users.id')
      .orderBy('blogs.created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  static async getBlogById(id) {
    return await pg('blogs')
      .select(
        'blogs.id',
        'blogs.title',
        'blogs.content',
        'blogs.image',
        'blogs.created_at',
        'blogs.views',
        'users.name as author_name',
      )
      .leftJoin('users', 'blogs.admin_id', 'users.id')
      .where('blogs.id', id)
      .first();
  }

  static async addView(id) {
    return await pg('blogs')
      .where('id', id)
      .increment('views', 1)
      .returning(['id', 'views']);
  }

  static async getBlogsCount() {
    const result = await pg('blogs').count('id as count').first();
    return parseInt(result.count);
  }

  static async getLatestBlogs(limit = 5) {
    return await pg('blogs')
      .select(
        'blogs.id',
        'blogs.title',
        'blogs.content',
        'blogs.image',
        'blogs.created_at',
        'blogs.views',
        'users.name as author_name',
      )
      .leftJoin('users', 'blogs.admin_id', 'users.id')
      .orderBy('blogs.created_at', 'desc')
      .limit(limit);
  }
}
