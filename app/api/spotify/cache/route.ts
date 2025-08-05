import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }
    
    // For now, return null to indicate no cached data
    // In a real implementation, this would check a database or cache
    return NextResponse.json(null)
  } catch (error) {
    console.error('Error fetching cached data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cached data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, data, timestamp } = body
    
    if (!userId || !data) {
      return NextResponse.json(
        { error: 'userId and data are required' },
        { status: 400 }
      )
    }
    
    // For now, just return success
    // In a real implementation, this would store in a database or cache
    console.log(`Caching data for user: ${userId}`)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error caching data:', error)
    return NextResponse.json(
      { error: 'Failed to cache data' },
      { status: 500 }
    )
  }
} 