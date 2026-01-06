# User APIs

User profile and settings management endpoints.

---

## Profile

### GET /api/user/profile

Get authenticated user's profile.

**Authentication**: Required

**Success Response (200):**
```json
{
  "ok": true,
  "profile": {
    "id": "user_123",
    "username": "armyfan",
    "email": "fan@example.com",
    "displayName": "ARMY Fan",
    "photoURL": "https://...",
    "bio": "BTS fan since 2013",
    "biasGroup": ["Jungkook", "V"],
    "favoriteEra": "Love Yourself",
    "armySince": "2013",
    "connections": {
      "spotify": { "connected": true, "displayName": "..." },
      "lastfm": { "connected": true, "username": "..." }
    },
    "privacy": {
      "profileVisibility": "public",
      "showEmail": false,
      "showListeningHistory": true
    },
    "createdAt": "2023-01-15T10:00:00.000Z"
  }
}
```

---

### PUT /api/user/profile

Update user profile.

**Authentication**: Required

**Request Body:**
```json
{
  "displayName": "New Name",
  "bio": "Updated bio",
  "photoURL": "https://...",
  "biasGroup": ["Jungkook"],
  "favoriteEra": "Map of the Soul"
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "profile": { /* updated profile */ }
}
```

---

### GET /api/user/[userId]/profile

Get public profile of another user.

**Authentication**: Optional

**Success Response (200):**
```json
{
  "ok": true,
  "profile": {
    "id": "user_456",
    "username": "otherfan",
    "displayName": "Other Fan",
    "photoURL": "https://...",
    "bio": "Bio...",
    /* only public fields */
  }
}
```

---

## Integrations

### GET /api/user/integrations

Get user's connected integrations.

**Authentication**: Required

**Success Response (200):**
```json
{
  "ok": true,
  "integrations": {
    "spotify": {
      "connected": true,
      "displayName": "John Doe",
      "email": "john@example.com",
      "connectedAt": "2025-06-15T10:00:00.000Z"
    },
    "lastfm": {
      "connected": true,
      "username": "johndoe_lastfm",
      "connectedAt": "2025-08-20T10:00:00.000Z"
    }
  }
}
```

---

### PATCH /api/user/integrations

Update integration settings.

**Authentication**: Required

**Request Body:**
```json
{
  "service": "lastfm",
  "data": {
    "username": "new_username",
    "apiKey": "user_api_key"
  }
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "integration": { /* updated integration */ }
}
```

---

## Data Management

### GET /api/user/export-data

Export all user data (GDPR compliance).

**Authentication**: Required

**Success Response (200):**
```json
{
  "ok": true,
  "exportUrl": "https://...",
  "data": {
    "profile": { /* profile data */ },
    "blogs": [ /* blog posts */ ],
    "comments": [ /* comments */ ],
    "playlists": [ /* playlists */ ],
    "gameData": {
      "inventory": [ /* photocards */ ],
      "quests": [ /* quest history */ ],
      "stats": { /* game stats */ }
    }
  }
}
```

---

### DELETE /api/user/delete-account

Delete user account permanently.

**Authentication**: Required

**Request Body:**
```json
{
  "password": "user_password",
  "confirmation": "DELETE MY ACCOUNT"
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "deleted": true,
  "message": "Account deleted successfully"
}
```

**Notes:**
- This is permanent and cannot be undone
- All user data will be removed
- Blog posts may be anonymized instead of deleted
- Requires password confirmation for security

---

## Related Documentation

- [Profile Management Feature Guide](../features/profile-management.md)
- [Authentication APIs](./authentication.md)

---

**Last Updated**: January 2026
