#!/usr/bin/env node
'use strict'

// Import Questions into MongoDB (JSON array or NDJSON)
// Usage:
//   MONGODB_URI="mongodb+srv://..." node scripts/import-questions.js --file /path/to/questions.json [--db armyverse] [--collection questions] [--batch 1000] [--dry-run]

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const crypto = require('crypto')
const { MongoClient } = require('mongodb')

function parseArgs(argv) {
  const args = { file: '', db: 'armyverse', collection: 'questions', batch: 1000, dryRun: false }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--file') args.file = argv[++i]
    else if (a === '--db') args.db = argv[++i]
    else if (a === '--collection') args.collection = argv[++i]
    else if (a === '--batch') args.batch = parseInt(argv[++i], 10)
    else if (a === '--dry-run') args.dryRun = true
  }
  if (!args.file) throw new Error('Missing --file path')
  if (!Number.isFinite(args.batch) || args.batch <= 0) args.batch = 1000
  return args
}

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function makeHash(doc) {
  const loc = (doc.locale || 'en').trim()
  const question = (doc.question || '').trim()
  const correct = Array.isArray(doc.choices) && typeof doc.answerIndex === 'number' && doc.choices[doc.answerIndex]
    ? String(doc.choices[doc.answerIndex]).trim()
    : ''
  const base = JSON.stringify({ q: question, a: correct, loc })
  return sha256Hex(base).slice(0, 24)
}

function validate(doc) {
  const errors = []
  if (!doc || typeof doc !== 'object') {
    errors.push('not an object')
    return { ok: false, errors }
  }
  if (!doc.question || typeof doc.question !== 'string' || !doc.question.trim()) errors.push('question:string required')
  if (!Array.isArray(doc.choices) || doc.choices.length !== 4 || !doc.choices.every(c => typeof c === 'string')) errors.push('choices:array[4]string required')
  if (typeof doc.answerIndex !== 'number' || doc.answerIndex < 0 || doc.answerIndex > 3) errors.push('answerIndex:0-3 required')
  const allowed = new Set(['easy','medium','hard'])
  if (!doc.difficulty || !allowed.has(doc.difficulty)) errors.push('difficulty: easy|medium|hard required')
  if (doc.tags && (!Array.isArray(doc.tags) || !doc.tags.every(t => typeof t === 'string'))) errors.push('tags:string[] invalid')
  if (doc.explanation && typeof doc.explanation !== 'string') errors.push('explanation:string invalid')
  if (doc.status && !new Set(['approved','retired','pending']).has(doc.status)) errors.push('status invalid')
  return { ok: errors.length === 0, errors }
}

async function ensureIndex(col) {
  await col.createIndex({ hash: 1 }, { unique: true })
}

function redactUri(uri) {
  try {
    const u = new URL(uri)
    if (u.password) u.password = '***'
    return u.toString()
  } catch {
    return uri.slice(0, 16) + '...'
  }
}

async function processArray(col, items, opts) {
  const stats = { readCount: 0, validCount: 0, upsertedCount: 0, matchedCount: 0, skippedInvalid: 0 }
  const errors = []
  const batchOps = []

  for (const raw of items) {
    stats.readCount++
    const doc = normalize(raw)
    const { ok, errors: errs } = validate(doc)
    if (!ok) {
      stats.skippedInvalid++
      if (errors.length < 10) errors.push({ index: stats.readCount, errors: errs })
      continue
    }
    stats.validCount++
    if (!doc.hash) doc.hash = makeHash(doc)
    if (opts.dryRun) continue
    batchOps.push({ updateOne: { filter: { hash: doc.hash }, update: { $setOnInsert: doc }, upsert: true } })
    if (batchOps.length >= opts.batch) {
      const res = await col.bulkWrite(batchOps, { ordered: false })
      stats.upsertedCount += res.upsertedCount || 0
      stats.matchedCount += res.matchedCount || 0
      batchOps.length = 0
    }
  }
  if (!opts.dryRun && batchOps.length) {
    const res = await col.bulkWrite(batchOps, { ordered: false })
    stats.upsertedCount += res.upsertedCount || 0
    stats.matchedCount += res.matchedCount || 0
  }
  return { stats, errors }
}

function normalize(doc) {
  const out = { ...doc }
  if (!out.locale) out.locale = 'en'
  if (!out.source) out.source = 'perplexity'
  if (!out.status) out.status = 'approved'
  return out
}

async function processNdjson(col, file, opts) {
  const stats = { readCount: 0, validCount: 0, upsertedCount: 0, matchedCount: 0, skippedInvalid: 0 }
  const errors = []
  const batchOps = []

  const rl = readline.createInterface({ input: fs.createReadStream(file) })
  for await (const line of rl) {
    const trimmed = line.trim()
    if (!trimmed) continue
    let raw
    try { raw = JSON.parse(trimmed) } catch (e) {
      stats.readCount++
      stats.skippedInvalid++
      if (errors.length < 10) errors.push({ index: stats.readCount, errors: ['invalid json'] })
      continue
    }
    stats.readCount++
    const doc = normalize(raw)
    const { ok, errors: errs } = validate(doc)
    if (!ok) {
      stats.skippedInvalid++
      if (errors.length < 10) errors.push({ index: stats.readCount, errors: errs })
      continue
    }
    stats.validCount++
    if (!doc.hash) doc.hash = makeHash(doc)
    if (opts.dryRun) continue
    batchOps.push({ updateOne: { filter: { hash: doc.hash }, update: { $setOnInsert: doc }, upsert: true } })
    if (batchOps.length >= opts.batch) {
      const res = await col.bulkWrite(batchOps, { ordered: false })
      stats.upsertedCount += res.upsertedCount || 0
      stats.matchedCount += res.matchedCount || 0
      batchOps.length = 0
    }
  }
  if (!opts.dryRun && batchOps.length) {
    const res = await col.bulkWrite(batchOps, { ordered: false })
    stats.upsertedCount += res.upsertedCount || 0
    stats.matchedCount += res.matchedCount || 0
  }
  return { stats, errors }
}

async function main() {
  try {
    const args = parseArgs(process.argv)
    const file = args.file
    if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`)

    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      console.error('MONGODB_URI is not set. Please set it in your environment.')
      process.exit(2)
    }

    const truncated = redactUri(mongoUri)
    console.log(`Connecting to MongoDB: ${truncated}`)
    const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 8000 })
    await client.connect()
    const db = client.db(args.db)
    const col = db.collection(args.collection)
    await ensureIndex(col)

    const content = fs.readFileSync(file, 'utf8')
    const isArray = content.trim().startsWith('[') && content.trim().endsWith(']')

    let result
    if (isArray) {
      let arr
      try { arr = JSON.parse(content) } catch (e) {
        throw new Error('Invalid JSON array input')
      }
      if (!Array.isArray(arr)) throw new Error('Expected JSON array')
      result = await processArray(col, arr, args)
    } else {
      result = await processNdjson(col, file, args)
    }

    console.log('Import stats:', JSON.stringify(result.stats, null, 2))
    if (result.errors.length) {
      console.log('First errors:', JSON.stringify(result.errors, null, 2))
    }

    await client.close()
    process.exit(0)
  } catch (err) {
    console.error('Import failed:', err && err.message ? err.message : err)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}


