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
    const { reactionType } = body // 'moved', 'loved', 'surprised'
    
    if (!reactionType || !['moved', 'loved', 'surprised'].includes(reactionType)) {
      return NextResponse.json(
        { error: 'Invalid reaction type' },
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
    
    // Increment the reaction count
    blog.reactions[reactionType as keyof typeof blog.reactions] += 1
    await blog.save()
    
    return NextResponse.json({
      message: 'Reaction added successfully',
      reactions: blog.reactions
    })
    
  } catch (error) {
    console.error('Error adding reaction:', error)
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    )
  }
} 