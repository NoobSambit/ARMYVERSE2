import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth, getUserFromAuth } from '@/lib/auth/verify'
import { QuizSession } from '@/lib/models/QuizSession'
import { Question } from '@/lib/models/Question'
import { InventoryItem } from '@/lib/models/InventoryItem'
import { rollQuizRarityAndCardByXp, type Rarity } from '@/lib/game/dropTable'
import { scoreWithBreakdown, Difficulty } from '@/lib/game/scoring'
import { url as cloudinaryUrl } from '@/lib/cloudinary'
// import { Photocard } from '@/lib/models/Photocard' // Not currently used
import { addMasteryXp } from '@/lib/game/mastery'
import { advanceQuest } from '@/lib/game/quests'
import { LeaderboardEntry } from '@/lib/models/LeaderboardEntry'
import { awardBalances, duplicateDustForRarity } from '@/lib/game/rewards'

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
    const user = await verifyAuth(request)
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

    const questionIds = (session.questionIds as unknown[]).map((id) => String(id))
    const answers = input.data.answers
    if (answers.length !== questionIds.length) {
      console.warn('Mismatched answers length', { expected: questionIds.length, got: answers.length, sessionId: session._id.toString(), userId: user.uid })
      return NextResponse.json({ error: 'Mismatched answers length' }, { status: 400 })
    }

    type LeanQuestion = {
      _id: string
      question: string
      choices: string[]
      answerIndex: number
      difficulty: Difficulty
      members?: string[]
      eras?: string[]
    }

    const questions = await Question.find(
      { _id: { $in: questionIds } },
      { question: 1, choices: 1, answerIndex: 1, difficulty: 1, members: 1, eras: 1 }
    ).lean<LeanQuestion[]>()
    const qMap = new Map<string, {
      id: string
      question: string
      choices: string[]
      answerIndex: number
      difficulty: Difficulty
      members?: string[]
      eras?: string[]
    }>()
    for (const q of questions) {
      const id = q._id.toString()
      qMap.set(id, {
        id,
        question: q.question,
        choices: q.choices,
        answerIndex: q.answerIndex,
        difficulty: q.difficulty,
        members: q.members,
        eras: q.eras
      })
    }
    const ordered = questionIds.map((id) => qMap.get(id) || { id, question: '', choices: [], answerIndex: -1, difficulty: 'easy' as Difficulty, members: [], eras: [] })

    const scored = scoreWithBreakdown({
      questions: ordered,
      userAnswers: answers
    })
    const correctCount = scored.correctCount
    const xp = scored.xp

    // Mark session completed BEFORE revealing answers in the response
    session.status = 'completed'
    session.answers = answers
    session.score = correctCount
    await session.save()

    // Collect mastery targets from correctly answered questions with per-question XP
    const perMemberXp = new Map<string, number>()
    const perEraXp = new Map<string, number>()
    const ALL_MEMBERS = ['RM', 'JIN', 'SUGA', 'J-HOPE', 'JIMIN', 'V', 'JUNGKOOK']
    for (let i = 0; i < ordered.length; i++) {
      const q = ordered[i]
      const ua = answers[i]
      const correct = ua >= 0 && ua === q.answerIndex
      if (!correct) continue
      const xpAward = scored.breakdown[i]?.xpAward || 0
      if (xpAward <= 0) continue

      const qMembers = Array.isArray(q.members) ? q.members : []
      const normalized = qMembers.map((m: string) => (m || '').trim()).filter(Boolean)
      const upper = normalized.map((m) => m.toUpperCase())
      const hasAll = ALL_MEMBERS.every((m) => upper.includes(m))

      if (hasAll) {
        perMemberXp.set('OT7', (perMemberXp.get('OT7') || 0) + xpAward)
      } else {
        for (const m of normalized) {
          if (m.toUpperCase() === 'OT7') continue
          perMemberXp.set(m, (perMemberXp.get(m) || 0) + xpAward)
        }
      }

      const qEras = Array.isArray(q.eras) ? q.eras : []
      for (const e of qEras) {
        if (!e) continue
        perEraXp.set(String(e), (perEraXp.get(String(e)) || 0) + xpAward)
      }
    }

    // Persist base completion and XP before reward gating
    await awardBalances(user.uid, { xp })

    // Reward roll
    let rarity: Rarity | null = null
    let card: {
      _id: string
      member?: string
      era?: string
      set?: string
      rarity: Rarity
      publicId: string
    } | null = null
    let rarityWeightsUsed: Record<Rarity, number> | null = null
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
        ? {
            _id: String(roll.card._id),
            member: roll.card.member,
            era: roll.card.era,
            set: roll.card.set,
            rarity: roll.card.rarity as Rarity,
            publicId: roll.card.publicId
          }
        : null
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
    let duplicate = false
    let dustAwarded = 0
    if (card) {
      const existingOwned = await InventoryItem.findOne({ userId: user.uid, cardId: card._id })
      if (existingOwned) {
        duplicate = true
        dustAwarded = duplicateDustForRarity(rarity)
        await awardBalances(user.uid, { dust: dustAwarded })
      } else {
        const existingForSession = await InventoryItem.findOne({ userId: user.uid, 'source.sessionId': session._id })
        if (!existingForSession) {
          await InventoryItem.create({
            userId: user.uid,
            cardId: card._id,
            acquiredAt: new Date(),
            source: { type: 'quiz', sessionId: session._id }
          })
        }
      }
      inventoryCount = await InventoryItem.countDocuments({ userId: user.uid })
    }

    const imageUrl = card ? cloudinaryUrl(card.publicId) : null

    // Update mastery only from correctly answered questions, preserving per-question XP per track
    const masteryUpdates: Promise<unknown>[] = []
    for (const [member, incXp] of Array.from(perMemberXp.entries())) {
      if (incXp > 0) masteryUpdates.push(addMasteryXp(user.uid, { members: [member], eras: [], xp: incXp }))
    }
    for (const [era, incXp] of Array.from(perEraXp.entries())) {
      if (incXp > 0) masteryUpdates.push(addMasteryXp(user.uid, { members: [], eras: [era], xp: incXp }))
    }
    if (masteryUpdates.length) {
      await Promise.all(masteryUpdates)
    }

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
    
    // Get user profile data from MongoDB for leaderboard
    // Ensure User model is registered before leaderboard upsert
    await import('@/lib/models/User')
    type UserProfileDoc = { profile?: { displayName?: string; avatarUrl?: string } }
    const userDoc = await getUserFromAuth(user) as UserProfileDoc | null
    const profileDisplayName = userDoc?.profile?.displayName || user.displayName || user.username || 'User'
    const profileAvatarUrl = userDoc?.profile?.avatarUrl || user.photoURL || ''
    
    console.log('[Quiz Complete] Updating leaderboard:', {
      userId: user.uid,
      displayName: profileDisplayName,
      avatarUrl: profileAvatarUrl,
      score: correctCount,
      hasProfile: !!userDoc?.profile
    })
    
    await LeaderboardEntry.findOneAndUpdate(
      { periodKey, userId: user.uid },
      { 
        $max: { score: correctCount }, 
        $set: {
          displayName: profileDisplayName, 
          avatarUrl: profileAvatarUrl,
          updatedAt: new Date()
        }
      },
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
        imageUrl
      } : null,
      duplicate,
      dustAwarded,
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
