import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'
import { getPublicProfile } from '@/lib/utils/profile'

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

    console.log('[Profile API] Looking for user with firebaseUid:', userId)

    await connect()

    // Find user by firebaseUid
    const userDoc = await User.findOne({ firebaseUid: userId }).lean()
    
    console.log('[Profile API] User found:', !!userDoc)

    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userDoc as any

    if (!user.profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check privacy settings
    const privacy = user.profile.privacy
    
    // For private profiles, only show basic info (avatar, banner, displayName)
    if (privacy?.visibility === 'private') {
      return NextResponse.json({
        profile: {
          userId: user.firebaseUid,
          displayName: user.profile.displayName || user.name || 'User',
          avatarUrl: user.profile.avatarUrl || user.image || '',
          bannerUrl: user.profile.bannerUrl || '',
          privacy: { visibility: 'private' },
          personalization: user.profile.personalization
        }
      })
    }

    // For 'followers' visibility, we'd need to check if requester follows this user
    // For now, we'll treat it as public (TODO: implement follower system)
    
    // Get public profile (filters based on privacy settings)
    const publicProfile = getPublicProfile(user.profile)

    return NextResponse.json({
      profile: {
        ...publicProfile,
        userId: user.firebaseUid,
        // Always include these basic fields
        displayName: user.profile.displayName || user.name || 'User',
        avatarUrl: user.profile.avatarUrl || user.image || '',
        personalization: user.profile.personalization
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
