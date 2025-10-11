/**
 * Boraverse Photocard Sync (Cloudinary → MongoDB)
 *
 * What it does:
 * - Scans Cloudinary under a folder prefix (e.g., "armyverse/cards" or an album path).
 * - Derives era/set/member from the folder path.
 * - Assigns rarity using deterministic weighted-random (common-heavy) unless filename hints override it.
 * - Upserts into MongoDB collection "photocards" by publicId (unique); safe to re-run; no duplicates.
 *
 * Rarity policy (default weights):
 * - common: 70%, rare: 22%, epic: 7%, legendary: 1%
 * - Deterministic: sha256(publicId + BORAVERSE_RARITY_SALT) → [0,1) → weighted pick.
 * - Filename hints override: "legend", "epic", "rare", "common", "foil" (foil → epic).
 *
 * Env vars (required):
 * - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * - MONGODB_URI
 *
 * Env vars (optional):
 * - BORAVERSE_RARITY_SALT (default "boraverse-v1")
 * - BORAVERSE_RARITY_WEIGHTS='{"common":70,"rare":22,"epic":7,"legendary":1}'
 *
 * Usage examples:
 * - Import a single album:
 *   node scripts/sync-photocards-from-cloudinary.js --prefix "armyverse/cards/2cool4skool"
 *
 * - Import all albums:
 *   node scripts/sync-photocards-from-cloudinary.js --prefix "armyverse/cards"
 *
 * - Preview only (no writes):
 *   node scripts/sync-photocards-from-cloudinary.js --prefix "armyverse/cards/2cool4skool" --dry-run
 *
 * - Recompute rarity for existing docs (use sparingly):
 *   node scripts/sync-photocards-from-cloudinary.js --prefix "armyverse/cards" --update-existing
 *
 * Outputs:
 * - "Found N assets. Upserted X, Matched Y, Skipped Z"
 */

// Load env from .env.local if present
require('dotenv').config({ path: '.env.local' })

const crypto = require('crypto')
const { v2: cloudinary } = require('cloudinary')
const mongoose = require('mongoose')

// --- CLI ARGS ---
function parseArgs(argv) {
  const out = { prefix: null, match: null, 'dry-run': false, 'update-existing': false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--prefix' && i + 1 < argv.length) {
      out.prefix = argv[++i]
    } else if (a === '--match' && i + 1 < argv.length) {
      out.match = argv[++i]
    } else if (a === '--dry-run' || a === '-d') {
      out['dry-run'] = true
    } else if (a === '--update-existing') {
      out['update-existing'] = true
    }
  }
  return out
}

const args = parseArgs(process.argv.slice(2))
const PREFIX = args.prefix
const DRY_RUN = !!args['dry-run']
const UPDATE_EXISTING = !!args['update-existing']
const MATCH_FILTER = args.match ? String(args.match) : null

if (!PREFIX) {
  console.error('❌ Missing required --prefix argument (e.g., --prefix "armyverse/cards" )')
  process.exit(1)
}

// --- ENV CHECKS ---
const requiredEnvs = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'MONGODB_URI']
const missing = requiredEnvs.filter((k) => !process.env[k] || !String(process.env[k]).trim())
if (missing.length) {
  console.error(`❌ Missing required env vars: ${missing.join(', ')}`)
  process.exit(1)
}

// --- CONFIGURE CLOUDINARY ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
  api_key: process.env.CLOUDINARY_API_KEY.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET.trim()
})

// --- PHOTOCARD MODEL (mirror of lib/models/Photocard.ts minimal fields) ---
const photocardSchema = new mongoose.Schema({
  member: { type: String, required: true, trim: true },
  era: { type: String, required: true, trim: true },
  set: { type: String, required: true, trim: true, index: true },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], required: true, index: true },
  publicId: { type: String, required: true, trim: true, unique: true },
  attributes: [{ type: String, trim: true }],
  isLimited: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
})
photocardSchema.index({ set: 1, rarity: 1 })
const Photocard = mongoose.models.Photocard || mongoose.model('Photocard', photocardSchema)

