import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { Blog } from '@/lib/models/Blog'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connect()
    
    const body = await request.json()
    const { userId, name, content } = body
    
    if (!userId || !name || !content) {
      return NextResponse.json(
        { error: 'User ID, name, and content are required' },
        { status: 400 }
      )
    }
    
    const blog = await Blog.findById(params.id)
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }
    
    // Add comment
    blog.comments.push({
      userId,
      name,
      content,
      createdAt: new Date()
    })
    
    await blog.save()
    
    return NextResponse.json({
      message: 'Comment added successfully',
      comment: blog.comments[blog.comments.length - 1]
    })
    
  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
} 