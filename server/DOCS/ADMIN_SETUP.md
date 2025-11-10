# Setup Admin Panel:

## Problems that were fixed.

1. ✅ **Admin routes were not connected to the main server** - now they work on port 5000
2. ✅ **Middleware for admin** - added middleware `AdminMiddleware.checkIfAdmin`
3. ✅ **Doubled services** - removed separate server on port 4000
4. ✅ **Frontend connects to the correct port** - now uses port 5000

## Existing data base:

You already have a ready-made PostgreSQL database with tables.

- `users' - users with ``role'' (user, admin, etc.)
- `subscriptions' - поптиски пользователи:
- `news' - новости
- `blogs' - блоги
- `promocodes' - промокоды:
- and other tables

### Data for logging into the admin panel.

**Option 1: Use the existing admin from the seed file**

- **Email:** serg114454@gmail.com
- **Password:** value from variable `ADMIN_PASSWORD` in `.env` file

**Примечание:** If you already have a user with a role. 'admin' in the data base, you can use his account data directly.

**Option 2: Create a new admin**

- **Email:** admin@example.com:
- **Password:** admin123:

### 4. Starting the server

```bash
npm run dev:
```

## API Endpoints:

### Admin API (requires authorization and administrator rights).

- `GET /api/admin/subscriptions' - get subscription statistics
- `GET /api/admin/users' - get all users
- `POST /api/admin/users/:userId/subscription` - наченить подписку
- `DELETE /api/admin/users/:userId/subscription` - delete subscription
- `POST /api/admin/news` - ​​составка новость:
- `POST /api/admin/blog` - create a blog
- `POST /api/admin/promo' - сгенерировать промокод:

## Security:

- All admin routes are protected by middleware ``AdminMiddleware.checkIfAdmin''
- JWT token and administrator rights are checked
- The user must have a role. 'admin' in database

## File structure:

```
server/src/
├── api/admin/
│ ├── admin.routes.js # Admin routes:
│ └── db/
│ └── admin.js # Functions for working with BD
├── middlewares/
│ └── admin.js # Middleware for admin verification:
└── index.js # Main server (admin routes connected)
```

## Testing:

1. Make sure that the data base connection parameters are correctly configured in the `.env` file
2. Start the server. `npm run dev`
3. Open the admin panel. ``http://localhost:3000/admin''
4. Log in with administrator credentials
5. Check the operation of all functions

## Possible problems:

- **401 Unauthorized** - invalid or missing token
- **403 Forbidden** - the user is not an administrator
- **500 Database error** - problems with the database

## Adding new admin functions.

1. Add a route to `admin.routes.js`
2. Add the corresponding function to `db/admin.js`
3. Update the frontend to work with the new API