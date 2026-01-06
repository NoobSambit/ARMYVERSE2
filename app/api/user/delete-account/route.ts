import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, getUserFromAuth } from '@/lib/auth/verify'
import { connect } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connect()

    // Get user first to ensure we have the correct document
    const user = await getUserFromAuth(authUser)
    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const deleteResult = await User.findByIdAndDelete(user._id)

    if (!deleteResult) {
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
