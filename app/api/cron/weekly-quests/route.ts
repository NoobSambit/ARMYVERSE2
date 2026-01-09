import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { ensureWeeklyStreamingQuests } from '@/lib/game/streamingQuestSelection'
import { ensureWeeklyQuizQuests } from '@/lib/game/quizQuestGeneration'

export const runtime = 'nodejs'

function isCronAuthDisabled() {
  const flag = process.env.DISABLE_CRON_AUTH
  return flag === '1' || flag?.toLowerCase() === 'true'
}

/**
 * CRON: Monday at 00:00 UTC
 * Generates weekly streaming and quiz quests
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!isCronAuthDisabled() && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const force = url.searchParams.get('force') === '1'
    const seedSuffix = url.searchParams.get('seed') || (force ? `${Date.now()}` : '')

    console.log('[cron] weekly-quests start', new Date().toISOString())
    await connect()
    await Promise.all([
      ensureWeeklyStreamingQuests({ force, seedSuffix }),
      ensureWeeklyQuizQuests({ force, seedSuffix })
    ])
    console.log('[cron] weekly-quests success')
    return NextResponse.json({ success: true, message: 'Weekly quests generated', force })
  } catch (error) {
    console.error('Weekly quest generation error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
