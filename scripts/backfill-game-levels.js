#!/usr/bin/env node

/**
 * Backfill user game state levels based on total XP.
 * Run after deploying the new leveling curve.
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
  xp: Number,
  level: Number
}, { strict: false })

const UserGameState = mongoose.model('UserGameState', userGameStateSchema)

async function backfillLevels() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB\n')

    const cursor = UserGameState.find({}, { xp: 1, level: 1 }).cursor()
    let scanned = 0
    let updated = 0

    for await (const doc of cursor) {
      scanned += 1
      const xp = doc.xp || 0
      const nextLevel = levelForXp(xp)
      if (doc.level !== nextLevel) {
        await UserGameState.updateOne({ _id: doc._id }, { $set: { level: nextLevel } })
        updated += 1
      }
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

console.log('Starting level backfill...\n')
backfillLevels()
