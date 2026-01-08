import { NextResponse } from 'next/server'
import { Blog } from '@/lib/models/Blog'
import mongoose from 'mongoose'

export async function GET() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '')

    // Get total posts
    const totalPosts = await Blog.countDocuments({ status: 'published', isDeleted: false })

    // Get unique authors
    const authors = await Blog.distinct('author.id', { status: 'published', isDeleted: false })
    const totalWriters = authors.length

    // Get average read time
    const avgReadTimeResult = await Blog.aggregate([
      { $match: { status: 'published', isDeleted: false } },
      { $group: { _id: null, avgReadTime: { $avg: '$readTime' } } }
    ])
    const avgReadTime = Math.round(avgReadTimeResult[0]?.avgReadTime || 5)

    // Get trending hashtag/topic from most used tags
    const trendingTagsResult = await Blog.aggregate([
      { $match: { status: 'published', isDeleted: false } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ])
    const trending = trendingTagsResult[0]?._id ? `#${trendingTagsResult[0]._id}` : '#Hope'

    return NextResponse.json({
      posts: totalPosts,
      writers: totalWriters,
      avgReadTime,
      trending
    })
  } catch (error) {
    console.error('Failed to fetch blog stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
