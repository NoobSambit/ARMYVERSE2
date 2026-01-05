import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'
import { UserGameState } from '@/lib/models/UserGameState'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    await connect()

    // Get user count
    const totalUsers = await User.countDocuments()

    // Get active Boraland players (users with game state)
    const boralandPlayers = await UserGameState.countDocuments()

    // Hardcoded track count for BTS discography (can be updated with actual count)
    const totalTracks = 350

    return NextResponse.json({
      ok: true,
      totalUsers,
      boralandPlayers,
      totalTracks
    }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' }
    })

  } catch (err: any) {
    console.error('Landing stats error:', err)
    return NextResponse.json({
      ok: false,
      error: String(err?.message || err),
      // Fallback data
      totalUsers: 2500000,
      boralandPlayers: 120000,
      totalTracks: 350
    }, { status: 500 })
  }
}
