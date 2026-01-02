import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { ensureWeeklyStreamingQuests } from '@/lib/game/streamingQuestSelection'
import { ensureWeeklyQuizQuests } from '@/lib/game/quizQuestGeneration'

export const runtime = 'nodejs'

/**
 * CRON: Monday at 00:00 UTC
 * Generates weekly streaming and quiz quests
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connect()
    await Promise.all([
      ensureWeeklyStreamingQuests(),
      ensureWeeklyQuizQuests()
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Weekly quest generation error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
