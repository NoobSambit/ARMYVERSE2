import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth, getUserFromAuth } from '@/lib/auth/verify'
import { getUserQuests } from '@/lib/game/quests'
import { QuestDefinition } from '@/lib/models/QuestDefinition'

export const runtime = 'nodejs'

/** GET /api/game/quests */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connect()
    const quests = await getUserQuests(user.uid)

    // Fetch full quest definitions with streaming metadata
    const questCodes = quests.map(q => q.code)
    const defs = await QuestDefinition.find({ code: { $in: questCodes } }).lean()

    const enriched = quests.map(q => {
      const def = defs.find(d => d.code === q.code)
      return {
        ...q,
        streamingMeta: def?.streamingMeta || null,
        reward: {
          ...q.reward,
          xp: def?.reward?.xp || 0,
          badgeId: def?.reward?.badgeId || null
        }
      }
    })

    return NextResponse.json({ quests: enriched })
  } catch (error) {
    console.error('Quests GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


