import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth } from '@/lib/auth/verify'
import { getUserBadges } from '@/lib/game/streakTracking'
import { MasteryRewardLedger } from '@/lib/models/MasteryRewardLedger'

export const runtime = 'nodejs'

/**
 * GET /api/game/badges
 * Get user's earned badges
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connect()

    const badges = await getUserBadges(user.uid)

    const masteryEntries = await MasteryRewardLedger.find({
      userId: user.uid,
      badgeCode: { $exists: true, $ne: null }
    })
      .sort({ createdAt: -1 })
      .lean<any[]>()

    const masteryBadges = masteryEntries.flatMap(entry => {
      const kind = entry.kind as 'member' | 'era'
      const key = entry.key as string
      const milestone = entry.milestone as number
      const baseVariant =
        kind === 'member' && milestone === 100 ? 'special' : 'milestone'

      const label = `${key} ${kind === 'member' ? 'Mastery' : 'Era Mastery'}`
      const name = `${label} - Level ${milestone}${baseVariant === 'special' ? ' (Special)' : ''}`
      const description = `Reach level ${milestone} in ${key} ${kind === 'member' ? 'member' : 'era'} mastery`

      const base = {
        id: `${entry._id.toString()}-${entry.badgeCode}`,
        badge: {
          code: entry.badgeCode,
          name,
          description,
          icon: baseVariant === 'special' ? '👑' : '🏅',
          rarity: entry.badgeRarity || 'common',
          type: 'achievement' as const
        },
        earnedAt: entry.createdAt?.toISOString() || new Date().toISOString(),
        metadata: {
          masteryKind: kind,
          masteryKey: key,
          masteryLevel: milestone,
          masteryVariant: baseVariant
        }
      }

      const extras = (entry.extraBadges || []).map((extra: { code: string; rarity?: string }) => ({
        id: `${entry._id.toString()}-${extra.code}`,
        badge: {
          code: extra.code,
          name: `${label} - Level ${milestone}`,
          description,
          icon: '🏅',
          rarity: extra.rarity || entry.badgeRarity || 'common',
          type: 'achievement' as const
        },
        earnedAt: entry.createdAt?.toISOString() || new Date().toISOString(),
        metadata: {
          masteryKind: kind,
          masteryKey: key,
          masteryLevel: milestone,
          masteryVariant: 'milestone' as const
        }
      }))

      return [base, ...extras]
    })

    const merged = [...badges, ...masteryBadges].sort((a, b) => {
      const aTime = new Date(a.earnedAt).getTime()
      const bTime = new Date(b.earnedAt).getTime()
      return bTime - aTime
    })

    return NextResponse.json({ badges: merged })
  } catch (error) {
    console.error('Badges fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
