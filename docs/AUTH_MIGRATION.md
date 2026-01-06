# Authentication System Migration Guide

## Overview

The ARMYVERSE application now supports **dual authentication methods**:

1. **Username-based authentication** (NEW) - Users can sign up with just a username and password (email optional)
2. **Firebase authentication** (EXISTING) - Google, Twitter, and email-based social logins

This migration makes email completely optional, allowing users to create accounts using only a username and password.

## What Changed

### 1. Database Model Updates

**User Model** (`lib/models/User.ts`):
- ✅ Added required `username` field (unique, indexed)
- ✅ Made `email` field optional (sparse index)
- ✅ Updated password requirement logic
- ✅ Added username validation (3-30 chars, alphanumeric + underscore)

### 2. Authentication System

**New JWT-based Authentication** (`lib/auth/jwt.ts`):
- Password hashing with bcrypt (10 rounds)
- JWT token generation (7-day expiration)
- Username and password validation
- Username availability checking

**Unified Authentication Verification** (`lib/auth/verify.ts`):
- `verifyAuth()` - Works with both Firebase and JWT tokens
- `getUserFromAuth()` - Fetches user from database regardless of auth method
- Returns normalized `AuthUser` object

### 3. API Routes

**New Routes**:
- `POST /api/auth/signup` - Username-based signup
- `POST /api/auth/signin` - Username-based signin

**Updated Routes** (20+ files):
All existing API routes now support both authentication methods:
- `/api/user/profile`
- `/api/spotify/*`
- `/api/game/*`
- And more...

### 4. Frontend Components

**SignUpForm** (`components/auth/SignUpForm.tsx`):
- ✅ Added username field (required)
- ✅ Made email optional
- ✅ Made display name optional
- ✅ Updated validation (8 char min password)
- ✅ Social auth remains available as an option

**SignInForm** (`components/auth/SignInForm.tsx`):
- ✅ Changed to "Username or Email" field
- ✅ Supports both username and email login
- ✅ Social auth remains available

**AuthContext** (`contexts/AuthContext.tsx`):
- ✅ Supports both Firebase and JWT authentication
- ✅ Stores auth type (firebase/jwt)
- ✅ Unified user object
- ✅ Automatic token refresh and validation

## Environment Variables

Add this new required environment variable to your `.env.local`:

```bash
# JWT Secret - Generate a secure random string
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Existing Firebase variables (keep these)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# ... etc
```

### Generating a Secure JWT Secret

```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## How It Works

### Sign Up Flow

**Username-based signup:**
1. User fills out: username (required), password (required), name (optional), email (optional)
2. Frontend validates input client-side
3. API validates username uniqueness and password strength
4. Password is hashed with bcrypt
5. User document created in MongoDB with username
6. JWT token generated and returned
7. Token stored in localStorage
8. User redirected to dashboard

**Social signup (unchanged):**
- User clicks Google/Twitter button
- Firebase handles OAuth flow
- User created/retrieved from Firebase
- MongoDB user document created/updated
- User redirected to dashboard

### Sign In Flow

**Username-based signin:**
1. User enters username or email + password
2. API finds user by username or email
3. Password verified with bcrypt
4. JWT token generated if valid
5. Token stored in localStorage
6. User authenticated in app

**Social signin (unchanged):**
- Firebase handles authentication
- User session managed by Firebase

### API Authentication

All API routes now use `verifyAuth()` which:
1. Checks for Bearer token in Authorization header
2. Tries Firebase verification first
3. Falls back to JWT verification
4. Returns normalized `AuthUser` object

```typescript
// In API routes
const authUser = await verifyAuth(request)
if (!authUser) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Get user from database
const user = await getUserFromAuth(authUser)
```

## Security Features

### Password Security
- ✅ Minimum 8 characters
- ✅ Must contain letter and number
- ✅ bcrypt hashing with 10 rounds
- ✅ Maximum 128 characters

### Username Security
- ✅ 3-30 characters only
- ✅ Alphanumeric + underscore only
- ✅ Case-insensitive stored as lowercase
- ✅ Reserved words blocked
- ✅ Unique constraint enforced

### Token Security
- ✅ JWT with 7-day expiration
- ✅ Signed with secret key
- ✅ Stored in localStorage (client-side)
- ✅ Sent via Authorization header

### Rate Limiting
- ✅ Signup: 5 attempts per hour per IP
- ✅ Signin: 10 attempts per 15 minutes per IP

## Migration Path for Existing Users

### Existing Firebase Users
- ✅ No action required
- ✅ Continue using email/social login
- ✅ System automatically works with existing auth
- ⚠️ May need to set a username in profile settings (future enhancement)

### Adding Username to Existing Users
For existing users without usernames, the system will:
1. Auto-generate username from email (before @ symbol)
2. Allow user to change username in profile settings
3. Ensure uniqueness by appending numbers if needed

## Testing

### Test Username-based Auth

1. **Sign Up**:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123",
    "name": "Test User"
  }'
```

2. **Sign In**:
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "testuser",
    "password": "TestPass123"
  }'
```

3. **Get Profile** (use token from signin):
```bash
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### Common Issues

**"Username is already taken"**
- Username must be unique across all users
- Try a different username

**"JWT_SECRET not configured"**
- Add JWT_SECRET to .env.local
- Restart development server

**"Unauthorized" errors**
- Check if token is in localStorage
- Token may have expired (7 days)
- Try signing in again

**MongoDB duplicate key error**
- Username or email already exists
- Check database for conflicts

## Best Practices

1. **Always use HTTPS in production** - Tokens sent in Authorization headers
2. **Rotate JWT_SECRET regularly** - Invalidates all existing tokens
3. **Set JWT_SECRET in environment variables** - Never commit to git
4. **Monitor rate limiting logs** - Detect brute force attempts
5. **Implement password reset flow** - For users who forget passwords (future enhancement)

## Future Enhancements

- [ ] Password reset via email (for users with email)
- [ ] Email verification (optional)
- [ ] 2FA support
- [ ] Account linking (merge social and username accounts)
- [ ] Username change with cooldown period
- [ ] Refresh token rotation
- [ ] Session management (multiple devices)

## Support

For issues or questions:
1. Check this documentation first
2. Review error logs in development
3. Check MongoDB indexes are created
4. Verify environment variables are set
