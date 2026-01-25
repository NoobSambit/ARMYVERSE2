import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth } from '@/lib/auth/verify'
import { MasteryRewardLedger } from '@/lib/models/MasteryRewardLedger'
import { MASTERY_MILESTONES } from '@/lib/game/mastery'
import { getMasteryBadgeImagePath, getMasteryBadgeRarity, getBadgeImagePath } from '@/lib/utils/badgeImages'

export const runtime = 'nodejs'

export type MasteryBadge = {
    code: string
    kind: 'member' | 'era'
    key: string
    milestone: number
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    imagePath: string
    earnedAt: string
    variant: 'milestone' | 'special'
}

/**
 * GET /api/game/mastery/badges
 * Returns all mastery badges earned by the authenticated user
 */
export async function GET(request: NextRequest) {
    try {
        const user = await verifyAuth(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await connect()

        // Fetch all claimed mastery rewards (which now include badge info)
        const ledgerEntries = await MasteryRewardLedger.find({
            userId: user.uid,
            badgeCode: { $exists: true, $ne: null }
        })
            .sort({ createdAt: -1 })
            .lean<any[]>()

        const badges: MasteryBadge[] = ledgerEntries.flatMap(entry => {
            const baseVariant = entry.kind === 'member' && entry.milestone === 100 ? 'special' : 'milestone'
            const base: MasteryBadge = {
                code: entry.badgeCode,
                kind: entry.kind as 'member' | 'era',
                key: entry.key,
                milestone: entry.milestone,
                rarity: entry.badgeRarity || getMasteryBadgeRarity(entry.milestone),
                imagePath: getMasteryBadgeImagePath(entry.kind, entry.key, entry.milestone),
                earnedAt: entry.createdAt?.toISOString() || new Date().toISOString(),
                variant: baseVariant
            }

            const extras = (entry.extraBadges || []).map((extra: { code: string; rarity?: string }) => ({
                code: extra.code,
                kind: entry.kind as 'member' | 'era',
                key: entry.key,
                milestone: entry.milestone,
                rarity: (extra.rarity as MasteryBadge['rarity']) || getMasteryBadgeRarity(entry.milestone),
                imagePath: getBadgeImagePath(extra.code),
                earnedAt: entry.createdAt?.toISOString() || new Date().toISOString(),
                variant: 'milestone' as const
            }))

            return [base, ...extras]
        })

        // Also return milestone definitions for UI display
        const milestoneInfo = MASTERY_MILESTONES.map(ms => ({
            level: ms.level,
            rewards: ms.rewards,
            badge: ms.badge
        }))

        return NextResponse.json({
            badges,
            milestones: milestoneInfo,
            total: badges.length
        })
    } catch (error) {
        console.error('Mastery badges GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
