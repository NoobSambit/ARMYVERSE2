import * as dotenv from 'dotenv'
import { connect } from '@/lib/db/mongoose'
import { ensureDailyStreamingQuests } from '@/lib/game/streamingQuestSelection'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function generateDailyQuests() {
  await connect()
  await ensureDailyStreamingQuests()
  console.log('✅ Daily streaming quests generated successfully')
  process.exit(0)
}

generateDailyQuests()
