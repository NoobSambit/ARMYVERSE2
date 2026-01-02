import * as dotenv from 'dotenv'
import { connect } from '@/lib/db/mongoose'
import { ensureWeeklyStreamingQuests } from '@/lib/game/streamingQuestSelection'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function generateWeeklyQuests() {
  await connect()
  await ensureWeeklyStreamingQuests()
  console.log('✅ Weekly streaming quests generated successfully')
  process.exit(0)
}

generateWeeklyQuests()
