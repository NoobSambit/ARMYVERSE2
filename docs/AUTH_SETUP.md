# Quick Setup Guide for Username Authentication

## 1. Environment Setup

Add to your `.env.local` file:

```bash
# Generate a secure JWT secret with this command:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

JWT_SECRET=paste-generated-secret-here

# Keep your existing Firebase variables
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# ... etc
```

## 2. Database Migration (if you have existing data)

If you have existing users without usernames, run this migration:

```javascript
// In MongoDB shell or using a script
db.users.find({ username: { $exists: false } }).forEach(user => {
  const baseUsername = user.email 
    ? user.email.split('@')[0] 
    : `user${user._id.toString().slice(-8)}`;
  
  let username = baseUsername.toLowerCase();
  let counter = 1;
  
  // Ensure uniqueness
  while (db.users.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  
  db.users.updateOne(
    { _id: user._id },
    { $set: { username } }
  );
});
```

## 3. Install Dependencies

Dependencies are already installed! The system needs:
- ✅ `bcryptjs` - Password hashing
- ✅ `jsonwebtoken` - JWT token management
- ✅ `zod` - Input validation

## 4. Test the System

### Test Username Signup (Frontend)
1. Go to `/auth/signup`
2. Fill in:
   - Username: `testuser` (required)
   - Password: `TestPass123` (required, 8+ chars)
   - Display Name: `Test User` (optional)
   - Email: `test@example.com` (optional)
3. Click "Create Account"

### Test Username Login (Frontend)
1. Go to `/auth/signin`
2. Enter username or email: `testuser`
3. Enter password: `TestPass123`
4. Click "Sign In"

### Test API Directly

**Signup:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "SecurePass123",
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "johndoe",
    "password": "SecurePass123"
  }'
```

## 5. User Experience

### New User Flow:
1. **Sign Up**: Users can create account with just username + password
2. **Email Optional**: Email is optional but recommended for recovery
3. **Social Auth Still Available**: Google/Twitter login still works
4. **Mixed Auth**: Users can have both username and social auth

### Existing User Flow:
- ✅ Existing Firebase users continue working
- ✅ No migration needed for current users
- ✅ They can optionally set a username later

## 6. Security Features Implemented

✅ **Password Requirements:**
- Minimum 8 characters
- Must contain letter + number
- Hashed with bcrypt (10 rounds)

✅ **Username Requirements:**
- 3-30 characters
- Alphanumeric + underscore only
- Case-insensitive, unique
- Reserved words blocked

✅ **Rate Limiting:**
- Signup: 5 attempts/hour per IP
- Login: 10 attempts/15min per IP

✅ **Token Security:**
- JWT with 7-day expiration
- Stored securely in localStorage
- Validated on every API request

## 7. Verification Checklist

- [ ] JWT_SECRET added to .env.local
- [ ] Dependencies installed (npm install)
- [ ] Development server restarted
- [ ] Can access signup page
- [ ] Can create username-based account
- [ ] Can login with username
- [ ] Can login with email (if provided)
- [ ] Social auth still works
- [ ] API routes work with new auth
- [ ] No console errors

## 8. Common Issues & Solutions

**Issue: "JWT_SECRET not configured"**
```
Solution: Add JWT_SECRET to .env.local and restart server
```

**Issue: "Username already taken"**
```
Solution: Choose different username or check database for duplicates
```

**Issue: "Password must be at least 8 characters"**
```
Solution: Use longer password with letters and numbers
```

**Issue: MongoDB "duplicate key error"**
```
Solution: Username must be unique. Check existing users in database
```

**Issue: Token not working**
```
Solution: 
1. Check localStorage has 'auth_token'
2. Verify JWT_SECRET is correct
3. Token may have expired - login again
```

## 9. Production Deployment

Before deploying to production:

1. **Generate Strong JWT Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Set Environment Variables** in your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Other platforms: Add to their env config

3. **Use HTTPS** - Required for secure token transmission

4. **Monitor Rate Limits** - Adjust as needed based on traffic

5. **Set up Logging** - Track auth failures and attempts

6. **Database Indexes** - Ensure username index exists:
   ```javascript
   db.users.createIndex({ username: 1 }, { unique: true })
   ```

## 10. Next Steps

After basic setup, consider:

1. **Email Verification** - Verify email addresses (optional feature)
2. **Password Reset** - Allow users to reset forgotten passwords
3. **Profile Username** - Allow users to change username (with cooldown)
4. **Account Linking** - Merge username and social accounts
5. **2FA** - Two-factor authentication for enhanced security
6. **Session Management** - Handle multiple device logins

## Need Help?

Refer to:
- `docs/AUTH_MIGRATION.md` - Complete technical documentation
- `lib/auth/jwt.ts` - JWT utilities and validation
- `lib/auth/verify.ts` - Unified authentication verification
- `app/api/auth/signup/route.ts` - Signup API implementation
- `app/api/auth/signin/route.ts` - Signin API implementation
