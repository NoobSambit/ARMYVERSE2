import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth, getUserFromAuth } from '@/lib/auth/verify'
import { verifyAllStreamingQuests } from '@/lib/game/streamingVerification'
import { getUserQuests } from '@/lib/game/quests'

export const runtime = 'nodejs'

/**
 * POST /api/game/quests/verify-streaming
 * Check Last.fm for new streams and update quest progress
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connect()

    // Get streaming service username
    const userData = await getUserFromAuth(authUser)
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const lastfmUsername = userData?.integrations?.lastfm?.username
    const statsfmUsername = userData?.integrations?.statsfm?.username

    // Check if at least one service is connected
    if (!lastfmUsername && !statsfmUsername) {
      return NextResponse.json({
        error: 'No streaming service connected. Please connect Last.fm or Stats.fm to verify your progress.',
        needsConnection: true
      }, { status: 400 })
    }

    // Prefer Last.fm if available (more accurate for quest tracking)
    const usernameToVerify = lastfmUsername || statsfmUsername

    // Verify all streaming quests
    await verifyAllStreamingQuests(authUser.uid, usernameToVerify)

    // Return updated quests
    const quests = await getUserQuests(authUser.uid)

    return NextResponse.json({
      success: true,
      message: `Verified using ${lastfmUsername ? 'Last.fm' : 'Stats.fm'}`,
      quests: quests.filter(q => q.goalType.startsWith('stream:'))
    })
  } catch (error: any) {
    console.error('Streaming verification error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to verify streaming progress. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
