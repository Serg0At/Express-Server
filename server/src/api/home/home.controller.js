import HomeService from './home.service.js';

export default class HomeController {
  static async getAllNews(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await HomeService.getAllNews(page, limit);
      
      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllBlogs(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await HomeService.getAllBlogs(page, limit);
      
      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getNewsById(req, res, next) {
    try {
      const { id } = req.params;
      const news = await HomeService.getNewsById(id);
      
      if (!news) {
        return res.status(404).json({
          success: false,
          error: 'News not found'
        });
      }

      return res.json({
        success: true,
        data: news
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBlogById(req, res, next) {
    try {
      const { id } = req.params;
      const blog = await HomeService.getBlogById(id);
      
      if (!blog) {
        return res.status(404).json({
          success: false,
          error: 'Blog not found'
        });
      }

      return res.json({
        success: true,
        data: blog
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLatestNews(req, res, next) {
    try {
      const { limit } = req.query;
      const news = await HomeService.getLatestNews(limit);
      
      return res.json({
        success: true,
        data: news
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLatestBlogs(req, res, next) {
    try {
      const { limit } = req.query;
      const blogs = await HomeService.getLatestBlogs(limit);
      
      return res.json({
        success: true,
        data: blogs
      });
    } catch (error) {
      next(error);
    }
  }

  static async getHomePageData(req, res, next) {
    try {
      const data = await HomeService.getHomePageData();
      
      return res.json({
        success: true,
        data: data
      });
    } catch (error) {
      next(error);
    }
  }
}