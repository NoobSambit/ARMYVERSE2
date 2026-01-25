#!/usr/bin/env node

/**
 * Fixes the users.email index to allow multiple accounts without email.
 * - Unsets email when it's null
 * - Drops existing email index (if present)
 * - Creates a unique partial index on email (string only)
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables')
  process.exit(1)
}

async function fixEmailIndex() {
  console.log('🔌 Connecting to MongoDB...')
  await mongoose.connect(MONGODB_URI)

  const collection = mongoose.connection.collection('users')

  console.log('🧹 Unsetting null emails...')
  const unsetResult = await collection.updateMany(
    { email: null },
    { $unset: { email: '' } }
  )
  console.log(`✅ Removed null email from ${unsetResult.modifiedCount} user(s)`)

  const indexes = await collection.indexes()
  const emailIndex = indexes.find((index) => index.key && index.key.email === 1)

  if (emailIndex) {
    console.log(`🧨 Dropping existing email index: ${emailIndex.name}`)
    await collection.dropIndex(emailIndex.name)
  } else {
    console.log('ℹ️  No existing email index found')
  }

  console.log('🛠️  Creating unique partial email index...')
  await collection.createIndex(
    { email: 1 },
    { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
  )

  console.log('✅ Email index updated successfully')
}

fixEmailIndex()
  .catch((error) => {
    console.error('❌ Failed to fix email index:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  })
