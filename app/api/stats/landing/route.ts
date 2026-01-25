import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'
import { UserGameState } from '@/lib/models/UserGameState'
import { Track } from '@/lib/models/Track'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    await connect()

    // Get user count
    const totalUsers = await User.countDocuments()

    // Get active Boraland players (users with game state)
    const boralandPlayers = await UserGameState.countDocuments()

    const btsTrackCount = await Track.countDocuments({ isBTSFamily: true })
    const totalTracks = btsTrackCount > 0 ? btsTrackCount : await Track.countDocuments()

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
      totalUsers: 0,
      boralandPlayers: 0,
      totalTracks: 0
    }, { status: 500 })
  }
}
