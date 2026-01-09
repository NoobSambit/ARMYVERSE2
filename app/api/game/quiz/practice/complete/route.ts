import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connect } from '@/lib/db/mongoose'
import { QuizSession } from '@/lib/models/QuizSession'
import { Question } from '@/lib/models/Question'
import { scoreWithBreakdown, Difficulty } from '@/lib/game/scoring'

export const runtime = 'nodejs'

/**
 * POST /api/game/quiz/practice/complete
 *
 * Public practice endpoint - no authentication required
 * No rewards, no XP, no leaderboard updates.
 */

const CompleteSchema = z.object({
  sessionId: z.string().min(8),
  answers: z.array(z.number().int().min(-1))
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const input = CompleteSchema.safeParse(body)
    if (!input.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    await connect()

    const session = await QuizSession.findOne({ _id: input.data.sessionId, mode: 'practice' })
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 400 })
    }
    if (session.status !== 'active') {
      return NextResponse.json({ error: 'Session not active' }, { status: 409 })
    }
    if (session.expiresAt && session.expiresAt.getTime() <= Date.now()) {
      session.status = 'expired'
      await session.save()
      return NextResponse.json({ error: 'Session expired' }, { status: 410 })
    }

    const questionIds = (session.questionIds as unknown[]).map((id) => String(id))
    const answers = input.data.answers
    if (answers.length !== questionIds.length) {
      return NextResponse.json({ error: 'Mismatched answers length' }, { status: 400 })
    }

    type LeanQuestion = {
      _id: string
      question: string
      choices: string[]
      answerIndex: number
      difficulty: Difficulty
    }

    const questions = await Question.find(
      { _id: { $in: questionIds } },
      { question: 1, choices: 1, answerIndex: 1, difficulty: 1 }
    ).lean<LeanQuestion[]>()

    const qMap = new Map<string, {
      id: string
      question: string
      choices: string[]
      answerIndex: number
      difficulty: Difficulty
    }>()
    for (const q of questions) {
      const id = q._id.toString()
      qMap.set(id, {
        id,
        question: q.question,
        choices: q.choices,
        answerIndex: q.answerIndex,
        difficulty: q.difficulty
      })
    }

    const ordered = questionIds.map((id) => qMap.get(id) || { id, question: '', choices: [], answerIndex: -1, difficulty: 'easy' as Difficulty })
    const scored = scoreWithBreakdown({ questions: ordered, userAnswers: answers })
    const correctCount = scored.correctCount

    session.status = 'completed'
    session.answers = answers
    session.score = correctCount
    await session.save()

    return NextResponse.json({
      xp: 0,
      correctCount,
      reward: null,
      review: {
        items: ordered.map((q, i) => ({
          id: q.id,
          question: q.question,
          choices: q.choices,
          difficulty: q.difficulty,
          userAnswerIndex: answers[i],
          correctIndex: q.answerIndex,
          xpAward: 0
        })),
        summary: { xp: 0, correctCount }
      }
    })
  } catch (error) {
    console.error('Practice quiz complete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
