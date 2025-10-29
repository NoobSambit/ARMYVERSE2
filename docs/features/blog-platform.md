# Blog Platform

## What It Is

A comprehensive BTS-themed blogging platform featuring:
- **Rich Text Editor** - Tiptap-powered editor with extensive formatting options
- **Community Features** - Reactions, comments, and saves
- **Advanced Filtering** - Search, tags, moods, languages, and more
- **SEO Optimization** - Preview generation and scoring
- **Content Discovery** - Featured posts, trending algorithms, and recommendations

## How It Works

### Blog Editor

**Tiptap Rich Text Editor** with support for:
- **Formatting**: Bold, italic, underline, strikethrough, code
- **Headings**: H1-H6 with proper hierarchy
- **Lists**: Bullet lists, ordered lists, task lists
- **Tables**: Resizable columns, merged cells
- **Media**: Images (Cloudinary upload), embedded videos (YouTube)
- **Code**: Syntax-highlighted code blocks (50+ languages)
- **Links**: Hyperlinks with preview
- **Quotes**: Block quotes and callouts
- **Mentions**: @member mentions with autocomplete
- **Emoji**: Full emoji support

**Editor Features:**
- Auto-save every 30 seconds
- Version history (manual saves)
- Word count and reading time estimation
- SEO preview and scoring
- Markdown import/export
- Template library (review, theory, news, personal)

### Community Interactions

**Reactions (3 types):**
- **Moved (💜)** - Emotionally touched
- **Loved (💖)** - Absolutely loved it
- **Surprised (😮)** - Unexpected/amazing

**Comments:**
- Nested comments (1 level deep)
- Edit/delete own comments
- Report inappropriate comments
- Mention other users
- Markdown support in comments

**Saves/Bookmarks:**
- Save posts for later reading
- Private bookmark collection
- Organize by custom tags

### Content Discovery

**Filtering Options:**
- **Search**: Full-text search across title, content, tags
- **Tags**: BTS, members, eras, concepts, theories
- **Moods**: Happy, Sad, Nostalgic, Excited, Thoughtful
- **Authors**: Filter by specific writers
- **Languages**: Korean, English, Japanese, Spanish, etc.
- **Post Types**: Review, Theory, News, Personal, Tutorial
- **Date Range**: Published between dates
- **Reading Time**: Min/max minutes to read

**Sorting Options:**
- **Relevance**: Based on search query match
- **Newest**: Most recently published
- **Trending (7d)**: Most engagement last 7 days
- **Most Viewed**: All-time views
- **Most Reacted**: All-time reactions
- **Oldest**: Earliest published

**Featured Posts:**
- 1 primary featured post (largest display)
- 3 secondary featured posts
- Based on trending score algorithm
- Updates daily

## Workflow

### Blog Creation Flow

```mermaid
graph TD
    A[User visits /blogs/create] --> B[Open editor]
    B --> C[Select template or start blank]
    C --> D[Write content with rich formatting]
    D --> E[Add images via Cloudinary]
    E --> F[Set metadata - title, tags, mood]
    F --> G[Preview and SEO check]
    G --> H{Satisfied?}
    H -->|No| D
    H -->|Yes| I[POST /api/blogs]
    I --> J[Save to MongoDB]
    J --> K[Redirect to published post]
```

### Reading & Interaction Flow

```mermaid
graph TD
    A[User visits /blog] --> B[View featured posts]
    B --> C[Apply filters/search]
    C --> D[Browse post grid]
    D --> E[Click post to read]
    E --> F[Read full content]
    F --> G{Engage?}
    G -->|React| H[POST /api/blogs/[id]/reactions]
    G -->|Comment| I[POST /api/blogs/[id]/comments]
    G -->|Save| J[POST /api/blogs/[id]/save]
    G -->|Share| K[Copy URL or share button]
    H --> L[Update UI with new counts]
    I --> L
    J --> L
```

## API Reference

### Blog CRUD Endpoints

**GET /api/blogs**

List blogs with filtering, search, and pagination.

