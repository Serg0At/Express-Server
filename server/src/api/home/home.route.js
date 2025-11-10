import express from 'express';
import HomeController from './home.controller.js';
import { validatePagination, validateIdParam, validateLimitQuery } from '../../validations/home.validation.js';

const router = express.Router();

// Get all news with pagination
router.get('/news', validatePagination, HomeController.getAllNews);

// Get all blogs with pagination
router.get('/blogs', validatePagination, HomeController.getAllBlogs);

// Get specific news by ID
router.get('/news/:id', validateIdParam, HomeController.getNewsById);

// Get specific blog by ID
router.get('/blogs/:id', validateIdParam, HomeController.getBlogById);

// Get latest news (for homepage/sidebar)
router.get('/latest-news', validateLimitQuery, HomeController.getLatestNews);

// Get latest blogs (for homepage/sidebar)
router.get('/latest-blogs', validateLimitQuery, HomeController.getLatestBlogs);

// Get homepage data (latest news + blogs)
router.get('/homepage', HomeController.getHomePageData);

export default router;