import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { Blog } from '@/lib/models/Blog'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connect()
    
    const blog = await Blog.findOne({ _id: params.id, isDeleted: { $ne: true } }).lean()
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }
    
    // Increment view count only if visible
    await Blog.findByIdAndUpdate(params.id, { $inc: { views: 1 } })
    
    return NextResponse.json(blog)
    
  } catch (error) {
    console.error('Error fetching blog:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connect()
    
    const body = await request.json()
    const { title, content, tags, mood, coverImage, status, visibility } = body
    
    const updateData: any = {}
    if (title) updateData.title = title
    if (content) updateData.content = content
    if (tags) updateData.tags = tags
    if (mood) updateData.mood = mood
    if (coverImage !== undefined) updateData.coverImage = coverImage
    if (status) updateData.status = status
    if (visibility) updateData.visibility = visibility
    updateData.updatedAt = new Date()
    
    const blog = await Blog.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    )
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(blog)
    
  } catch (error) {
    console.error('Error updating blog:', error)
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connect()
    
    const blog = await Blog.findByIdAndUpdate(params.id, { isDeleted: true, deletedAt: new Date() }, { new: true })
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Blog moved to trash' })
    
  } catch (error) {
    console.error('Error deleting blog:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    )
  }
} 