import { NextResponse } from 'next/server'
import { fetchDashboardData } from '@/lib/spotify/dashboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    console.debug('🎵 Dashboard API called')
    
    const body = await req.json()
    const { userId } = body

    if (!userId) {
      console.debug('❌ Missing userId in request')
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    console.debug(`�� Fetching dashboard data for user: ${userId}`)
    
    const dashboardData = await fetchDashboardData(userId)
    
    console.debug('✅ Dashboard data fetched successfully')
    
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('❌ Error in dashboard API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}