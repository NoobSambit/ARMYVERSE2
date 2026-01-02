import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyFirebaseToken } from '@/lib/auth/verify'
import { User } from '@/lib/models/User'
import { verifyAllStreamingQuests } from '@/lib/game/streamingVerification'
import { getUserQuests } from '@/lib/game/quests'

export const runtime = 'nodejs'

/**
 * POST /api/game/quests/verify-streaming
 * Check Last.fm for new streams and update quest progress
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connect()

    // Get Last.fm username
    const userData = await User.findOne({ firebaseUid: user.uid }).lean() as any
    const lastfmUsername = userData?.integrations?.lastfm?.username

    if (!lastfmUsername) {
      return NextResponse.json({ error: 'Last.fm not connected' }, { status: 400 })
    }

    // Verify all streaming quests
    await verifyAllStreamingQuests(user.uid, lastfmUsername)

    // Return updated quests
    const quests = await getUserQuests(user.uid)

    return NextResponse.json({
      success: true,
      quests: quests.filter(q => q.goalType.startsWith('stream:'))
    })
  } catch (error) {
    console.error('Streaming verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
