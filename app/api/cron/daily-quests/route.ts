import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { ensureDailyStreamingQuests } from '@/lib/game/streamingQuestSelection'
import { ensureDailyQuizQuests } from '@/lib/game/quizQuestGeneration'

export const runtime = 'nodejs'

/**
 * CRON: Daily at 00:00 UTC
 * Generates daily streaming and quiz quests
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connect()
    await Promise.all([
      ensureDailyStreamingQuests(),
      ensureDailyQuizQuests()
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Daily quest generation error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
