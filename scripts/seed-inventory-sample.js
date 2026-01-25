#!/usr/bin/env node
'use strict'

/*
 * Seed inventory with a large, varied sample for UI testing.
 * - Drops legacy "photocards" collection (old Cloudinary sync) by default.
 * - Clears inventory for a specific user (default).
 * - Inserts a target count of inventory items pulled from fandom_gallery_images.
 *
 * Usage:
 *   node scripts/seed-inventory-sample.js --user <uid> --count 1000
 *   node scripts/seed-inventory-sample.js --email you@example.com
 *   node scripts/seed-inventory-sample.js --username yourname --keep-inventory
 *   node scripts/seed-inventory-sample.js --dry-run
 */

require('dotenv').config({ path: '.env.local' })

const mongoose = require('mongoose')

function parseArgs(argv) {
  const out = {
    user: null,
    email: null,
    username: null,
    count: 1000,
    'dry-run': false,
    'keep-inventory': false,
    'drop-legacy': true,
    'legacy-collection': 'photocards'
  }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--user' && i + 1 < argv.length) out.user = argv[++i]
    else if (arg === '--email' && i + 1 < argv.length) out.email = argv[++i]
    else if (arg === '--username' && i + 1 < argv.length) out.username = argv[++i]
    else if (arg === '--count' && i + 1 < argv.length) out.count = Number(argv[++i])
    else if (arg === '--dry-run' || arg === '-d') out['dry-run'] = true
    else if (arg === '--keep-inventory') out['keep-inventory'] = true
    else if (arg === '--drop-legacy') out['drop-legacy'] = true
    else if (arg === '--no-drop-legacy') out['drop-legacy'] = false
    else if (arg === '--legacy-collection' && i + 1 < argv.length) out['legacy-collection'] = argv[++i]
  }
  return out
}

const args = parseArgs(process.argv.slice(2))
const COUNT = Number.isFinite(args.count) && args.count > 0 ? Math.floor(args.count) : 1000
const DRY_RUN = !!args['dry-run']
const KEEP_INVENTORY = !!args['keep-inventory']
const DROP_LEGACY = !!args['drop-legacy']
const LEGACY_COLLECTION = String(args['legacy-collection'] || 'photocards')

if (!process.env.MONGODB_URI || !String(process.env.MONGODB_URI).trim()) {
  console.error('ERROR: Missing MONGODB_URI in environment.')
  process.exit(1)
}

mongoose.set('strictQuery', true)

const photocardSchema = new mongoose.Schema({
  categoryPath: String,
  subcategoryPath: String
}, { strict: false })
const Photocard = mongoose.models.SeedPhotocard || mongoose.model('SeedPhotocard', photocardSchema, 'fandom_gallery_images')

const inventorySchema = new mongoose.Schema({
  userId: { type: String, index: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, index: true },
  acquiredAt: { type: Date, default: Date.now },
  source: { type: Object, default: {} }
}, { strict: false })
const InventoryItem = mongoose.models.SeedInventoryItem || mongoose.model('SeedInventoryItem', inventorySchema, 'inventoryitems')

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  firebaseUid: String
}, { strict: false })
const User = mongoose.models.SeedUser || mongoose.model('SeedUser', userSchema, 'users')

const SOURCE_WEIGHTS = [
  { type: 'quiz', weight: 30 },
  { type: 'quest_streaming', weight: 14 },
  { type: 'quest_quiz', weight: 14 },
  { type: 'craft', weight: 10 },
  { type: 'event', weight: 10 },
  { type: 'mastery_level', weight: 6 },
  { type: 'daily_completion', weight: 8 },
  { type: 'weekly_completion', weight: 8 },
  { type: 'daily_milestone', weight: 3 },
  { type: 'weekly_milestone', weight: 3 }
]

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickSourceType() {
  const total = SOURCE_WEIGHTS.reduce((sum, entry) => sum + entry.weight, 0)
  const roll = Math.random() * total
  let acc = 0
  for (const entry of SOURCE_WEIGHTS) {
    acc += entry.weight
    if (roll <= acc) return entry.type
  }
  return 'quiz'
}

function randomQuestCode(type) {
  if (type === 'quest_streaming') {
    const options = ['stream:spotify:daily', 'stream:spotify:weekly', 'stream:youtube:daily', 'stream:youtube:weekly']
    return options[randomInt(0, options.length - 1)]
  }
  const options = ['quiz:daily', 'quiz:weekly', 'quiz:bonus']
  return options[randomInt(0, options.length - 1)]
}

