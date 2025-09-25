import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    
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