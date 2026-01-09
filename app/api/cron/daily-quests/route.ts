import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { ensureDailyStreamingQuests } from '@/lib/game/streamingQuestSelection'
import { ensureDailyQuizQuests } from '@/lib/game/quizQuestGeneration'

export const runtime = 'nodejs'

function isCronAuthDisabled() {
  const flag = process.env.DISABLE_CRON_AUTH
  return flag === '1' || flag?.toLowerCase() === 'true'
}

/**
 * CRON: Daily at 00:00 UTC
 * Generates daily streaming and quiz quests
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (can be disabled via env for debugging/local runs)
  const authHeader = request.headers.get('authorization')
  if (!isCronAuthDisabled() && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const force = url.searchParams.get('force') === '1'
    const seedSuffix = url.searchParams.get('seed') || (force ? `${Date.now()}` : '')

    console.log('[cron] daily-quests start', new Date().toISOString())
    await connect()
    await Promise.all([
      ensureDailyStreamingQuests({ force, seedSuffix }),
      ensureDailyQuizQuests({ force, seedSuffix })
    ])
    console.log('[cron] daily-quests success')
    return NextResponse.json({ success: true, message: 'Daily quests generated', force })
  } catch (error) {
    console.error('Daily quest generation error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
