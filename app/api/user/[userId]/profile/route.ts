import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { Types } from 'mongoose'
import { User } from '@/lib/models/User'
import { getPublicProfile, isFieldVisible } from '@/lib/utils/profile'
import { LeaderboardEntry } from '@/lib/models/LeaderboardEntry'
import { UserGameState } from '@/lib/models/UserGameState'
import { InventoryItem } from '@/lib/models/InventoryItem'

export const dynamic = 'force-dynamic'

/**
 * GET /api/user/[userId]/profile
 * Fetches a public user profile by userId (firebaseUid)
 * Respects privacy settings
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('[Profile API] Looking for user with firebaseUid/_id/username:', userId)

    await connect()

    const idFilters: Array<{ [key: string]: string }> = [
      { firebaseUid: userId },
      { username: userId.toLowerCase() }
    ]
    if (Types.ObjectId.isValid(userId)) {
      idFilters.push({ _id: userId })
    }

    // Find user by firebaseUid, _id, or username only (no email lookup for privacy/security)
    let userDoc = await User.findOne({ $or: idFilters }).lean()

    console.log('[Profile API] User found:', !!userDoc)

    if (!userDoc) {
      // Fallback: derive minimal public profile from leaderboard if available
      const lb = await LeaderboardEntry.findOne({ userId }).sort({ updatedAt: -1 }).lean()
      if (lb) {
        return NextResponse.json({
          profile: {
            userId,
            displayName: (lb as any)?.displayName || 'User',
            avatarUrl: (lb as any)?.avatarUrl || '',
            personalization: undefined,
            privacy: { visibility: 'public' }
          }
        })
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userDoc as any

    // Check privacy settings
    const privacy = user.profile?.privacy

    // For private profiles, only show basic info (avatar, banner, displayName)
    if (privacy?.visibility === 'private') {
      const resolvedUserId = user.firebaseUid || user._id.toString()
      return NextResponse.json({
        profile: {
          userId: resolvedUserId,
          displayName: (user.profile && user.profile.displayName) || user.name || 'User',
          avatarUrl: (user.profile && user.profile.avatarUrl) || user.image || '',
          bannerUrl: (user.profile && user.profile.bannerUrl) || '',
          privacy: { visibility: 'private' },
          personalization: user.profile.personalization
        }
      })
    }

    // For 'followers' visibility, we'd need to check if requester follows this user
    // For now, we'll treat it as public (TODO: implement follower system)

    // Get public profile (filters based on privacy settings)
    const publicProfile = getPublicProfile(user.profile)

    // Fetch Boraland stats
    const gameUserId = user.firebaseUid || user._id.toString()

    const [gameState, totalCards, leaderboardEntry] = await Promise.all([
      UserGameState.findOne({ userId: gameUserId }).lean() as any,
      InventoryItem.countDocuments({ userId: gameUserId }),
      LeaderboardEntry.findOne({ userId: gameUserId, periodKey: 'alltime' }).lean() as any
    ])

    const gameStats = {
      totalCards: totalCards || 0,
      totalXp: gameState?.xp || 0,
      leaderboardRank: leaderboardEntry?.rank || 0
    }

    // Merge stats if visible (or if publicProfile has stats, or if privacy allows)
    // We'll trust getPublicProfile to have handled the privacy check for 'stats' field
    // If stats is missing but should be there (e.g. empty stats initially), we might need to check privacy again
    // For now, let's assume if it returns an object, we append to it.
    // However, getPublicProfile might return undefined for stats if they are empty in DB.
    // So better to check privacy directly for these computed stats.
    const showStats = isFieldVisible('stats', user.profile?.privacy);

    const statsToReturn = showStats ? {
      ...(publicProfile.stats || {}),
      ...gameStats
    } : undefined;

    const resolvedUserId = user.firebaseUid || user._id.toString()
    return NextResponse.json({
      profile: {
        ...publicProfile,
        userId: resolvedUserId,
        // Always include these basic fields
        displayName: (user.profile && user.profile.displayName) || user.name || 'User',
        avatarUrl: (user.profile && user.profile.avatarUrl) || user.image || '',
        personalization: user.profile?.personalization,
        stats: statsToReturn
      }
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