function buildSource() {
  const type = pickSourceType()
  if (type === 'quiz') {
    return { type, sessionId: new mongoose.Types.ObjectId() }
  }
  if (type === 'quest_streaming' || type === 'quest_quiz') {
    return { type, questCode: randomQuestCode(type) }
  }
  if (type === 'mastery_level') {
    return {
      type,
      masteryKind: Math.random() < 0.5 ? 'member' : 'era',
      masteryKey: Math.random() < 0.5 ? 'RM' : 'Wings',
      masteryLevel: randomInt(1, 100)
    }
  }
  if (type === 'daily_completion' || type === 'weekly_completion') {
    return {
      type,
      totalStreak: randomInt(1, 50)
    }
  }
  if (type === 'daily_milestone' || type === 'weekly_milestone') {
    const milestoneNumber = randomInt(1, 5)
    return {
      type,
      totalStreak: milestoneNumber * 10,
      milestoneNumber
    }
  }
  if (type === 'event') {
    return { type, eventCode: 'seasonal_drop' }
  }
  return { type }
}

function randomAcquiredAt() {
  const isRecent = Math.random() < 0.35
  const daysBack = isRecent ? randomInt(0, 6) : randomInt(7, 60)
  const hours = randomInt(0, 23)
  const minutes = randomInt(0, 59)
  const ms = (((daysBack * 24 + hours) * 60 + minutes) * 60 + randomInt(0, 59)) * 1000
  return new Date(Date.now() - ms)
}

function selectCards(cards, count) {
  const target = Math.min(count, cards.length)
  const byCategory = new Map()
  for (const card of cards) {
    const key = card.categoryPath || 'unknown'
    if (!byCategory.has(key)) byCategory.set(key, [])
    byCategory.get(key).push(card)
  }
  const buckets = Array.from(byCategory.values()).map((list) => shuffle(list))
  const selected = []
  let active = buckets.filter((bucket) => bucket.length > 0)
  while (selected.length < target && active.length > 0) {
    for (const bucket of active) {
      if (!bucket.length) continue
      selected.push(bucket.pop())
      if (selected.length >= target) break
    }
    active = active.filter((bucket) => bucket.length > 0)
  }

  if (selected.length < count) {
    const pool = selected.length ? selected : cards
    while (selected.length < count) {
      selected.push(pool[randomInt(0, pool.length - 1)])
    }
  }

  return selected
}

async function resolveUserId() {
  if (args.user) return String(args.user)
  if (args.email) {
    const match = await User.findOne({ email: String(args.email).toLowerCase() }).lean()
    if (!match) throw new Error(`No user found for email ${args.email}`)
    return match.firebaseUid || String(match._id)
  }
  if (args.username) {
    const match = await User.findOne({ username: String(args.username).toLowerCase() }).lean()
    if (!match) throw new Error(`No user found for username ${args.username}`)
    return match.firebaseUid || String(match._id)
  }

  const users = await User.find({}, { firebaseUid: 1 }).lean()
  if (users.length === 1) {
    const only = users[0]
    return only.firebaseUid || String(only._id)
  }
  throw new Error('Multiple users found. Please pass --user, --email, or --username.')
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    family: 4,
    heartbeatFrequencyMS: 5000
  })

  const db = mongoose.connection.db
  const userId = await resolveUserId()

  if (DROP_LEGACY) {
    const legacy = await db.listCollections({ name: LEGACY_COLLECTION }).toArray()
    if (legacy.length) {
      if (DRY_RUN) {
        console.log(`[dry-run] Would drop legacy collection: ${LEGACY_COLLECTION}`)
      } else {
        await db.dropCollection(LEGACY_COLLECTION)
        console.log(`Dropped legacy collection: ${LEGACY_COLLECTION}`)
      }
    }
  }

  if (!KEEP_INVENTORY) {
    const result = await InventoryItem.deleteMany({ userId })
    console.log(`Cleared inventory for user ${userId}: ${result.deletedCount} removed`)
  }

  const cards = await Photocard.find({}, { _id: 1, categoryPath: 1, subcategoryPath: 1 }).lean()
  if (!cards.length) {
    throw new Error('No cards found in fandom_gallery_images. Run the scraper first.')
  }

  const selected = selectCards(cards, COUNT)
  const docs = selected.map((card) => ({
    userId,
    cardId: card._id,
    acquiredAt: randomAcquiredAt(),
    source: buildSource()
  }))

  if (DRY_RUN) {
    console.log(`[dry-run] Would insert ${docs.length} inventory items for ${userId}`)
  } else {
    await InventoryItem.insertMany(docs, { ordered: false })
    const total = await InventoryItem.countDocuments({ userId })
    console.log(`Inserted ${docs.length} items for ${userId}. Total now: ${total}`)
  }

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