// --- MEMBER MAP ---
const MEMBER_MAP = {
  rm: 'RM',
  jin: 'Jin',
  suga: 'Suga',
  jhope: 'J-Hope',
  jimin: 'Jimin',
  v: 'V',
  jungkook: 'Jungkook',
  ot7: 'OT7'
}

// --- RARITY UTILS ---
const DEFAULT_WEIGHTS = { common: 70, rare: 22, epic: 7, legendary: 1 }
const SALT = (process.env.BORAVERSE_RARITY_SALT || 'boraverse-v1').trim()

function parseWeights() {
  const raw = process.env.BORAVERSE_RARITY_WEIGHTS
  if (!raw) return DEFAULT_WEIGHTS
  try {
    const w = JSON.parse(raw)
    const keys = ['common', 'rare', 'epic', 'legendary']
    for (const k of keys) {
      if (typeof w[k] !== 'number' || !isFinite(w[k]) || w[k] < 0) return DEFAULT_WEIGHTS
    }
    const total = keys.reduce((s, k) => s + w[k], 0)
    if (total <= 0) return DEFAULT_WEIGHTS
    return w
  } catch {
    return DEFAULT_WEIGHTS
  }
}

function filenameRarityHint(filename) {
  const f = filename.toLowerCase()
  if (f.includes('legend')) return 'legendary'
  if (f.includes('epic')) return 'epic'
  if (f.includes('foil')) return 'epic'
  if (f.includes('rare')) return 'rare'
  if (f.includes('common')) return 'common'
  return null
}

function hashToUnitInterval(str) {
  const hex = crypto.createHash('sha256').update(str).digest('hex')
  // Use first 13 hex chars (~52 bits) to stay within JS Number safe integer
  const slice = hex.slice(0, 13)
  const int = parseInt(slice, 16)
  const max = Math.pow(16, slice.length) - 1
  const u = int / max
  return u >= 1 ? 0.999999999999 : u
}

function pickRarityDeterministic(publicId, weights) {
  const hint = filenameRarityHint(publicId.split('/').pop() || publicId)
  if (hint) return hint
  const u = hashToUnitInterval(publicId + '|' + SALT)
  const entries = [
    ['common', weights.common],
    ['rare', weights.rare],
    ['epic', weights.epic],
    ['legendary', weights.legendary]
  ]
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let t = 0
  const threshold = u * total
  for (const [key, w] of entries) {
    t += w
    if (threshold < t) return key
  }
  return 'common'
}

// --- PATH PARSING ---
const EXPECTED_PREFIX = 'armyverse/cards'

