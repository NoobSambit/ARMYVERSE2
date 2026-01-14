import { NextRequest, NextResponse } from 'next/server'
import { calculateSEOScore } from '@/lib/blog/seo-scoring'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, excerpt, coverImage, coverAlt, tags, slug } = body

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Calculate SEO score
    const result = calculateSEOScore({
      title: title || '',
      content: content || '',
      excerpt,
      coverImage,
      coverAlt,
      tags: tags || [],
      slug,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error calculating SEO score:', error)
    return NextResponse.json(
      { error: 'Failed to calculate SEO score' },
      { status: 500 }
    )
  }
}
