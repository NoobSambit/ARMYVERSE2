import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth } from '@/lib/auth/verify'
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
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connect()

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
      await User.findOneAndUpdate(
        { firebaseUid: user.uid },
        updateOps,
        { upsert: false }
      )
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
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connect()

    const userData = await User.findOne({ firebaseUid: user.uid }).lean() as any

    return NextResponse.json({
      lastfm: userData?.integrations?.lastfm || null,
      statsfm: userData?.integrations?.statsfm || null
    })
  } catch (error) {
    console.error('Integration fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
