# Node Monolith Server

A well-designed, modular monolithic web server built with Node.js and Express.js, featuring integrated cryptocurrency trading arbitrage detection, user authentication, and comprehensive API endpoints.

## 🎯 Project Overview

Node Monolith Server is a feature-rich backend application designed for a cryptocurrency arbitrage scanner and screener platform. It provides a monolithic architecture with clear separation of concerns through modular API structure, real-time WebSocket support for cryptocurrency data streaming, and multiple microservice-like components running concurrently.

## ✨ Features

- **Multi-Server Architecture**: Run Express API server and WebSocket arbitrage server concurrently
- **Real-Time Cryptocurrency Data**: WebSocket-based live streaming of crypto market data via CCXT
- **User Authentication**: JWT-based auth with Passport.js, Google OAuth 2.0 integration
- **Security First**: Helmet.js for HTTP headers, rate limiting, password encryption with bcrypt
- **Database Support**: PostgreSQL with Sequelize ORM, MongoDB with Mongoose ODM
- **File Uploads**: Multer integration for file handling with static file serving
- **Email Integration**: Nodemailer for sending transactional emails
- **API Documentation**: Swagger/OpenAPI documentation with swagger-ui-express
- **Session Management**: Express-session with cookie-based and secure cookie handling
- **Validation**: Express-validator and Joi for request validation
- **Logging**: Winston for comprehensive application logging

## 🛠️ Tech Stack

### Core
- **Node.js** (ES6+ with ES Modules)
- **Express.js** ^4.18.2
- **WebSocket** (ws) ^8.18.3

### Database & ORM
- **PostgreSQL** with Sequelize ^6.35.2
- **MongoDB** with Mongoose ^8.3.2
- **Knex** ^3.1.0 (Query builder)
- **pg** ^8.11.3

### Authentication & Security
- **Passport.js** ^0.7.0
- **JWT** (jsonwebtoken) ^9.0.1
- **Passport Google OAuth 2.0** ^2.0.0
- **bcrypt** ^6.0.0 & bcryptjs ^2.4.3
- **Helmet** ^8.1.0

### Cryptocurrency
- **CCXT** ^4.4.99 (Unified crypto trading API)
- **Speakeasy** ^2.0.0 (2FA/TOTP support)
- **QR Code** ^1.5.4

### Utilities
- **dotenv** ^16.3.1
- **cors** ^2.8.5
- **uuid** ^11.1.0
- **nanoid** ^5.1.5
- **winston** ^3.17.0 (Logging)
- **nodemailer** ^6.10.1

### API Documentation
- **Swagger-JSDoc** ^6.2.8
- **Swagger-UI-Express** ^5.0.1

### Development
- **Nodemon** (auto-reload on file changes)
- **Concurrently** (run multiple scripts)
- **Biome** ^2.1.4 (Linting & formatting)
- **ESLint** ^9.33.0

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- PostgreSQL or MongoDB
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Serg0At/Node_Monolith_Server.git
   cd Node_Monolith_Server/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Required variables:
   ```env
   NODE_ENV=development
   PORT=5000
   WS_PORT=5001
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   MONGODB_URI=mongodb://localhost:27017/dbname
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   GOOGLE_CLIENT_ID=your_google_oauth_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_secret
   ```

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

5. **Seed initial data (optional)**
   ```bash
   npm run seed
   ```

## 🚀 Usage

### Development

Run all servers concurrently (Express + WebSocket Arbitrage):
```bash
npm run dev:all
```

Or run individual servers:
```bash
# Express API Server
npm run server:dev

# WebSocket Arbitrage Server
npm run arbitrage:dev

# Main unified server with WebSocket
npm run dev
```

### Production

Start all servers:
```bash
npm run start:all
```

Or individual servers:
```bash
npm run server    # Express API Server
npm run arbitrage # WebSocket Arbitrage Server
npm run start     # Unified server
```

## 📡 API Structure

### Available Routes

All API routes are prefixed with `/api`:

| Route | Module | Purpose |
|-------|--------|---------|
| `/api/auth` | Authentication | Login, signup, Google OAuth |
| `/api/user` | Users | User profile & settings |
| `/api/admin` | Administration | Admin dashboard & operations |
| `/api/home` | Home | General home page data |
| `/api/trial` | Trial | Free trial management |
| `/api/subscription` | Subscriptions | Subscription plans & management |

### Health Check

Monitor server status:
```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "service": "express-server",
  "timestamp": "2026-03-03T12:00:00.000Z"
}
```

### File Uploads

Upload and retrieve files via:
```
GET/POST /uploads/<filename>
```

## 🔒 Security Features

- **Helmet.js**: Secures HTTP headers against well-known vulnerabilities
- **Rate Limiting**: Express-rate-limit to prevent abuse
- **CORS**: Configurable cross-origin request handling
- **Password Encryption**: bcrypt with salt rounds
- **JWT Tokens**: Stateless authentication
- **Session Security**: Secure cookies in production
- **Input Validation**: Express-validator & Joi schemas
- **Error Handling**: Centralized error handler middleware

## 📊 Database

The application supports dual database setup:

### PostgreSQL (Primary)
- User data, authentication records
- Subscription & trial management
- Admin operations

### MongoDB (Alternative)
- Flexible schema documents
- Real-time data
- Log storage

Run migrations for PostgreSQL:
```bash
npm run migrate        # Create tables
npm run migrate-down   # Drop tables
```

## 🔄 WebSocket Server

Real-time cryptocurrency data streaming:

- **Port**: 5001 (default)
- **Protocol**: WebSocket (ws/wss)
- **Purpose**: Live arbitrage opportunities, market data streaming
- **Integration**: CCXT for multi-exchange support

## 📝 Scripts Reference

```json
{
  "dev": "nodemon src/index.js",
  "start": "node src/index.js",
  "server": "node src/server.js",
  "server:dev": "nodemon src/server.js",
  "arbitrage": "node src/arbitrage-server.js",
  "arbitrage:dev": "nodemon src/arbitrage-server.js",
  "dev:all": "concurrently npm run server:dev npm run arbitrage:dev",
  "start:all": "concurrently npm run server npm run arbitrage",
  "migrate": "node ./migrations/create_tables.js",
  "migrate-down": "node ./migrations/drop_tables.js",
  "seed": "node ./seed/seed.js"
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Use Biome for formatting
- Follow ESLint rules
- Run `prettier` on commit (lint-staged)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=3001
WS_PORT=3002
```

### Database Connection Issues
- Verify PostgreSQL/MongoDB is running
- Check DATABASE_URL in .env
- Run migrations: `npm run migrate`

### WebSocket Connection Failed
- Ensure WS_PORT is not blocked by firewall
- Check WebSocket URL in client: `ws://localhost:5001`

## 📞 Support

For issues and questions, please open an issue on GitHub or contact the development team.

---

**Last Updated**: 2026-03-03