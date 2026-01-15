import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { connect } from '@/lib/db/mongoose'
import { UserBadge } from '@/lib/models/UserBadge'
import mongoose from 'mongoose'

async function migrateUserBadgeIndex() {
    console.log('🔌 Connecting to database...')
    await connect()

    // Get the collection
    const collection = mongoose.connection.collection('userbadges')

    console.log('🔍 Checking existing indexes...')
    const indexes = await collection.indexes()
    console.log('Current indexes:', indexes.map(i => i.name))

    // Find the unique index on userId + badgeId
    // Usually named "userId_1_badgeId_1"
    const uniqueIndexName = 'userId_1_badgeId_1'
    const hasIndex = indexes.some(i => i.name === uniqueIndexName)

    if (hasIndex) {
        console.log(`🗑️ Dropping index: ${uniqueIndexName}...`)
        try {
            await collection.dropIndex(uniqueIndexName)
            console.log('✅ Index dropped successfully.')
        } catch (e: any) {
            console.error('❌ Failed to drop index:', e.message)
        }
    } else {
        console.log(`ℹ️ Index ${uniqueIndexName} not found. skipping drop.`)
    }

    // Drop any potential partial indexes I might have created in previous run
    const indexesToClean = ['unique_standard_badge', 'unique_completion_badge_streak']
    for (const idxName of indexesToClean) {
        if (indexes.some(i => i.name === idxName)) {
            console.log(`🗑️ Dropping intermediate index: ${idxName}...`)
            await collection.dropIndex(idxName)
        }
    }

    console.log('🛠️ Creating new unified index...')

    // Unified Unique Index
    // This handles both cases:
    // 1. Standard Badges: completionStreakCount is null/missing. 
    //    Index key: { userId, badgeId, null }. Unique constraint prevents duplicates.
    // 2. Completion Badges: completionStreakCount is present (e.g. 5, 6).
    //    Index key: { userId, badgeId, 5 }. Unique constraint allows (badgeId, 6) but prevents (badgeId, 5) again.
    try {
        await collection.createIndex(
            { userId: 1, badgeId: 1, 'metadata.completionStreakCount': 1 },
            {
                unique: true,
                name: 'unique_user_badge_streak_aware',
                background: true
            }
        )
        console.log('✅ Created unique_user_badge_streak_aware index')
    } catch (e: any) {
        console.error('❌ Failed to create unique_user_badge_streak_aware index:', e.message)
    }

    console.log('\n✨ Database migration completed')
    process.exit(0)
}

migrateUserBadgeIndex().catch(err => {
    console.error('Fatal error during migration:', err)
    process.exit(1)
})
