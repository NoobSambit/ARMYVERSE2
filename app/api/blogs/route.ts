import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { Blog } from '@/lib/models/Blog'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connect()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const moods = searchParams.get('moods')?.split(',').filter(Boolean) || []
    const authors = searchParams.get('authors')?.split(',').filter(Boolean) || []
    const authorId = searchParams.get('authorId') || ''
    const languages = searchParams.get('languages')?.split(',').filter(Boolean) || []
    const types = searchParams.get('types')?.split(',').filter(Boolean) || []
    const savedBy = searchParams.get('savedBy') || ''
    const before = searchParams.get('before')
    const after = searchParams.get('after')
    const minRead = parseInt(searchParams.get('minRead') || '0')
    const maxRead = parseInt(searchParams.get('maxRead') || '0')
    const sortBy = searchParams.get('sortBy') || 'newest'
    const status = searchParams.get('status') || 'published'
    const visibility = searchParams.get('visibility') || 'public'
    const compact = searchParams.get('compact') === 'true'
    const includeDeleted = searchParams.get('includeDeleted') === 'true'
    
    const skip = (page - 1) * limit
    
    // Build query
    const query: any = {}
    if (status && status !== 'all') {
      query.status = status
    }
    if (!includeDeleted) {
      query.isDeleted = { $ne: true }
    }
    if (visibility && visibility !== 'all') {
      if (visibility === 'public') {
        query.$or = [{ visibility: 'public' }, { visibility: { $exists: false } }]
      } else {
        query.visibility = visibility
      }
    }
    
    if (search) {
      query.$text = { $search: search }
    }

    if (tags.length > 0) {
      query.tags = { $in: tags }
    }

    if (moods.length > 0) {
      query.mood = { $in: moods }
    }

    if (authors.length > 0) {
      query['author.name'] = { $in: authors }
    }
    if (authorId) {
      query['author.id'] = authorId
    }

    if (languages.length > 0) {
      query.language = { $in: languages }
    }

    if (types.length > 0) {
      query.type = { $in: types }
    }

    if (savedBy) {
      query.savedBy = { $in: [savedBy] }
    }

    if (before || after) {
      query.createdAt = {}
      if (after) query.createdAt.$gte = new Date(after)
      if (before) query.createdAt.$lte = new Date(before)
    }

    if (minRead || maxRead) {
      query.readTime = {}
      if (minRead) query.readTime.$gte = minRead
      if (maxRead) query.readTime.$lte = maxRead
    }
    
    // Build sort
    let sort: any = {}
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 }
        break
      case 'oldest':
        sort = { createdAt: 1 }
        break
      case 'mostReacted':
        sort = { 'reactions.loved': -1, 'reactions.moved': -1, 'reactions.surprised': -1 }
        break
      case 'mostViewed':
        sort = { views: -1 }
        break
      case 'trending7d':
        // Approximate: recent first, then views and reactions
        sort = { createdAt: -1, views: -1, 'reactions.loved': -1 }
        break
      case 'relevance':
        // MongoDB will use textScore when $text is present
        if (search) {
          sort = { score: { $meta: 'textScore' } }
        } else {
          sort = { createdAt: -1 }
        }
        break
      default:
        sort = { createdAt: -1 }
    }
    
    const cursor = Blog.find(query)
    const select: any = {}
    if (compact) {
      select._id = 1
      select.title = 1
      select.coverImage = 1
      select.mood = 1
      select.tags = 1
      select.createdAt = 1
      select.readTime = 1
      select.views = 1
      select.status = 1
      select.author = 1
    }
    if (sortBy === 'relevance' && search) {
      select.score = { $meta: 'textScore' }
    }
    if (Object.keys(select).length > 0) {
      cursor.select(select)
    }
    const [blogs, total] = await Promise.all([
      cursor
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query)
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
    
  } catch (error) {
    console.error('Error fetching blogs:', error)
    const isDbError = typeof (error as any)?.message === 'string' && (
      (error as any).name?.includes('Mongo') ||
      (error as any).message.includes('ECONNREFUSED') ||
      (error as any).message.includes('server selection')
    )
    return NextResponse.json(
      { error: isDbError ? 'Database unavailable' : 'Failed to fetch blogs' },
      { status: isDbError ? 503 : 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect()
    
    const body = await request.json()
    const { title, content, tags, mood, coverImage, author, status } = body
    
    if (!title || !content || !author) {
      return NextResponse.json(
        { error: 'Title, content, and author are required' },
        { status: 400 }
      )
    }
    
    const blog = new Blog({
      title,
      content,
      tags: tags || [],
      mood: mood || 'fun',
      coverImage,
      author,
      // Respect requested status; default to draft if not provided or invalid
      status: status === 'published' ? 'published' : 'draft'
    })
    
    await blog.save()
    
    return NextResponse.json(blog, { status: 201 })
    
  } catch (error) {
    console.error('Error creating blog:', error)
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    )
  }
} 