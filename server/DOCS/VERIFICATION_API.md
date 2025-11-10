# User Verification API

This document describes the email verification endpoints for user account operations.

## Endpoints

### Send Verification Code

Send a 6-digit verification code to the user's email address.

```
POST /api/user/send-verify-code
Authorization: Bearer <token>
```

**Request:**

- No body required
- Requires valid JWT token

**Response:**

```json
{
  "success": true,
  "message": "Verification code sent to your email",
  "expiresAt": "2024-01-01T12:15:00.000Z"
}
```

**Rate Limiting:**

- 5 requests per 15 minutes per IP

### Validate Verification Code

Validate the 6-digit verification code sent to user's email.

```
POST /api/user/validate-verify-code
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "otpCode": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Verification code validated successfully"
}
```

**Validation Rules:**

- `otpCode`: Must be exactly 6 digits, numbers only

**Rate Limiting:**

- 5 requests per 15 minutes per IP

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Verification code must be exactly 6 digits"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "User not found"
}
```

### 400 Invalid Code

```json
{
  "success": false,
  "error": "Invalid verification code"
}
```

### 400 Expired Code

```json
{
  "success": false,
  "error": "Verification code has expired. Please request a new one."
}
```

### 429 Rate Limited

```json
{
  "error": "Too many verification email requests, please try later"
}
```

## Usage Flow

1. **Request Verification Code**

   ```javascript
   const response = await fetch('/api/user/send-verify-code', {
     method: 'POST',
     headers: {
       Authorization: `Bearer ${token}`,
     },
   });
   ```

2. **User Receives Email**
   - 6-digit code sent to user's registered email
   - Code expires in 15 minutes

3. **Validate Code**
   ```javascript
   const response = await fetch('/api/user/validate-verify-code', {
     method: 'POST',
     headers: {
       Authorization: `Bearer ${token}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       otpCode: '123456',
     }),
   });
   ```

## Security Features

- **Rate Limiting**: Prevents spam and abuse
- **Code Expiration**: Codes expire after 15 minutes
- **Single Use**: Codes are cleared after successful validation
- **Secure Generation**: Cryptographically secure random 6-digit codes
- **Email Validation**: Only sent to verified email addresses

## Database Schema

The verification system uses the following fields in the `users` table:

```sql
otp_code VARCHAR(6)           -- 6-digit verification code
otp_code_expires_at TIMESTAMP -- Expiration timestamp
```

## Email Template

The verification email uses the existing `VERIFICATION_EMAIL_TEMPLATE` with:

- Professional styling
- Clear 6-digit code display
- Expiration notice
- Security disclaimer

## Integration Examples

### Frontend React Component

```jsx
const [otpCode, setOtpCode] = useState('');
const [isLoading, setIsLoading] = useState(false);

const sendVerificationCode = async () => {
  setIsLoading(true);
  try {
    const response = await fetch('/api/user/send-verify-code', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();
    if (data.success) {
      alert('Verification code sent to your email');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsLoading(false);
  }
};

const validateCode = async () => {
  try {
    const response = await fetch('/api/user/validate-verify-code', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otpCode }),
    });
    const data = await response.json();
    if (data.success) {
      alert('Code validated successfully');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Testing

### Test Send Verification Code

```bash
curl -X POST http://localhost:5000/api/user/send-verify-code \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Validate Code

```bash
curl -X POST http://localhost:5000/api/user/validate-verify-code \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"otpCode": "123456"}'
```
