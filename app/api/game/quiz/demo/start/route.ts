import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connect } from '@/lib/db/mongoose'
import { selectQuestions } from '@/lib/game/selectQuestions'

export const runtime = 'nodejs'

/**
 * POST /api/game/quiz/demo/start
 *
 * Public demo endpoint - no authentication required, no DB writes
 *
 * curl example:
 * curl -X POST 'http://localhost:3000/api/game/quiz/demo/start' \
 *  -H 'Content-Type: application/json' \
 *  -d '{ "locale": "en", "count": 10 }'
 */

const StartSchema = z.object({
  locale: z.string().min(2).max(10).optional(),
  count: z.number().int().min(1).max(20).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const input = StartSchema.safeParse(body)
    if (!input.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    await connect()

    const questions = await selectQuestions({
      locale: input.data.locale || 'en',
      count: input.data.count || 10
    })

    const questionIds = questions.map((q: any) => q._id)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 20 * 60 * 1000) // 20 minutes
    const sessionSeed = Math.random().toString(36).slice(2)

    const responseQuestions = questions.map((q: any) => ({
      id: q._id.toString(),
      question: q.question,
      choices: q.choices
    }))

    return NextResponse.json({
      questions: responseQuestions,
      sessionSeed,
      expiresAt,
      mode: 'demo'
    })
  } catch (error) {
    console.error('Demo quiz start error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
