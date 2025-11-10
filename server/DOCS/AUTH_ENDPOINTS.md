# Auth Endpoints - Token Handling

## Token Management Overview

All authentication endpoints now return both `accessToken` and `refreshToken` in the response body. The frontend is responsible for storing these tokens (typically in cookies) and sending them with subsequent requests.

## 1. Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

- **200 OK** - Login successful

```json
{
  "accessToken": "jwt_access_token_here",
  "refreshToken": "jwt_refresh_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "avatar_url": null,
    "is_oauth": false,
    "is_verified": true,
    "is_twofa": false
  }
}
```

## 2. Email Verification

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**

```json
{
  "otpCode": "123456"
}
```

**Response:**

- **200 OK** - Email verified successfully

```json
{
  "message": "Email verified successfully!",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "avatar_url": null,
    "is_oauth": false,
    "is_verified": true,
    "is_twofa": false
  },
  "accessToken": "jwt_access_token_here",
  "refreshToken": "jwt_refresh_token_here"
}
```

## 3. Validate Access Token

**Endpoint:** `POST /api/auth/validate-access-token`

**Description:** Validates if the provided access token is valid and returns user information.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response:**

- **200 OK** - Token is valid

```json
{
  "success": true,
  "message": "Access token is valid",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "avatar_url": null,
    "is_oauth": false,
    "is_verified": true,
    "is_twofa": false
  }
}
```

- **401 Unauthorized** - Token is invalid or expired

```json
{
  "success": false,
  "message": "Invalid or expired access token"
}
```

## 4. Validate Refresh Token

**Endpoint:** `POST /api/auth/validate-refresh-token`

**Description:** Validates if the provided refresh token is valid and returns user information.

**Request Body:**

```json
{
  "refreshToken": "jwt_refresh_token_here"
}
```

**Response:**

- **200 OK** - Token is valid

```json
{
  "success": true,
  "message": "Refresh token is valid",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "avatar_url": null,
    "is_oauth": false,
    "is_verified": true,
    "is_twofa": false
  }
}
```

- **401 Unauthorized** - Token is invalid or expired

```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

## 5. Refresh Tokens

**Endpoint:** `POST /api/auth/refresh-tokens`

**Description:** Refreshes both access and refresh tokens using the provided refresh token.

**Request Body:**

```json
{
  "refreshToken": "current_refresh_token_here"
}
```

**Response:**

- **200 OK** - Tokens refreshed successfully

```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "accessToken": "new_access_token_here",
  "refreshToken": "new_refresh_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "avatar_url": null,
    "is_oauth": false,
    "is_verified": true,
    "is_twofa": false
  }
}
```

- **401 Unauthorized** - Refresh token is invalid, expired, or missing

```json
{
  "success": false,
  "message": "Refresh token not found. Please login again."
}
```

## 6. 2FA Verification

**Endpoint:** `POST /api/auth/2fa/verify`

**Request Body:**

```json
{
  "userId": 1,
  "token": "123456"
}
```

**Response:**

- **200 OK** - 2FA verification successful

```json
{
  "success": true,
  "message": "2FA verification successful",
  "accessToken": "jwt_access_token_here",
  "refreshToken": "jwt_refresh_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "avatar_url": null,
    "is_oauth": false,
    "is_verified": true,
    "is_twofa": true
  }
}
```

## Usage Examples

### Login

```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

if (response.status === 200) {
  const data = await response.json();
  // Store tokens in cookies or localStorage
  document.cookie = `accessToken=${data.accessToken}; path=/; secure; samesite=strict`;
  document.cookie = `refreshToken=${data.refreshToken}; path=/; secure; samesite=strict`;
  console.log('Login successful:', data.user);
}
```

### Email Verification

```javascript
const response = await fetch('/api/auth/verify-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    otpCode: '123456',
  }),
});

if (response.status === 200) {
  const data = await response.json();
  // Store tokens in cookies
  document.cookie = `accessToken=${data.accessToken}; path=/; secure; samesite=strict`;
  document.cookie = `refreshToken=${data.refreshToken}; path=/; secure; samesite=strict`;
  console.log('Email verified:', data.user);
}
```

### Validate Access Token

```javascript
const response = await fetch('/api/auth/validate-access-token', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});

if (response.status === 200) {
  const data = await response.json();
  console.log('Access token is valid:', data.user);
} else {
  console.log('Access token is invalid');
}
```

### Validate Refresh Token

```javascript
const response = await fetch('/api/auth/validate-refresh-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    refreshToken: refreshToken,
  }),
});

if (response.status === 200) {
  const data = await response.json();
  console.log('Refresh token is valid:', data.user);
} else {
  console.log('Refresh token is invalid');
}
```

### Refresh Tokens

```javascript
const response = await fetch('/api/auth/refresh-tokens', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    refreshToken: currentRefreshToken,
  }),
});

if (response.status === 200) {
  const data = await response.json();
  // Update stored tokens
  document.cookie = `accessToken=${data.accessToken}; path=/; secure; samesite=strict`;
  document.cookie = `refreshToken=${data.refreshToken}; path=/; secure; samesite=strict`;
  console.log('Tokens refreshed successfully');
} else {
  console.log('Refresh failed, need to login again');
}
```

### 2FA Verification

```javascript
const response = await fetch('/api/auth/2fa/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 1,
    token: '123456',
  }),
});

if (response.status === 200) {
  const data = await response.json();
  // Store tokens in cookies
  document.cookie = `accessToken=${data.accessToken}; path=/; secure; samesite=strict`;
  document.cookie = `refreshToken=${data.refreshToken}; path=/; secure; samesite=strict`;
  console.log('2FA verification successful:', data.user);
}
```
