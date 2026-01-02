import * as dotenv from 'dotenv'
import { connect } from '@/lib/db/mongoose'
import { QuestDefinition } from '@/lib/models/QuestDefinition'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function checkQuests() {
  await connect()

  const quests = await QuestDefinition.find({ active: true }).sort({ createdAt: -1 }).lean()

  console.log('\n📋 Active Quests:', quests.length)
  console.log('=====================================\n')

  for (const quest of quests) {
    console.log(`🎯 ${quest.title}`)
    console.log(`   Code: ${quest.code}`)
    console.log(`   Period: ${quest.period}`)
    console.log(`   Goal: ${quest.goalType} (${quest.goalValue})`)

    if (quest.streamingMeta?.trackTargets) {
      console.log(`   Tracks to stream:`)
      quest.streamingMeta.trackTargets.forEach((t: any) => {
        console.log(`     • ${t.trackName} by ${t.artistName} (${t.count}x)`)
      })
    }

    if (quest.streamingMeta?.albumTargets) {
      console.log(`   Albums to stream:`)
      quest.streamingMeta.albumTargets.forEach((a: any) => {
        console.log(`     • ${a.trackCount} songs from ${a.albumName}`)
      })
    }

    console.log(`   Rewards: ${quest.reward.dust} dust, ${quest.reward.xp || 0} XP`)
    if (quest.reward.ticket) {
      console.log(`   + Photocard (min: ${quest.reward.ticket.rarityMin})`)
    }
    console.log('-------------------------------------\n')
  }

  process.exit(0)
}

checkQuests()
