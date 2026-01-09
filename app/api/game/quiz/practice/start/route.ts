import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connect } from '@/lib/db/mongoose'
import { selectQuestions } from '@/lib/game/selectQuestions'
import { QuizSession } from '@/lib/models/QuizSession'

export const runtime = 'nodejs'

/**
 * POST /api/game/quiz/practice/start
 *
 * Public practice endpoint - no authentication required
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
    const expiresAt = new Date(now.getTime() + 20 * 60 * 1000)
    const seed = Math.random().toString(36).slice(2)

    const session = await QuizSession.create({
      userId: `guest:${seed}`,
      questionIds,
      answers: [],
      seed,
      score: 0,
      status: 'active',
      mode: 'practice',
      expiresAt,
      createdAt: now
    })

    const responseQuestions = questions.map((q: any) => ({
      id: q._id.toString(),
      question: q.question,
      choices: q.choices
    }))

    return NextResponse.json({
      sessionId: session._id.toString(),
      questions: responseQuestions,
      expiresAt,
      mode: 'practice'
    })
  } catch (error) {
    console.error('Practice quiz start error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