**Query Parameters:**
- `q` (string): Search query
- `tags` (string): Comma-separated tags
- `moods` (string): Comma-separated moods
- `authors` (string): Comma-separated author names
- `languages` (string): Comma-separated language codes
- `types` (string): Comma-separated post types
- `savedBy` (string): User ID for saved posts
- `before` (string): ISO date - posts before this date
- `after` (string): ISO date - posts after this date
- `minRead` (number): Minimum reading time (minutes)
- `maxRead` (number): Maximum reading time (minutes)
- `sort` (string): Sort order (relevance, newest, trending7d, mostViewed, mostReacted, oldest)
- `page` (number): Page number (1-indexed)
- `limit` (number): Results per page (default 20, max 100)

**Example:**
```bash
GET /api/blogs?tags=Jungkook,Love+Yourself&mood=nostalgic&sort=trending7d&page=1
```

**Response:**
```json
{
  "ok": true,
  "posts": [
    {
      "id": "66a1...",
      "title": "Love Yourself Era: A Retrospective",
      "slug": "love-yourself-era-retrospective",
      "excerpt": "Looking back at one of BTS's most iconic eras...",
      "content": "<p>Full HTML content...</p>",
      "author": {
        "id": "user123",
        "name": "ARMYWriter",
        "avatar": "https://..."
      },
      "coverImage": "https://res.cloudinary.com/...",
      "tags": ["Love Yourself", "Jungkook", "Era Analysis"],
      "mood": "nostalgic",
      "language": "en",
      "postType": "review",
      "readingTime": 8,
      "stats": {
        "views": 1523,
        "reactions": { "moved": 45, "loved": 89, "surprised": 23 },
        "commentCount": 34,
        "saveCount": 67
      },
      "createdAt": "2025-01-25T10:30:00.000Z",
      "updatedAt": "2025-01-29T14:20:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 245,
    "pages": 13,
    "hasMore": true
  }
}
```

**POST /api/blogs**

Create a new blog post.

**Authentication**: Required

**Request Body:**
```json
{
  "title": "My BTS Theory",
  "content": "<p>Full HTML content from Tiptap editor...</p>",
  "excerpt": "A brief summary...",
  "coverImage": "https://res.cloudinary.com/...",
  "tags": ["Theory", "Map of the Soul", "Symbolism"],
  "mood": "thoughtful",
  "language": "en",
  "postType": "theory",
  "seoTitle": "BTS Map of the Soul Theory | ARMYVERSE",
  "seoDescription": "An in-depth analysis of the symbolism..."
}
```

**Response:**
```json
{
  "ok": true,
  "post": {
    "id": "66a1...",
    "slug": "my-bts-theory",
    "...": "..."
  }
}
```

**GET /api/blogs/[id]**

Get a specific blog post with full content.

**Response:**
```json
{
  "ok": true,
  "post": {
    "id": "66a1...",
    "title": "...",
    "content": "<p>Full content...</p>",
    "...": "...",
    "comments": [
      {
        "id": "comment1",
        "author": { "id": "user456", "name": "Reader1" },
        "content": "Great analysis!",
        "createdAt": "2025-01-29T15:00:00.000Z",
        "replies": []
      }
    ]
  }
}
```

**PUT /api/blogs/[id]**

Update an existing blog post.

**Authentication**: Required (must be author)

**Request Body:** Same as POST

**DELETE /api/blogs/[id]**

Delete a blog post.

**Authentication**: Required (must be author)

### Interaction Endpoints

**POST /api/blogs/[id]/reactions**

Add or remove a reaction.

**Authentication**: Required

**Request Body:**
```json
{
  "type": "loved"
}
```

**Response:**
```json
{
  "ok": true,
  "reactions": {
    "moved": 45,
    "loved": 90,
    "surprised": 23
  },
  "userReaction": "loved"
}
```

**GET /api/blogs/[id]/comments**

Get comments for a blog post.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Comments per page

**POST /api/blogs/[id]/comments**

Add a comment to a blog post.

**Authentication**: Required

**Request Body:**
```json
{
  "content": "This is a great post!",
  "parentId": null
}
```

**Response:**
```json
{
  "ok": true,
  "comment": {
    "id": "comment123",
    "author": { "id": "user789", "name": "Commenter" },
    "content": "This is a great post!",
    "createdAt": "2025-01-29T16:00:00.000Z"
  }
}
```

**POST /api/blogs/[id]/save**

Save or unsave a blog post.

