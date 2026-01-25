import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth, getUserFromAuth } from '@/lib/auth/verify'
import { User } from '@/lib/models/User'
import { getLastFmClient } from '@/lib/lastfm/client'

export const runtime = 'nodejs'

const Schema = z.object({
  lastfmUsername: z.string().min(1).optional().nullable(),
  statsfmUsername: z.string().min(1).optional().nullable()
})

/**
 * PATCH /api/user/integrations
 * Save or disconnect Last.fm/Stats.fm username
 */
export async function PATCH(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connect()

    let dbUser = await getUserFromAuth(authUser)
    if (!dbUser && authUser.authType === 'firebase' && authUser.email) {
      dbUser = await User.findOneAndUpdate(
        { email: authUser.email },
        {
          $setOnInsert: {
            username: authUser.username || authUser.email.split('@')[0],
            name: authUser.displayName || authUser.email.split('@')[0] || 'User',
            email: authUser.email,
            firebaseUid: authUser.uid,
            createdAt: new Date(),
            profile: {
              displayName: authUser.displayName || authUser.email.split('@')[0] || 'User',
              avatarUrl: authUser.photoURL || '',
            }
          }
        },
        { upsert: true, new: true }
      )
    }

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (authUser.authType === 'firebase' && (!dbUser.firebaseUid || dbUser.firebaseUid !== authUser.uid)) {
      await User.updateOne({ _id: dbUser._id }, { $set: { firebaseUid: authUser.uid } })
    }

    const body = await request.json().catch(() => ({}))
    const input = Schema.safeParse(body)
    if (!input.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const updates: any = {}
    const unsets: any = {}

    // Handle Last.fm
    if ('lastfmUsername' in input.data) {
      if (input.data.lastfmUsername === null) {
        // Disconnect
        unsets['integrations.lastfm'] = ''
      } else if (input.data.lastfmUsername) {
        // Connect - verify username exists
        try {
          const client = getLastFmClient()
          await client.getUserInfo(input.data.lastfmUsername)

          updates['integrations.lastfm'] = {
            username: input.data.lastfmUsername,
            connectedAt: new Date(),
            verified: true
          }
        } catch (err) {
          return NextResponse.json({ error: 'Last.fm user not found. Please check your username.' }, { status: 404 })
        }
      }
    }

    // Handle Stats.fm
    if ('statsfmUsername' in input.data) {
      if (input.data.statsfmUsername === null) {
        // Disconnect
        unsets['integrations.statsfm'] = ''
      } else if (input.data.statsfmUsername) {
        // Connect (no verification API available for stats.fm)
        updates['integrations.statsfm'] = {
          username: input.data.statsfmUsername,
          connectedAt: new Date(),
          verified: false
        }
      }
    }

    const updateOps: any = {}
    if (Object.keys(updates).length > 0) updateOps.$set = updates
    if (Object.keys(unsets).length > 0) updateOps.$unset = unsets

    if (Object.keys(updateOps).length > 0) {
      await User.updateOne({ _id: dbUser._id }, updateOps)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Integration update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/user/integrations
 * Get user's integration status
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connect()

    const userData = await getUserFromAuth(authUser)
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      lastfm: userData.integrations?.lastfm || null,
      statsfm: userData.integrations?.statsfm || null
    })
  } catch (error) {
    console.error('Integration fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
