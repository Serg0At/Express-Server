import express from 'express';
import AdminMiddleware from '../../middlewares/admin.js';
import upload from '../../middlewares/multer.js';
import {
  getSubscriptions,
  getTrials,
  getUsers,
  getUsersCount,
  assignUserSubscription,
  removeUserSubscription,
  createNewsPost,
  createBlogPost,
  generatePromo,
} from './admin.controller.js';

const router = express.Router();

// Применяем middleware для проверки админа ко всем роутам
router.use(AdminMiddleware.checkIfAdmin);

// Получить статистику подписок
router.get('/subscriptions', getSubscriptions);

router.get('/trials', getTrials);

// Получить всех пользователей
router.get('/users', getUsers);

// Получить общее количество пользователей
router.get('/users/count', getUsersCount);

// Назначить подписку пользователю
router.post('/users/:userId/subscription', assignUserSubscription);

// Удалить подписку пользователя
router.delete('/users/:userId/subscription', removeUserSubscription);

// Создать новость
router.post('/news', upload.single('news'), createNewsPost);

// Создать блог
router.post('/blog', upload.single('blogs'), createBlogPost);

// Сгенерировать промокод
router.post('/promo', generatePromo);

export default router;
