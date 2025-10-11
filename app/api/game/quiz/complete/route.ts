import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connect } from '@/lib/db/mongoose'
import { verifyFirebaseToken } from '@/lib/auth/verify'
import { QuizSession } from '@/lib/models/QuizSession'
import { Question } from '@/lib/models/Question'
import { InventoryItem } from '@/lib/models/InventoryItem'
import { rollQuizRarityAndCardByXp } from '@/lib/game/dropTable'
import { scoreWithBreakdown, Difficulty } from '@/lib/game/scoring'
import { url as cloudinaryUrl } from '@/lib/cloudinary'
// import { Photocard } from '@/lib/models/Photocard' // Not currently used
import { UserGameState } from '@/lib/models/UserGameState'
import { addMasteryXp } from '@/lib/game/mastery'
import { advanceQuest } from '@/lib/game/quests'
import { LeaderboardEntry } from '@/lib/models/LeaderboardEntry'

export const runtime = 'nodejs'

/**
 * POST /api/game/quiz/complete
 *
 * curl example:
 * curl -X POST 'http://localhost:3000/api/game/quiz/complete' \
 *  -H 'Authorization: Bearer <FIREBASE_ID_TOKEN>' \
 *  -H 'Content-Type: application/json' \
 *  -d '{ "sessionId": "64abc...", "answers": [0,1,2,3,0,1,2,3,0,1] }'
 */

const CompleteSchema = z.object({
  sessionId: z.string().min(8),
  answers: z.array(z.number().int().min(-1)) // Allow -1 for unanswered questions
})

export async function POST(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const input = CompleteSchema.safeParse(body)
    if (!input.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    await connect()

    const session = await QuizSession.findOne({ _id: input.data.sessionId, userId: user.uid })
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

    const questionIds = (session.questionIds as any[]).map((id: any) => id.toString())
    const answers = input.data.answers
    if (answers.length !== questionIds.length) {
      console.warn('Mismatched answers length', { expected: questionIds.length, got: answers.length, sessionId: session._id.toString(), userId: user.uid })
      return NextResponse.json({ error: 'Mismatched answers length' }, { status: 400 })
    }

    const questions = await Question.find({ _id: { $in: questionIds } }, { question: 1, choices: 1, answerIndex: 1, difficulty: 1 }).lean()
    const qMap = new Map<string, { id: string; question: string; choices: string[]; answerIndex: number; difficulty: Difficulty }>()
    for (const q of questions as any[]) {
      qMap.set(q._id.toString(), { id: q._id.toString(), question: q.question, choices: q.choices, answerIndex: q.answerIndex, difficulty: q.difficulty as Difficulty })
    }
    const ordered = questionIds.map((id) => qMap.get(id) || { id, question: '', choices: [], answerIndex: -1, difficulty: 'easy' as Difficulty })

    // Mark session completed BEFORE revealing answers in the response
    session.status = 'completed'
    session.answers = answers
    session.score = 0
    await session.save()

    const scored = scoreWithBreakdown({
      questions: ordered,
      userAnswers: answers
    })
    const correctCount = scored.correctCount
    const xp = scored.xp

    // Persist base completion and XP before reward gating
    await UserGameState.findOneAndUpdate({ userId: user.uid }, { $inc: { xp } }, { upsert: true })

    // Reward roll
    let rarity: any = null
    let card: any = null
    let rarityWeightsUsed: any = null
    let pityApplied = false
    {
      if (xp < 5) {
        return NextResponse.json({
          xp,
          correctCount,
          reward: null,
          reason: 'low_xp',
          rarityWeightsUsed: null,
          pityApplied: false,
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
      }
      const roll = await rollQuizRarityAndCardByXp(user.uid, xp)
      rarity = roll.rarity
      card = roll.card
      rarityWeightsUsed = roll.rarityWeightsUsed
      pityApplied = roll.pityApplied
    }
    if (!card) {
      // Safety: if no card came back (shouldn't happen for non-practice with enough XP), return no reward
      return NextResponse.json({
        xp,
        correctCount,
        reward: null,
        reason: 'no_card',
        rarityWeightsUsed: rarityWeightsUsed || null,
        pityApplied,
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
    }

    let inventoryCount = await InventoryItem.countDocuments({ userId: user.uid })
    if (card) {
      const existingForSession = await InventoryItem.findOne({ userId: user.uid, 'source.sessionId': session._id })
      if (!existingForSession) {
        await InventoryItem.create({
          userId: user.uid,
          cardId: card._id,
          acquiredAt: new Date(),
          source: { type: 'quiz', sessionId: session._id }
        })
      }
      inventoryCount = await InventoryItem.countDocuments({ userId: user.uid })
    }

    const imageUrl = card ? cloudinaryUrl(card.publicId) : null

    // Update mastery
    await addMasteryXp(user.uid, { members: card ? [card.member] : [], eras: card ? [card.era] : [], xp: Math.max(1, correctCount) })

    // Advance quests and leaderboard
    await advanceQuest(user.uid, 'score', correctCount)
    await advanceQuest(user.uid, 'correct', correctCount)

    // Weekly leaderboard: keep max score for user in current week
    const periodKey = (() => {
      const now = new Date()
      const tmp = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
      const dayNum = tmp.getUTCDay() || 7
      tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum)
      const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
      const weekNo = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
      return `weekly-${tmp.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`
    })()
    await LeaderboardEntry.findOneAndUpdate(
      { periodKey, userId: user.uid },
      { $max: { score: correctCount }, $set: { displayName: user.name || user.email || 'User', avatarUrl: user.picture || '' }, $setOnInsert: { updatedAt: new Date() } },
      { upsert: true }
    )

    return NextResponse.json({
      xp,
      correctCount,
      reward: card ? {
        cardId: card._id.toString(),
        rarity,
        member: card.member,
        era: card.era,
        set: card.set,
        publicId: card.publicId,
        imageUrl: imageUrl as any
      } : null,
      rarityWeightsUsed: rarityWeightsUsed,
      pityApplied,
      inventoryCount,
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
    console.error('Quiz complete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


