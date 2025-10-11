import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connect } from '@/lib/db/mongoose'
import { Question } from '@/lib/models/Question'
import { scoreWithBreakdown, Difficulty } from '@/lib/game/scoring'
import { weightsForXpBand } from '@/lib/game/dropTable'
import { url as cloudinaryUrl } from '@/lib/cloudinary'

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

    const weights = weightsForXpBand(xp)
    const entries = [
      ['common', weights.common],
      ['rare', weights.rare],
      ['epic', weights.epic],
      ['legendary', weights.legendary]
    ] as [string, number][]
    const total = entries.reduce((s, [, w]) => s + w, 0)
    let selectedRarity: string | null = null
    if (total > 0) {
      let randomValue = Math.abs(hash) % total
      for (const [rar, w] of entries) {
        randomValue -= w
        if (randomValue < 0) { selectedRarity = rar; break }
      }
      if (!selectedRarity) selectedRarity = 'common'
    }

    // Get a random card of the selected rarity (or any card if none found)
    let previewCard = null as any
    if (selectedRarity) {
      const cards = await Question.db.collection('photocards').aggregate([
        { $match: { rarity: selectedRarity } },
        { $sample: { size: 1 } }
      ]).toArray()
      previewCard = cards?.[0] || null
    }

    if (!previewCard) {
      const fallback = await Question.db.collection('photocards').aggregate([
        { $sample: { size: 1 } }
      ]).toArray()
      previewCard = fallback?.[0] || null
    }

    const imageUrl = previewCard ? cloudinaryUrl(previewCard.publicId) : null

    return NextResponse.json({
      xp,
      correctCount,
      rarityWeightsUsed: total > 0 ? weights : null,
      pityApplied: false,
      previewReward: previewCard ? {
        rarity: previewCard.rarity,
        member: previewCard.member,
        era: previewCard.era,
        set: previewCard.set,
        publicId: previewCard.publicId,
        imageUrl
      } : null,
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
