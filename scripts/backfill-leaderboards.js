#!/usr/bin/env node

/**
 * Backfill all-time leaderboard entries from UserGameState.
 * Run after deploying leaderboard updates.
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI not found in environment variables')
  process.exit(1)
}

const LEVEL_XP_BASE = 100
const LEVEL_XP_GROWTH = 1.25

function xpForLevel(level) {
  const safeLevel = Math.max(1, Math.floor(level))
  const raw = LEVEL_XP_BASE * Math.pow(LEVEL_XP_GROWTH, safeLevel - 1)
  return Math.max(1, Math.round(raw))
}

function levelForXp(totalXp) {
  const safeXp = Math.max(0, Math.floor(totalXp || 0))
  let level = 1
  let remaining = safeXp
  let xpForNext = xpForLevel(level)

  while (remaining >= xpForNext) {
    remaining -= xpForNext
    level += 1
    xpForNext = xpForLevel(level)
  }

  return level
}

const userGameStateSchema = new mongoose.Schema({
  userId: String,
  xp: Number
}, { strict: false })

const userSchema = new mongoose.Schema({
  firebaseUid: String,
  profile: {
    displayName: String,
    avatarUrl: String
  },
  name: String,
  image: String
}, { strict: false })

const leaderboardEntrySchema = new mongoose.Schema({
  periodKey: String,
  userId: String,
  score: Number,
  level: Number,
  displayName: String,
  avatarUrl: String,
  periodStart: Date,
  periodEnd: Date,
  stats: Object,
  updatedAt: Date
}, { strict: false })

const UserGameState = mongoose.model('UserGameState', userGameStateSchema)
const User = mongoose.model('User', userSchema)
const LeaderboardEntry = mongoose.model('LeaderboardEntry', leaderboardEntrySchema)

async function backfillAlltimeLeaderboard() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB\n')

    const periodKey = 'alltime'
    const periodStart = new Date(Date.UTC(2020, 0, 1))
    const periodEnd = new Date(Date.UTC(2100, 0, 1))
    const cursor = UserGameState.find({}, { userId: 1, xp: 1 }).cursor()
    let scanned = 0
    let updated = 0

    for await (const state of cursor) {
      scanned += 1
      const totalXp = state.xp || 0
      const level = levelForXp(totalXp)
      const userDoc = await User.findOne({ firebaseUid: state.userId }).lean()
      const displayName = userDoc?.profile?.displayName || userDoc?.name || 'User'
      const avatarUrl = userDoc?.profile?.avatarUrl || userDoc?.image || ''

      await LeaderboardEntry.updateOne(
        { periodKey, userId: state.userId },
        {
          $set: {
            score: totalXp,
            level,
            displayName,
            avatarUrl,
            periodStart,
            periodEnd,
            updatedAt: new Date()
          },
          $setOnInsert: {
            stats: { quizzesPlayed: 0, questionsCorrect: 0, totalQuestions: 0 }
          }
        },
        { upsert: true }
      )
      updated += 1
    }

    console.log('Backfill Summary:')
    console.log(`   Scanned: ${scanned}`)
    console.log(`   Updated: ${updated}`)
  } catch (error) {
    console.error('ERROR: Backfill failed:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('\nDatabase connection closed')
  }
}

console.log('Starting leaderboard backfill...\n')
backfillAlltimeLeaderboard()
