// Local and NPM modules
import 'dotenv/config';
import path from 'path';
import passport from 'passport';
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

// Middlewares and utils
import './utils/passport.js';
import { securityMiddleware } from './middlewares/security.js';
import errorHandler from './utils/errorHandler.js';

// Routes
import authRouter from './api/auth/routes/auth.routes.js';
import userRouter from './api/users/user.routes.js';
import adminRouter from './api/admin/admin.routes.js';
import homeRouter from './api/home/home.route.js';
import trialRouter from './api/trials/trial.route.js';
import subscriptionRouter from './api/subscriptions/subscriptions.route.js';

// Socket Server
import {
  app as arbitrageApp,
  initWebSocketServer,
  main,
} from './cryptoParser/index.js';

// Constants
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Server middleware
app.use(securityMiddleware);

app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

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

// For uploads make static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', (req, res, next) => {
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// WS arbitrage server
app.use(arbitrageApp);

// Main routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/home', homeRouter);
app.use('/api/trial', trialRouter);
app.use('/api/subscription', subscriptionRouter)

// Handling 404 errors if not founded route of backend
app.use((req, res, next) => {
  res.status(404).json({ status: 404, message: 'API route not found. :)' });
});

app.use(errorHandler);

const start = async () => {
  try {
    const wsServer = initWebSocketServer(server);

    // Arbitrage, sockets server
    await main();

    // Main server
    server.listen(PORT, () => {
      console.log(`Сервер запущен на http://localhost:${PORT}`);
      console.log(`WebSocket доступен на ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.log('Ошибка при запуске:', error);
  }
};

start();
