import NewsModel from '../../models/News.js';
import BlogsModel from '../../models/Blogs.js';

export default class HomeService {
  static getImageUrl(filename, type) {
    if (!filename) return null;
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${type}/${filename}`;
  }

  static async getAllNews(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const news = await NewsModel.getAllNews(limit, offset);
    const totalCount = await NewsModel.getNewsCount();

    // Format news with simple image URLs
    const formattedNews = news.map(item => ({
      ...item,
      image_url: this.getImageUrl(item.image, 'news'),
      content_preview: this.truncateContent(item.content, 200),
    }));

    return {
      news: formattedNews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  static async getAllBlogs(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const blogs = await BlogsModel.getAllBlogs(limit, offset);
    const totalCount = await BlogsModel.getBlogsCount();

    // Format blogs with simple image URLs
    const formattedBlogs = blogs.map(item => ({
      ...item,
      image_url: this.getImageUrl(item.image, 'blogs'),
      content_preview: this.truncateContent(item.content, 200),
    }));

    return {
      blogs: formattedBlogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  static async getNewsById(id) {
    const news = await NewsModel.getNewsById(id);

    if (!news) {
      return null;
    }

    await NewsModel.addView(id);

    return {
      ...news,
      image_url: this.getImageUrl(news.image, 'news'),
    };
  }

  static async getBlogById(id) {
    const blog = await BlogsModel.getBlogById(id);

    if (!blog) {
      return null;
    }

    await BlogsModel.addView(id);

    return {
      ...blog,
      image_url: this.getImageUrl(blog.image, 'blogs'),
    };
  }

  static async getLatestNews(limit = 5) {
    const news = await NewsModel.getLatestNews(limit);

    return news.map(item => ({
      ...item,
      image_url: this.getImageUrl(item.image, 'news'),
      content_preview: this.truncateContent(item.content, 100),
    }));
  }

  static async getLatestBlogs(limit = 5) {
    const blogs = await BlogsModel.getLatestBlogs(limit);

    return blogs.map(item => ({
      ...item,
      image_url: this.getImageUrl(item.image, 'blogs'),
      content_preview: this.truncateContent(item.content, 100),
    }));
  }

  static async getHomePageData() {
    const [latestNews, latestBlogs] = await Promise.all([
      this.getLatestNews(3),
      this.getLatestBlogs(3),
    ]);

    return {
      latest_news: latestNews,
      latest_blogs: latestBlogs,
    };
  }

  // Helper method to truncate content for previews
  static truncateContent(content, maxLength) {
    if (!content || content.length <= maxLength) {
      return content;
    }

    return content.substring(0, maxLength).trim() + '...';
  }
}
