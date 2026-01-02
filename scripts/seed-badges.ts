import * as dotenv from 'dotenv'
import { connect } from '@/lib/db/mongoose'
import { Badge } from '@/lib/models/Badge'

// Load environment variables
dotenv.config({ path: '.env.local' })

const INITIAL_BADGES = [
  {
    code: 'streak_5',
    name: '5 Day Streak',
    description: 'Complete quests for 5 consecutive days',
    icon: '🔥',
    type: 'streak',
    criteria: { streakDays: 5 },
    rarity: 'common',
    active: true
  },
  {
    code: 'streak_10',
    name: '10 Day Streak',
    description: 'Complete quests for 10 consecutive days',
    icon: '🔥🔥',
    type: 'streak',
    criteria: { streakDays: 10 },
    rarity: 'rare',
    active: true
  },
  {
    code: 'streak_30',
    name: '30 Day Streak',
    description: 'Complete quests for 30 consecutive days',
    icon: '🔥🔥🔥',
    type: 'streak',
    criteria: { streakDays: 30 },
    rarity: 'epic',
    active: true
  },
  {
    code: 'first_streaming_quest',
    name: 'First Streams',
    description: 'Complete your first streaming quest',
    icon: '🎵',
    type: 'achievement',
    criteria: { questType: 'streaming', threshold: 1 },
    rarity: 'common',
    active: true
  }
]

async function seedBadges() {
  await connect()

  for (const badge of INITIAL_BADGES) {
    await Badge.findOneAndUpdate(
      { code: badge.code },
      badge,
      { upsert: true }
    )
  }

  console.log('Badges seeded successfully')
  process.exit(0)
}

seedBadges()
