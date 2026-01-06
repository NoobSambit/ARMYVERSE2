# Blog APIs

Blog platform endpoints for creating, reading, and interacting with blog posts.

---

## Blog CRUD

### GET /api/blogs

Get list of blogs with filtering and pagination.

**Authentication**: Optional

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `q` (string): Search query
- `tags` (string): Comma-separated tags
- `moods` (string): Comma-separated moods
- `authors` (string): Comma-separated author names
- `sort` (string): `newest`, `oldest`, `trending7d`, `mostViewed`, `mostReacted`

**Success Response (200):**
```json
{
  "ok": true,
  "blogs": [
    {
      "id": "blog_abc123",
      "title": "My Favorite BTS Moments",
      "slug": "my-favorite-bts-moments",
      "excerpt": "A collection of...",
      "coverImage": "https://...",
      "author": {
        "id": "user_123",
        "username": "armyfan",
        "photoURL": "https://..."
      },
      "tags": ["BTS", "Memories"],
      "moods": ["nostalgic"],
      "readTime": 5,
      "reactions": { "loved": 42, "moved": 15, "surprised": 8 },
      "commentCount": 12,
      "views": 345,
      "createdAt": "2026-01-06T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "total": 150,
    "pages": 8
  }
}
```

---

### POST /api/blogs

Create a new blog post.

**Authentication**: Required

**Request Body:**
```json
{
  "title": "My Favorite BTS Moments",
  "content": "<p>Blog content in HTML...</p>",
  "coverImage": "https://...",
  "tags": ["BTS", "Memories"],
  "moods": ["nostalgic"],
  "visibility": "public",
  "seoTitle": "Custom SEO title",
  "seoDescription": "Custom description"
}
```

**Success Response (201):**
```json
{
  "ok": true,
  "blog": { /* created blog */ }
}
```

---

### GET /api/blogs/[id]

Get a specific blog post.

**Authentication**: Optional

**Success Response (200):**
```json
{
  "ok": true,
  "blog": {
    "id": "blog_abc123",
    "title": "My Favorite BTS Moments",
    "content": "<p>Full HTML content...</p>",
    "author": { /* author details */ },
    /* ... other fields */
  }
}
```

---

### PUT /api/blogs/[id]

Update a blog post.

**Authentication**: Required (must be author)

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "<p>Updated content...</p>"
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "blog": { /* updated blog */ }
}
```

---

### DELETE /api/blogs/[id]

Delete a blog post (soft delete).

**Authentication**: Required (must be author)

**Success Response (200):**
```json
{
  "ok": true,
  "deleted": true
}
```

---

## Reactions

### POST /api/blogs/[id]/reactions

Add or update reaction to a blog.

**Authentication**: Required

**Request Body:**
```json
{
  "reactionType": "loved"
}
```

**Reaction Types:** `loved`, `moved`, `surprised`

**Success Response (200):**
```json
{
  "ok": true,
  "reaction": "loved",
  "counts": {
    "loved": 43,
    "moved": 15,
    "surprised": 8
  }
}
```

---

## Comments

### GET /api/blogs/[id]/comments

Get comments for a blog.

**Authentication**: Optional

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Success Response (200):**
```json
{
  "ok": true,
  "comments": [
    {
      "id": "comment_123",
      "content": "Great post!",
      "author": {
        "id": "user_456",
        "username": "fan123",
        "photoURL": "https://..."
      },
      "createdAt": "2026-01-06T11:00:00.000Z"
    }
  ]
}
```

---

### POST /api/blogs/[id]/comments

Add a comment to a blog.

**Authentication**: Required

**Request Body:**
```json
{
  "content": "Great post! Thanks for sharing."
}
```

**Success Response (201):**
```json
{
  "ok": true,
  "comment": { /* created comment */ }
}
```

---

## Save/Bookmark

### POST /api/blogs/[id]/save

Save or unsave a blog post.

**Authentication**: Required

**Success Response (200):**
```json
{
  "ok": true,
  "saved": true
}
```

---

## Restore

### POST /api/blogs/[id]/restore

Restore a soft-deleted blog.

**Authentication**: Required (must be author or admin)

**Success Response (200):**
```json
{
  "ok": true,
  "blog": { /* restored blog */ }
}
```

---

## Related Documentation

- [Blog Platform Feature Guide](../features/blog-platform.md)
- [User APIs](./user.md)

---

**Last Updated**: January 2026
