# Authentication APIs

Endpoints for user authentication and session management.

---

## POST /api/auth/signup

Create a new user account with username and password.

### Authentication
None required

### Rate Limit
5 requests per hour per IP

### Request Body
```json
{
  "username": "string (required, 3-30 chars, alphanumeric + underscore)",
  "password": "string (required, 8+ chars, must contain letter + number)",
  "email": "string (optional, valid email)",
  "displayName": "string (optional, 1-50 chars)"
}
```

### Success Response (201)
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_abc123",
    "username": "johndoe",
    "email": "john@example.com",
    "displayName": "John Doe",
    "createdAt": "2026-01-06T12:00:00.000Z"
  }
}
```

### Error Responses

**400 Bad Request** - Validation failed
```json
{
  "ok": false,
  "error": "Username already taken"
}
```

**429 Too Many Requests** - Rate limit exceeded
```json
{
  "ok": false,
  "error": "Too many signup attempts. Please try again later."
}
```

### Validation Rules

**Username:**
- 3-30 characters
- Alphanumeric characters and underscores only
- Case-insensitive (stored as lowercase)
- Must be unique
- Reserved words blocked (admin, root, api, etc.)

**Password:**
- Minimum 8 characters
- Maximum 128 characters
- Must contain at least one letter
- Must contain at least one number

**Email:**
- Valid email format
- Optional field
- Must be unique if provided

### Example

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "armyfan123",
    "password": "SecurePass123",
    "email": "fan@example.com",
    "displayName": "ARMY Fan"
  }'
```

---

## POST /api/auth/signin

Sign in with username/email and password.

### Authentication
None required

### Rate Limit
10 requests per 15 minutes per IP

### Request Body
```json
{
  "usernameOrEmail": "string (required)",
  "password": "string (required)"
}
```

### Success Response (200)
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_abc123",
    "username": "johndoe",
    "email": "john@example.com",
    "displayName": "John Doe"
  }
}
```

### Error Responses

**401 Unauthorized** - Invalid credentials
```json
{
  "ok": false,
  "error": "Invalid username or password"
}
```

**429 Too Many Requests** - Rate limit exceeded
```json
{
  "ok": false,
  "error": "Too many login attempts. Please try again in 15 minutes."
}
```

### Token Details

**JWT Token:**
- Algorithm: HS256
- Expiration: 7 days
- Payload includes: `userId`, `username`, `email`
- Must be sent in `Authorization: Bearer <token>` header

### Example

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "armyfan123",
    "password": "SecurePass123"
  }'
```

---

## Using Authentication Tokens

### In API Requests

Include the token in the `Authorization` header:

```bash
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### In Frontend (JavaScript)

```javascript
// Store token after signup/signin
localStorage.setItem('authToken', response.token)

// Use in API requests
const response = await fetch('/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})
```

### Token Expiration

- JWT tokens expire after 7 days
- When a token expires, user must sign in again
- No refresh token mechanism currently (planned for future)

---

## Firebase Authentication

ARMYVERSE also supports Firebase authentication for social logins.

### Supported Providers
- Google
- Twitter
- (More providers can be added)

### Using Firebase Auth

1. User signs in via Firebase SDK (client-side)
2. Get Firebase ID token: `await user.getIdToken()`
3. Send token in `Authorization: Bearer <firebase-token>` header
4. Server validates token via Firebase Admin SDK

### Example

```javascript
// Client-side with Firebase
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

const provider = new GoogleAuthProvider()
const result = await signInWithPopup(auth, provider)
const token = await result.user.getIdToken()

// Use token in API requests
const response = await fetch('/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## Unified Authentication

The server supports both JWT and Firebase tokens seamlessly:

1. **Server receives request** with `Authorization: Bearer <token>`
2. **Token type detection**: JWT or Firebase
3. **Validation**: Verify signature and expiration
4. **User lookup**: Find user in database
5. **Request proceeds** with authenticated user

---

## Security Best Practices

### For Developers

- ✅ Always use HTTPS in production
- ✅ Store JWT_SECRET securely (never commit to Git)
- ✅ Use strong, random secrets (64+ characters)
- ✅ Implement rate limiting on auth endpoints
- ✅ Log failed authentication attempts
- ✅ Validate all inputs on server-side

### For Users

- ✅ Use strong, unique passwords
- ✅ Don't share your credentials
- ✅ Sign out on shared devices
- ✅ Enable 2FA when available (future feature)

---

## Common Issues

### "Invalid token" Error

**Causes:**
- Token expired (JWT tokens last 7 days)
- Token format incorrect
- JWT_SECRET changed on server
- Token tampered with

**Solution:**
- Sign in again to get new token
- Check token format (should start with `eyJ`)
- Ensure `Authorization: Bearer ` prefix is correct

### "Username already taken"

**Causes:**
- Username exists in database
- Username matches reserved word

**Solution:**
- Choose a different username
- Check if you already have an account

### Rate Limit Exceeded

**Causes:**
- Too many signup attempts (5/hour)
- Too many signin attempts (10/15min)

**Solution:**
- Wait for rate limit window to reset
- Use different IP address (not recommended)

---

## Future Enhancements

Planned authentication features:

- [ ] Password reset via email
- [ ] Email verification
- [ ] Two-factor authentication (2FA)
- [ ] Account linking (merge Firebase + JWT accounts)
- [ ] Session management (view active sessions)
- [ ] Refresh tokens (extend sessions without re-login)
- [ ] OAuth providers (GitHub, Discord)
- [ ] Username changes (with cooldown)
- [ ] Login history and audit log

---

## Related Documentation

- [User APIs](./user.md) - Profile and settings
- [Authentication Feature Guide](../features/authentication.md) - Overview
- [Environment Variables](../setup/environment-variables.md) - JWT_SECRET setup

---

**Last Updated**: January 2026
