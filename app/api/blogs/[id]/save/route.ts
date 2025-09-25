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
    const { userId, action } = body // action: 'save' or 'unsave'
    
    if (!userId || !['save', 'unsave'].includes(action)) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
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
    
    if (action === 'save') {
      // Add user to savedBy if not already there
      if (!blog.savedBy.includes(userId)) {
        blog.savedBy.push(userId)
      }
    } else {
      // Remove user from savedBy
      blog.savedBy = blog.savedBy.filter((savedId: string) => savedId !== userId)
    }
    
    await blog.save()
    
    return NextResponse.json({
      message: `Blog ${action}d successfully`,
      savedBy: blog.savedBy
    })
    
  } catch (error) {
    console.error('Error saving/unsaving blog:', error)
    return NextResponse.json(
      { error: 'Failed to save/unsave blog' },
      { status: 500 }
    )
  }
} 