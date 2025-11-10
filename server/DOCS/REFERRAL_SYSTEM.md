# Referral System Documentation

## Overview

The referral system allows users to invite friends and earn rewards when their referrals purchase subscription plans.

## How It Works

### 1. User Registration with Referral Code Generation

- When a user registers, a unique referral code is automatically generated
- The referral code is stored in the `refferals` table
- Users can find their referral code and URL in their profile

### 2. Referral Registration Process

- New users can register using a referral link: `/register?ref=REFERRALCODE`
- The referral code can also be entered manually during registration
- The system validates the referral code before allowing registration
- If valid, the new user is linked to the referrer in the database

### 3. Reward System (Future Implementation)

- When a referred user purchases a subscription plan, the referrer receives a promo code
- The promo code is sent via email to the referrer
- Promo codes are stored in the `promocodes` table

## API Endpoints

### User Referral Endpoints (Authenticated)

- `GET /api/user/referral/info` - Get user's referral information
- `GET /api/user/referral/stats` - Get detailed referral statistics
- `GET /api/user/referral/invited-users` - Get list of invited users

### Public Referral Endpoints

- `GET /api/user/referral/validate/:referralCode` - Validate a referral code

### Registration Endpoints

- `POST /api/auth/register` - Register with optional referralCode in body
- `POST /api/auth/register/:referralCode` - Register with referral code in URL

## Database Schema

### refferals Table

```sql
- id (primary key)
- user_id (foreign key to users table)
- own_refferal_code (user's unique referral code)
- own_invites_count (number of successful invites)
- invited_by (name of person who invited this user)
- invited_by_code (referral code used to register)
- created_at (timestamp)
```

### promocodes Table

```sql
- id (primary key)
- user_id (foreign key to users table)
- promocode (unique promo code)
- used_promo (boolean, default false)
- created_at (timestamp)
```

## Frontend Integration

### Profile Page

- Displays user's referral code and URL
- Shows referral statistics (total invites, invited by whom)
- Copy-to-clipboard functionality for referral URL

### Registration Page

- Accepts referral codes from URL parameters (`?ref=CODE`)
- Manual referral code input field
- Real-time validation of referral codes
- Shows referrer information when valid code is entered

## Usage Examples

### Getting User's Referral Info

```javascript
const response = await axios.get('/api/user/referral/info', {
  headers: { Authorization: `Bearer ${token}` },
});
// Returns: { referralCode, inviteCount, invitedBy, referralUrl }
```

### Registering with Referral Code

```javascript
const response = await axios.post('/api/auth/register', {
  email: 'user@example.com',
  password: 'password123',
  referralCode: 'ABC123DEF',
});
```

### Validating Referral Code

```javascript
const response = await axios.get('/api/user/referral/validate/ABC123DEF');
// Returns: { valid: true, referrer: { name, email } }
```

## Future Enhancements

1. **Subscription Integration**: Complete the reward system when subscription plans are ready
2. **Referral Tiers**: Implement multi-level referral rewards
3. **Analytics Dashboard**: Add detailed referral analytics for users
4. **Custom Referral Codes**: Allow users to customize their referral codes
5. **Social Sharing**: Add social media sharing buttons for referral links
6. **Referral Contests**: Implement time-limited referral competitions

## Notes

- Referral codes are case-insensitive
- Only verified users can be referrers
- The system prevents self-referrals
- Referral relationships are permanent and cannot be changed
- Promo code emails are sent automatically when referrals make purchases
