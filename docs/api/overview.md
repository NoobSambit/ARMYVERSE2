# API Overview

Complete reference for all ARMYVERSE API endpoints.

## Base URL

**Development**: `http://localhost:3000/api`
**Production**: `https://your-domain.com/api`

---

## Authentication

Most endpoints require authentication via one of two methods:

### 1. JWT Token (Username/Password Auth)
```
Authorization: Bearer <jwt-token>
```

### 2. Firebase Token (Social Auth)
```
Authorization: Bearer <firebase-id-token>
```

**How to get tokens:**
- JWT: Sign in via `/api/auth/signin` to receive token
- Firebase: Use Firebase Auth SDK client-side

---

## Response Format

### Success Response
```json
{
  "ok": true,
  "data": { /* response data */ },
  "message": "Success message" // optional
}
```

### Error Response
```json
{
  "ok": false,
  "error": "Error message",
  "details": { /* additional error info */ } // optional
}
```

---

## Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/signup` | 5 requests | 1 hour |
| `/api/auth/signin` | 10 requests | 15 minutes |
| `/api/game/quiz/start` | 50 requests | 1 hour |
| `/api/game/quiz/complete` | 100 requests | 1 hour |
| Other endpoints | No limit | - |

---

## API Categories

### 🔐 Authentication
- [Authentication APIs](./authentication.md) - Sign up, sign in, token management

### 🎵 Playlists
- [Playlist APIs](./playlists.md) - AI generation, manual creation, export

### 📝 Blogs
- [Blog APIs](./blogs.md) - CRUD operations, reactions, comments

### 🎮 Game System
- [Game APIs](./game.md) - Quiz, inventory, quests, mastery, leaderboard

### 🎧 Spotify
- [Spotify APIs](./spotify.md) - OAuth, playlists, analytics, status

### 👤 User
- [User APIs](./user.md) - Profile, settings, integrations, data export

### 🔥 Trending
- [Trending APIs](./trending.md) - Spotify & YouTube trending data

### ⏰ Cron Jobs
- [Cron APIs](./cron.md) - Automated quest generation and data scraping

---

## Common Parameters

### Pagination

Many list endpoints support pagination:

```
?page=1&limit=20
```

**Parameters:**
- `page` (number, default: 1) - Page number (1-indexed)
- `limit` (number, default: 20, max: 100) - Items per page

**Response includes:**
```json
{
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasMore": true
  }
}
```

### Filtering

**Query parameters:**
- `search` or `q` - Text search
- `sort` - Sort order (e.g., `newest`, `oldest`, `relevance`)
- `filter` - Additional filters (endpoint-specific)

---

## Data Types

### User Object
```typescript
{
  id: string
  username: string
  email?: string
  displayName?: string
  photoURL?: string
  createdAt: Date
}
```

### Photocard Object
```typescript
{
  id: string
  member: string
  era: string
  set: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  imageUrl: string
  publicId: string
}
```

### Quest Object
```typescript
{
  code: string
  title: string
  description: string
  type: 'daily' | 'weekly'
  category: 'streaming' | 'quiz' | 'collection'
  progress: number
  total: number
  completed: boolean
  rewards: {
    stardust?: number
    tickets?: number
    xp?: number
  }
}
```

---

## Error Codes

### Authentication Errors
- `AUTH_REQUIRED` - Missing authorization header
- `INVALID_TOKEN` - Token is invalid or expired
- `USER_NOT_FOUND` - User does not exist

### Validation Errors
- `INVALID_INPUT` - Request validation failed
- `MISSING_FIELD` - Required field missing
- `INVALID_FORMAT` - Field format incorrect

### Resource Errors
- `NOT_FOUND` - Resource not found
- `ALREADY_EXISTS` - Resource already exists
- `INSUFFICIENT_BALANCE` - Not enough currency (Stardust/tickets)

### Rate Limit Errors
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## Webhook Events (Future)

Planned webhook support for:
- Quest completion
- Leaderboard rank changes
- Badge unlocks
- Mastery milestones

---

## API Versioning

Currently using **v1** (implicit, no version in URL).

Future versions will use: `/api/v2/endpoint`

---

## Testing

### Using cURL

```bash
# Sign in
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"user","password":"password"}'

# Use authenticated endpoint
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Import the Postman collection (if available)
2. Set environment variable `BASE_URL` to `http://localhost:3000/api`
3. Set `AUTH_TOKEN` after signing in
4. Use `{{BASE_URL}}` and `{{AUTH_TOKEN}}` in requests

---

## Related Documentation

- [Authentication APIs](./authentication.md)
- [Playlist APIs](./playlists.md)
- [Blog APIs](./blogs.md)
- [Game APIs](./game.md)
- [Spotify APIs](./spotify.md)
- [User APIs](./user.md)
- [Trending APIs](./trending.md)
- [Cron APIs](./cron.md)

---

**Last Updated**: January 2026
**API Version**: 1.0
