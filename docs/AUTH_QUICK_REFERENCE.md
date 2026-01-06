# Authentication Quick Reference Card

## 🚀 Quick Start (3 Steps)

### 1. Add Environment Variable
```bash
# Add to .env.local
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
```

### 2. Restart Server
```bash
npm run dev
```

### 3. Test It
Go to `/auth/signup` and create an account with just username + password!

---

## 📋 API Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| `POST` | `/api/auth/signup` | Username signup | No |
| `POST` | `/api/auth/signin` | Username signin | No |
| `GET` | `/api/user/profile` | Get user profile | Yes |
| `PUT` | `/api/user/profile` | Update profile | Yes |

---

## 🔑 Request Examples

### Signup
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "username": "johndoe",        # Required
  "password": "SecurePass123",  # Required
  "name": "John Doe",           # Optional
  "email": "john@example.com"   # Optional
}
```

### Signin
```bash
POST /api/auth/signin
Content-Type: application/json

{
  "usernameOrEmail": "johndoe",  # Username OR email
  "password": "SecurePass123"
}
```

### Authenticated Request
```bash
GET /api/user/profile
Authorization: Bearer <JWT_TOKEN>
```

---

## ✅ Validation Rules

### Username
- Length: 3-30 characters
- Format: `[a-z0-9_]` (lowercase, numbers, underscore)
- Unique: Must be unique across all users
- Reserved: Can't use `admin`, `root`, `system`, etc.

### Password
- Length: 8-128 characters
- Must contain: At least 1 letter + 1 number
- Hashed: Using bcrypt (10 rounds)

### Email (Optional)
- Format: Valid email address
- Unique: If provided, must be unique

---

## 🔒 Security Features

| Feature | Implementation |
|---------|----------------|
| Password Hashing | bcrypt (10 rounds) |
| Token Type | JWT (7-day expiration) |
| Rate Limiting | 5 signup/hr, 10 login/15min |
| Token Storage | localStorage (client-side) |
| Token Transmission | Authorization Bearer header |

---

## 🎨 Frontend Components

### SignUpForm
```tsx
import SignUpForm from '@/components/auth/SignUpForm'

<SignUpForm />
// Now supports username-only signup
// Email is optional
```

### SignInForm
```tsx
import SignInForm from '@/components/auth/SignInForm'

<SignInForm />
// Accepts username OR email
```

### Using Auth Context
```tsx
import { useAuth } from '@/contexts/AuthContext'

const { user, isAuthenticated, loading, authType } = useAuth()

// authType will be 'firebase' or 'jwt'
```

---

## 🔧 Backend Functions

### Verify Authentication
```typescript
import { verifyAuth, getUserFromAuth } from '@/lib/auth/verify'

// In API route
const authUser = await verifyAuth(request)
if (!authUser) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Get full user from database
const user = await getUserFromAuth(authUser)
```

### JWT Utilities
```typescript
import { 
  hashPassword, 
  comparePassword, 
  generateToken,
  validateUsername,
  validatePassword 
} from '@/lib/auth/jwt'

// Hash password
const hashed = await hashPassword('password123')

// Verify password
const isValid = await comparePassword('password123', hashed)

// Generate JWT token
const token = generateToken({
  userId: user._id,
  username: user.username,
  email: user.email,
  authType: 'jwt'
})
```

---

## 📦 Response Formats

### Signup Success
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "displayName": "John Doe"
  }
}
```

### Signin Success
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "displayName": "John Doe",
    "avatarUrl": "https://..."
  }
}
```

### Error Response
```json
{
  "error": "Username is already taken",
  "field": "username"
}
```

---

## 🐛 Error Codes

| Status | Error | Meaning |
|--------|-------|---------|
| `400` | Invalid input | Validation failed |
| `401` | Unauthorized | Token missing/invalid |
| `409` | Username/email taken | Duplicate entry |
| `429` | Too many requests | Rate limit exceeded |
| `500` | Internal server error | Server error |

---

## 🎯 Common Patterns

### Check Username Availability
```typescript
import { isUsernameTaken } from '@/lib/auth/jwt'

const available = !(await isUsernameTaken('johndoe'))
```

### Store Token Client-Side
```typescript
// After successful login
localStorage.setItem('auth_token', token)
localStorage.setItem('auth_type', 'jwt')
```

### Make Authenticated Request
```typescript
const token = localStorage.getItem('auth_token')

const response = await fetch('/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## 📊 Database Schema

### User Model
```typescript
{
  username: string        // Required, unique, indexed
  email?: string          // Optional, unique if provided
  password?: string       // Required for username auth
  name?: string           // Optional display name
  firebaseUid?: string    // For Firebase users
  googleId?: string       // For Google auth
  profile: {
    displayName: string
    avatarUrl?: string
    // ... other profile fields
  }
}
```

---

## 🔄 Migration

### For Existing Users
```bash
# Add usernames to existing users
node scripts/migrate-existing-users.js
```

### For New Deployments
```bash
# 1. Set environment variable
echo "JWT_SECRET=$(node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\")" >> .env.local

# 2. Install dependencies (if needed)
npm install

# 3. Start server
npm run dev
```

---

## 📞 Support & Resources

| Resource | Location |
|----------|----------|
| Complete Docs | `docs/AUTH_MIGRATION.md` |
| Setup Guide | `docs/AUTH_SETUP.md` |
| Changes Summary | `AUTHENTICATION_CHANGES.md` |
| This Card | `docs/AUTH_QUICK_REFERENCE.md` |

---

## ⚡ Pro Tips

1. **Always use HTTPS in production** for secure token transmission
2. **Rotate JWT_SECRET** periodically (invalidates all tokens)
3. **Monitor rate limits** to detect abuse
4. **Keep dependencies updated** for security patches
5. **Test both auth methods** (username and social) regularly

---

*Last Updated: January 2026*