**Authentication**: Required

**Response:**
```json
{
  "ok": true,
  "saved": true
}
```

## Configuration

### Environment Variables

```env
# Database
MONGODB_URI=your-mongodb-connection-string

# Cloudinary (for cover images)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Firebase Auth
FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

### Tiptap Extensions

Installed extensions:
- StarterKit (basic formatting)
- Image (with upload)
- Link (with validation)
- Table (with resizing)
- CodeBlockLowlight (syntax highlighting)
- TaskList & TaskItem
- Emoji
- Mention
- Placeholder
- BubbleMenu
- FloatingMenu
- Typography (smart quotes, dashes)
- TextAlign
- Highlight
- Underline
- Color
- YouTube (embedded videos)

## Database Schema

### Blog Model

```typescript
{
  title: string,
  slug: string,                    // URL-friendly identifier
  content: string,                 // HTML from Tiptap
  excerpt: string,                 // Brief summary
  coverImage?: string,
  author: {
    id: string,
    name: string,
    email: string,
    avatar?: string
  },
  tags: string[],
  mood: string,
  language: string,
  postType: string,
  seoTitle?: string,
  seoDescription?: string,
  readingTime: number,             // Calculated in minutes
  stats: {
    views: number,
    reactions: {
      moved: number,
      loved: number,
      surprised: number
    },
    commentCount: number,
    saveCount: number
  },
  featuredScore: number,           // For trending algorithm
  published: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Comment Model

```typescript
{
  postId: ObjectId,
  author: {
    id: string,
    name: string,
    avatar?: string
  },
  content: string,
  parentId?: ObjectId,             // For nested comments
  createdAt: Date,
  updatedAt: Date
}
```

## Trending Algorithm

Featured posts are scored based on:

```typescript
const trendingScore = (
  (reactions * 3) +
  (comments * 5) +
  (saves * 2) +
  (views * 0.1)
) * recencyMultiplier

// Recency multiplier decreases over time
const recencyMultiplier = Math.max(
  1 - (daysSincePublish / 30),
  0.1
)
```

## Usage Examples

### Creating a Blog Post

```typescript
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

function BlogEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Start writing...</p>'
  })
  
  const saveBlog = async () => {
    const content = editor.getHTML()
    
    const response = await fetch('/api/blogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        title: 'My Post',
        content,
        tags: ['BTS', 'Theory'],
        mood: 'thoughtful'
      })
    })
    
    const data = await response.json()
    console.log('Post created:', data.post.slug)
  }
  
  return (
    <div>
      <EditorContent editor={editor} />
      <button onClick={saveBlog}>Publish</button>
    </div>
  )
}
```

### Adding Reactions

```typescript
async function addReaction(postId: string, type: string) {
  const response = await fetch(`/api/blogs/${postId}/reactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ type })
  })
  
  const data = await response.json()
  return data.reactions
}

// Usage
await addReaction('66a1...', 'loved')
```

### Searching and Filtering

```typescript
const searchBlogs = async (query: string, filters: any) => {
  const params = new URLSearchParams({
    q: query,
    tags: filters.tags?.join(','),
    mood: filters.mood,
    sort: 'trending7d',
    page: '1'
  })
  
  const response = await fetch(`/api/blogs?${params}`)
  return response.json()
}

// Usage
const results = await searchBlogs('Love Yourself', {
  tags: ['Jungkook'],
  mood: 'nostalgic'
})
```

## Best Practices

### For Writers
- ✅ Use templates as starting points
- ✅ Add relevant tags for discoverability
- ✅ Include cover images (recommended 1200x630)
- ✅ Write SEO-friendly titles and descriptions
- ✅ Break content into sections with headings
- ✅ Use tables for data, lists for readability

### For Developers
- ✅ Sanitize HTML content before rendering
- ✅ Implement rate limiting on post creation
- ✅ Index tags and mood fields for fast filtering
- ✅ Cache featured posts for 30 minutes
- ✅ Lazy-load images in post grids
- ✅ Implement report/moderation system

## Related Documentation

- [Authentication](./authentication.md) - Required for posting and interactions
- [API Reference](../api/blogs.md) - Complete blog API documentation
- [Database Schema](../architecture/database.md) - Blog data models
