#!/usr/bin/env node
'use strict'

/**
 * Reset all mastery progress (and reward ledger) to align with new question-based mastery logic.
 * Uses MONGODB_URI (can be set in .env.local). Drops masteryprogresses and masteryrewardledgers.
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI not set. Set it (e.g., in .env.local) before running.')
    process.exit(1)
  }

  console.log('Connecting to MongoDB...')
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000, family: 4 })

  const conn = mongoose.connection
  const progressCol = conn.collection('masteryprogresses')
  const ledgerCol = conn.collection('masteryrewardledgers')

  console.log('Clearing masteryprogresses...')
  const progRes = await progressCol.deleteMany({})
  console.log(`Deleted ${progRes.deletedCount} mastery progress docs`)

  console.log('Clearing masteryrewardledgers...')
  const ledRes = await ledgerCol.deleteMany({})
  console.log(`Deleted ${ledRes.deletedCount} mastery reward ledger docs`)

  await mongoose.disconnect()
  console.log('Done.')
}

main().catch((err) => {
  console.error('Reset failed:', err)
  process.exit(1)
})