function titleCaseAlbum(slug) {
  // Insert spaces between digit-letter and letter-digit boundaries, replace dashes/underscores, then title-case
  const spaced = slug
    .replace(/[-_]+/g, ' ')
    .replace(/([0-9])([a-zA-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])([0-9])/g, '$1 $2')
  return spaced
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function parseFromPublicId(publicId) {
  // Expect: armyverse/cards/<album>/<member>/<filename>
  const parts = publicId.split('/')
  const idx = parts.findIndex((p) => p === 'armyverse')
  // allow arbitrary prefix as long as it includes armyverse/cards
  const i = parts.indexOf('cards')
  if (idx === -1 || i === -1 || i !== idx + 1) return null
  if (parts.length < i + 4) return null
  const album = parts[i + 1]
  const memberSlug = parts[i + 2]
  const filename = parts[parts.length - 1]
  const member = MEMBER_MAP[memberSlug]
  if (!member) return null
  const era = titleCaseAlbum(album)
  const set = era
  return { album, member, era, set, filename }
}

// --- MATCH FILTER ---
function fileMatches(filename) {
  if (!MATCH_FILTER) return true
  try {
    // Try regex first: /.../
    if (MATCH_FILTER.startsWith('/') && MATCH_FILTER.endsWith('/')) {
      const pattern = new RegExp(MATCH_FILTER.slice(1, -1))
      return pattern.test(filename)
    }
    // simple glob: * and ?
    const esc = MATCH_FILTER.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')
    const rx = new RegExp('^' + esc + '$', 'i')
    return rx.test(filename)
  } catch {
    return true
  }
}

// --- MAIN ---
;(async () => {
  const maskedMongo = (process.env.MONGODB_URI || '').replace(/:\/\/([^:@/]+):([^@/]+)@/, '://$1:****@')
  console.log(`🚀 Photocard sync starting (prefix="${PREFIX}", dryRun=${DRY_RUN}, updateExisting=${UPDATE_EXISTING})`)
  console.log(`🔐 MongoDB: ${maskedMongo}`)

  // Connect Mongo
  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(process.env.MONGODB_URI, { family: 4 })
  } catch (err) {
    console.error('❌ Failed to connect MongoDB:', err.message)
    process.exit(1)
  }

  // Ensure unique index on publicId
  try {
    await Photocard.collection.createIndex({ publicId: 1 }, { unique: true })
    await Photocard.collection.createIndex({ set: 1, rarity: 1 })
  } catch (e) {
    // ignore existing index errors
  }

  // Cloudinary search and paging
  let nextCursor = undefined
  let found = 0
  let upserted = 0
  let matched = 0
  let skipped = 0

  const weights = parseWeights()
  const pickRarity = pickRarityDeterministic

  const planned = []

  try {
    do {
      const expression = `folder:${PREFIX}/*`
      let query = cloudinary.search.expression(expression).max_results(500)
      if (nextCursor) {
        query = query.next_cursor(nextCursor)
      }
      const res = await query.execute()

      const assets = Array.isArray(res.resources) ? res.resources : []
      nextCursor = res.next_cursor

      for (const asset of assets) {
        // Use public_id (no extension) and folder path
        const publicId = asset.public_id
        if (!publicId || !publicId.includes(EXPECTED_PREFIX)) {
          skipped++
          continue
        }

        const parsed = parseFromPublicId(publicId)
        if (!parsed) {
          skipped++
          continue
        }
        const { member, era, set, filename } = parsed

        if (!fileMatches(filename)) {
          skipped++
          continue
        }

        const rarity = pickRarity(publicId, weights)

        found++

        const doc = {
          member,
          era,
          set,
          rarity,
          publicId,
          attributes: [],
          isLimited: false
        }

        planned.push(doc)

        if (DRY_RUN) continue

        const filter = { publicId }
        const update = UPDATE_EXISTING
          ? { $set: { member, era, set, rarity, attributes: [], isLimited: false }, $setOnInsert: { createdAt: new Date() } }
          : { $setOnInsert: { ...doc, createdAt: new Date() } }

        const result = await Photocard.updateOne(filter, update, { upsert: true })
        if (result.upsertedCount && result.upsertedCount > 0) {
          upserted += result.upsertedCount
        } else if (result.matchedCount && result.matchedCount > 0) {
          matched += result.matchedCount
        }
      }
    } while (nextCursor)
  } catch (err) {
    console.error('❌ Cloudinary search failed:', err.message)
    await mongoose.disconnect().catch(() => {})
    process.exit(1)
  }

  if (DRY_RUN) {
    console.log(`📝 Dry-run: showing up to first 20 planned upserts (of ${planned.length})`)
    for (const item of planned.slice(0, 20)) {
      console.log(` → ${item.publicId} | ${item.member} | ${item.era} | ${item.set} | ${item.rarity}`)
    }
  }

  console.log(`✅ Found ${found} assets. Upserted ${upserted}, Matched ${matched}, Skipped ${skipped}.`)

  await mongoose.disconnect().catch(() => {})
  process.exit(0)
})()


