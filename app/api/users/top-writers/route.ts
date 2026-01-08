import { NextResponse } from 'next/server'
import { Blog } from '@/lib/models/Blog'
import { User } from '@/lib/models/User'
import mongoose from 'mongoose'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    await mongoose.connect(process.env.MONGODB_URI || '')

    // Get top writers based on published blog count
    const topAuthors = await Blog.aggregate([
      { $match: { status: 'published', isDeleted: false } },
      {
        $group: {
          _id: '$author.id',
          blogCount: { $sum: 1 },
          latestPost: { $max: '$createdAt' }
        }
      },
      { $sort: { blogCount: -1, latestPost: -1 } },
      { $limit: limit }
    ])

    // Enrich with user profile data
    const userIds = topAuthors.map(a => a._id)
    const users = await User.find({ _id: { $in: userIds } }).lean()

    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]))

    const enrichedAuthors = topAuthors.map(author => {
      const userData = userMap.get(author._id.toString())
      return {
        _id: author._id,
        profile: {
          displayName: userData?.profile?.displayName || 'Unknown Author',
          avatarUrl: userData?.profile?.avatarUrl || null,
          bio: userData?.profile?.bio || ''
        },
        stats: {
          blogCount: author.blogCount
        },
        isOnline: Math.random() > 0.5 // Random online status for demo
      }
    })

    return NextResponse.json({ users: enrichedAuthors })
  } catch (error) {
    console.error('Failed to fetch top writers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top writers', users: [] },
      { status: 500 }
    )
  }
}
