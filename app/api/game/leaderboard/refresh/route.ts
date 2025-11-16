import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyFirebaseToken } from '@/lib/auth/verify'
import { LeaderboardEntry } from '@/lib/models/LeaderboardEntry'
import { User } from '@/lib/models/User'

export const runtime = 'nodejs'

function weeklyKey(date = new Date()) {
  const tmp = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayNum = tmp.getUTCDay() || 7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `weekly-${tmp.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`
}

/** POST /api/game/leaderboard/refresh - Force update current user's leaderboard entry with profile data */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    await connect()

    const periodKey = weeklyKey()
    
    // Get user profile data from MongoDB
    let userDoc = await User.findOne({ firebaseUid: user.uid }).lean()
    if (!userDoc && user.email) {
      userDoc = await User.findOne({ email: user.email }).lean()
    }
    const profileDisplayName = (userDoc as any)?.profile?.displayName || user.name || user.email || 'User'
    const profileAvatarUrl = (userDoc as any)?.profile?.avatarUrl || user.picture || ''
    
    console.log('[Leaderboard Refresh] Updating:', {
      userId: user.uid,
      displayName: profileDisplayName,
      avatarUrl: profileAvatarUrl,
      hasProfile: !!(userDoc as any)?.profile
    })
    
    // Update existing entry or create new one
    const result = await LeaderboardEntry.findOneAndUpdate(
      { periodKey, userId: user.uid },
      { 
        $set: {
          displayName: profileDisplayName, 
          avatarUrl: profileAvatarUrl,
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({ 
      success: true,
      entry: {
        displayName: result.displayName,
        avatarUrl: result.avatarUrl,
        score: result.score
      }
    })
  } catch (error) {
    console.error('Leaderboard refresh error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
