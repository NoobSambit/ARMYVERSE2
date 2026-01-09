import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connect } from '@/lib/db/mongoose'
import { Question } from '@/lib/models/Question'
import { scoreWithBreakdown, Difficulty } from '@/lib/game/scoring'
import { Photocard } from '@/lib/models/Photocard'
import { mapPhotocardSummary } from '@/lib/game/photocardMapper'

export const runtime = 'nodejs'

/**
 * POST /api/game/quiz/demo/complete
 *
 * Public demo endpoint - no authentication required, no DB writes
 * Returns scoring and a preview reward but performs zero writes
 *
 * curl example:
 * curl -X POST 'http://localhost:3000/api/game/quiz/demo/complete' \
 *  -H 'Content-Type: application/json' \
 *  -d '{ "answers": [0,1,2,3,0,1,2,3,0,1], "sessionSeed": "abc123" }'
 */

const CompleteSchema = z.object({
  answers: z.array(z.number().int().min(-1)), // Allow -1 for unanswered questions
  sessionSeed: z.string().min(8)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const input = CompleteSchema.safeParse(body)
    if (!input.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    await connect()

    // We need to get the questions that were served in the demo start
    // For demo mode, we'll use a simple approach - get 10 random questions
    // and assume they match what was served (this is a limitation of demo mode)
    const questions = await Question.aggregate([{ $sample: { size: 10 } }])

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No questions available' }, { status: 500 })
    }

    const answers = input.data.answers
    if (answers.length !== questions.length) {
      return NextResponse.json({ error: 'Mismatched answers length' }, { status: 400 })
    }

    const ordered = (questions as any[]).map((q) => ({ id: q._id.toString(), question: q.question, choices: q.choices, answerIndex: q.answerIndex, difficulty: q.difficulty as Difficulty }))
    const scored = scoreWithBreakdown({ questions: ordered, userAnswers: answers })
    const correctCount = scored.correctCount
    const xp = scored.xp

    // Generate a preview reward using the session seed for consistent results
    // Use a simple hash of the session seed to get consistent "random" results
    const seed = input.data.sessionSeed
    const hash = seed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)

    const totalCards = await Photocard.estimatedDocumentCount()
    let previewCard = null as any
    if (totalCards > 0) {
      const offset = Math.abs(hash) % totalCards
      const cards = await Photocard.aggregate([
        { $skip: offset },
        { $limit: 1 }
      ])
      previewCard = cards?.[0] || null
    }

    return NextResponse.json({
      xp,
      correctCount,
      rarityWeightsUsed: null,
      pityApplied: false,
      previewReward: mapPhotocardSummary(previewCard),
      review: {
        items: ordered.map((q, i) => ({
          id: q.id,
          question: q.question,
          choices: q.choices,
          difficulty: q.difficulty,
          userAnswerIndex: answers[i],
          correctIndex: q.answerIndex,
          xpAward: scored.breakdown[i]?.xpAward || 0
        })),
        summary: { xp, correctCount }
      }
    })
  } catch (error) {
    console.error('Demo quiz complete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
