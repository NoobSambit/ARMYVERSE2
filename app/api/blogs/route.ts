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
    const tags = searchParams.get('tags')?.split(',') || []
    const mood = searchParams.get('mood') || ''
    const sortBy = searchParams.get('sortBy') || 'newest'
    const status = searchParams.get('status') || 'published'
    
    const skip = (page - 1) * limit
    
    // Build query
    const query: any = { status }
    
    if (search) {
      query.$text = { $search: search }
    }
    
    if (tags.length > 0) {
      query.tags = { $in: tags }
    }
    
    if (mood) {
      query.mood = mood
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
      default:
        sort = { createdAt: -1 }
    }
    
    const [blogs, total] = await Promise.all([
      Blog.find(query)
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
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect()
    
    const body = await request.json()
    const { title, content, tags, mood, coverImage, author } = body
    
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
      status: 'draft'
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