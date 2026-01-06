import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, getUserFromAuth } from '@/lib/auth/verify'
import { connect } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connect()

    const user = await getUserFromAuth(authUser)
    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const updateResult = await User.findByIdAndUpdate(
      user._id,
      {
        $unset: {
          'integrations.spotify': ''
        }
      },
      { new: true }
    )

    if (!updateResult) {
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Spotify disconnect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
