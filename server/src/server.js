import 'dotenv/config';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { fileURLToPath } from 'url';
import path from 'path';

import './utils/passport.js';
import { securityMiddleware } from './middlewares/security.js';
import errorHandler from './utils/errorHandler.js';
import authRouter from './api/auth/routes/auth.routes.js';
import userRouter from './api/users/user.routes.js';
import adminRouter from './api/admin/admin.routes.js';
import homeRouter from './api/home/home.route.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(securityMiddleware);

// Middleware
app.use(cookieParser());
app.use(express.json());

// Session middleware for OAuth referral codes
app.use(
  session({
    secret: process.env.SESSION_SECRET || '9278t2f3gf9n82t7',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());

// For uploads make static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Main routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/home', homeRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'express-server',
    timestamp: new Date().toISOString(),
  });
});

// Handling 404 errors if not founded route of backend
app.use((req, res, next) => {
  res.status(404).json({ status: 404, message: 'Маршрут не найден' });
});

app.use(errorHandler);

const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Express сервер запущен на http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log('Ошибка при запуске Express сервера:', error);
  }
};

start();
