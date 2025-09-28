import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { Blog } from '@/lib/models/Blog'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connect()
    const blog = await Blog.findByIdAndUpdate(
      params.id,
      { isDeleted: false, deletedAt: null },
      { new: true }
    )
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Blog restored', blog })
  } catch (error) {
    console.error('Error restoring blog:', error)
    return NextResponse.json({ error: 'Failed to restore blog' }, { status: 500 })
  }
}


