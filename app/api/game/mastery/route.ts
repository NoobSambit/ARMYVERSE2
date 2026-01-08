import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth } from '@/lib/auth/verify'
import { MasteryProgress } from '@/lib/models/MasteryProgress'
import { UserGameState } from '@/lib/models/UserGameState'
import { Question } from '@/lib/models/Question'
import { getMasteryDefinitions, formatTrack, MASTERY_MILESTONES } from '@/lib/game/mastery'

export const runtime = 'nodejs'

/** GET /api/game/mastery */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connect()

    const rows = await MasteryProgress.find({ userId: user.uid }).lean()
    const baseDefs = getMasteryDefinitions()

    // Derive dynamic definitions from questions only (free-tier friendly distinct lookups)
    const memberValues = await Question.distinct('members', { members: { $exists: true, $ne: [] } })
    const eraValues = await Question.distinct('eras', { eras: { $exists: true, $ne: [] } })

    const memberKeys = new Set<string>()
    const eraKeys = new Set<string>()
    const memberDefsExpanded: any[] = []
    const eraDefsExpanded: any[] = []

    const addMember = (key: any) => {
      if (!key || memberKeys.has(String(key))) return
      memberKeys.add(String(key))
      const def = baseDefs.members.find((m) => m.key === key)
      memberDefsExpanded.push(def || { key })
    }
    const addEra = (key: any) => {
      if (!key || eraKeys.has(String(key))) return
      eraKeys.add(String(key))
      const def = baseDefs.eras.find((m) => m.key === key)
      eraDefsExpanded.push(def || { key })
    }

    // Always include the core 7 members, plus any members referenced in questions
    baseDefs.members.forEach((m) => addMember(m.key))
    memberValues.forEach((m: any) => addMember(m))

    // Only include eras that exist in questions; filter base eras through question set
    const eraWhitelist = new Set(eraValues.map((e: any) => String(e)))
    baseDefs.eras.filter((e) => eraWhitelist.has(String(e.key))).forEach((e) => addEra(e.key))
    eraValues.forEach((e: any) => addEra(e))
    rows.filter(r => r.kind === 'member').forEach((r) => addMember(r.key))
    rows.filter(r => r.kind === 'era').forEach((r) => addEra(r.key))

    const defs = { members: memberDefsExpanded, eras: eraDefsExpanded }
    const byKey: Record<string, any> = {}
    for (const r of rows) {
      byKey[`${r.kind}:${r.key}`] = r
    }

    const memberTracks = defs.members.map((def) => {
      const prog = byKey[`member:${def.key}`]
      const xp = prog?.xp || 0
      const claimed = prog?.claimedMilestones || []
      const legacyLevel = prog?.level || 0
      return { definition: def, track: formatTrack('member', def.key, xp, claimed, legacyLevel) }
    })

    const eraTracks = defs.eras.map((def) => {
      const prog = byKey[`era:${def.key}`]
      const xp = prog?.xp || 0
      const claimed = prog?.claimedMilestones || []
      const legacyLevel = prog?.level || 0
      return { definition: def, track: formatTrack('era', def.key, xp, claimed, legacyLevel) }
    })

    const claimableCount = [...memberTracks, ...eraTracks].reduce((acc, item) => acc + (item.track.claimable?.length || 0), 0)
    const state = await UserGameState.findOne({ userId: user.uid }).lean<any>()

    return NextResponse.json({
      members: memberTracks,
      eras: eraTracks,
      milestones: MASTERY_MILESTONES,
      summary: {
        totalTracks: memberTracks.length + eraTracks.length,
        claimableCount,
        dust: state?.dust || 0,
        totalXp: state?.xp || 0
      }
    })
  } catch (error) {
    console.error('Mastery GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
