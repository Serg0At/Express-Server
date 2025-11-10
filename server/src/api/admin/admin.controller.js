
import {
  getSubscriptionCounts,
  getTrialsCount,
  getAllUsers,
  getTotalUsersCount,
  assignSubscription,
  removeSubscription,
  createNews,
  createBlog,
  generatePromoCode,
} from '../../models/Admin.js';

// Получить статистику подписок
export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await getSubscriptionCounts();
    res.json(subscriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

export const getTrials = async (req, res) => {
  try {
    const trials = await getTrialsCount();
    res.json({ Trial: Number( trials.count )});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Получить всех пользователей
export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error('Error getting users:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
};

// Получить общее количество пользователей
export const getUsersCount = async (req, res) => {
  try {
    const totalUsers = await getTotalUsersCount();
    res.json({ totalUsers });
  } catch (err) {
    console.error('Error getting total users count:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
};

// Назначить подписку пользователю
export const assignUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { planId, duration } = req.body;

    if (!planId || !duration) {
      return res.status(400).json({
        error: 'Missing required fields: planId and duration',
      });
    }

    const result = await assignSubscription(userId, planId, duration);

    if (!result.success) {
      return res.status(400).json({ result });
    }

    res.json(result);
  } catch (err) {
    console.error('Error assigning subscription:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
};

// Удалить подписку пользователя
export const removeUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await removeSubscription(userId);

    if (!result.success) {
      return res.status(400).json({ result });
    }

    res.json(result);
  } catch (err) {
    console.error('Error removing subscription:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
};

// Создать новость
export const createNewsPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const adminId = req.user.user_id || req.user.id;
    const imagePath = req.file ? req.file.filename : null;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing required fields: title and content',
      });
    }

    const newsId = await createNews(adminId, title, content, imagePath);

    res.json({
      message: 'News created successfully',
      newsId,
      title,
      content,
      image: imagePath,
      adminId,
    });
  } catch (err) {
    console.error('Error creating news:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
};

// Создать блог
export const createBlogPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const adminId = req.user.user_id || req.user.id;
    const imagePath = req.file ? req.file.filename : null;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing required fields: title and content',
      });
    }

    const blogId = await createBlog(adminId, title, content, imagePath);

    res.json({
      message: 'Blog created successfully',
      blogId,
      title,
      content,
      image: imagePath,
      adminId,
    });
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
};

// Сгенерировать промокод
export const generatePromo = async (req, res) => {
  try {
    const promoCode = await generatePromoCode();

    res.json({
      message: 'Promo code generated successfully',
      promoCode,
    });
  } catch (err) {
    console.error('Error generating promo code:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
};
