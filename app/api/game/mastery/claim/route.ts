import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth } from '@/lib/auth/verify'
import { MasteryProgress } from '@/lib/models/MasteryProgress'
import { MasteryRewardLedger } from '@/lib/models/MasteryRewardLedger'
import { getMasteryDefinitions, claimableMilestones as computeClaimable, MASTERY_MILESTONES, formatTrack, dividerFor, getMasteryBadgeCode } from '@/lib/game/mastery'
import { Question } from '@/lib/models/Question'
import { awardBalances } from '@/lib/game/rewards'

export const runtime = 'nodejs'

/**
 * POST /api/game/mastery/claim
 * Body: { kind: 'member'|'era', key: string, milestone?: number }
 */
const Schema = z.object({ kind: z.enum(['member', 'era']), key: z.string().min(1), milestone: z.number().int().positive().optional() })

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connect()

    const body = await request.json().catch(() => ({}))
    const input = Schema.safeParse(body)
    if (!input.success) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

    const prog = await MasteryProgress.findOne({ userId: user.uid, kind: input.data.kind, key: input.data.key })
    if (!prog) return NextResponse.json({ error: 'Not eligible' }, { status: 400 })

    const baseDefs = getMasteryDefinitions()
    const dynamicMembers = await Question.distinct('members', { members: { $exists: true, $ne: [] } })
    const dynamicEras = await Question.distinct('eras', { eras: { $exists: true, $ne: [] } })
    const memberKeys = Array.from(new Set([...baseDefs.members.map(m => m.key), ...dynamicMembers.filter(Boolean) as string[]]))
    const eraKeys = Array.from(new Set([...dynamicEras.filter(Boolean) as string[]]))
    const validKeys = input.data.kind === 'member' ? memberKeys : eraKeys
    if (!validKeys.includes(input.data.key) && !prog) {
      return NextResponse.json({ error: 'Unknown mastery key' }, { status: 400 })
    }

    const divider = dividerFor(input.data.kind, input.data.key)
    const claimable = computeClaimable(prog.xp || 0, prog.claimedMilestones || [], prog.level || 0, divider)
    if (!claimable.length) return NextResponse.json({ error: 'Nothing to claim' }, { status: 400 })

    const milestone = input.data.milestone ?? claimable[0]
    if (!claimable.includes(milestone)) return NextResponse.json({ error: 'Already claimed' }, { status: 409 })
    const reward = MASTERY_MILESTONES.find(m => m.level === milestone)
    if (!reward) return NextResponse.json({ error: 'Invalid milestone' }, { status: 400 })

    // Update mastery progress atomically
    await MasteryProgress.updateOne(
      { userId: user.uid, kind: input.data.kind, key: input.data.key },
      { $addToSet: { claimedMilestones: milestone }, $set: { level: milestone, lastUpdatedAt: new Date() } }
    )

    const balances = await awardBalances(user.uid, { dust: reward.rewards.dust, xp: reward.rewards.xp })

    // Generate badge code for this milestone
    const badgeCode = getMasteryBadgeCode(input.data.kind, input.data.key, milestone)
    const badgeRarity = reward.badge.rarity

    // Ledger for audit (ignore duplicates) - now includes badge info
    try {
      await MasteryRewardLedger.create({
        userId: user.uid,
        kind: input.data.kind,
        key: input.data.key,
        milestone,
        rewards: reward.rewards,
        badgeCode,
        badgeRarity
      })
    } catch (err) {
      // noop on duplicate
    }

    const updated = await MasteryProgress.findOne({ userId: user.uid, kind: input.data.kind, key: input.data.key }).lean<any>()
    return NextResponse.json({
      milestone,
      rewards: reward.rewards,
      balances,
      badge: {
        code: badgeCode,
        rarity: badgeRarity,
        description: reward.badge.description,
        isSpecial: milestone === 100 && input.data.kind === 'member' && reward.badge.isSpecialAtMax
      },
      track: updated ? formatTrack(input.data.kind, input.data.key, updated.xp || 0, updated.claimedMilestones || [], updated.level || 0) : null
    })
  } catch (error) {
    console.error('Mastery claim error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
