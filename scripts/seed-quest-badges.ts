import * as dotenv from 'dotenv'
import { connect } from '@/lib/db/mongoose'
import { Badge } from '@/lib/models/Badge'

dotenv.config({ path: '.env.local' })

async function seedQuestBadges() {
  await connect()

  const badges = [
    // Daily Completion Badge
    {
      code: 'daily_completion',
      name: 'Daily Quest Master',
      description: 'Complete all daily quests (streaming + quiz)',
      icon: '⭐',
      type: 'completion',
      criteria: {
        questPeriod: 'daily'
      },
      rarity: 'common',
      active: true
    },

    // Weekly Completion Badge
    {
      code: 'weekly_completion',
      name: 'Weekly Quest Champion',
      description: 'Complete all weekly quests (streaming + quiz)',
      icon: '🌟',
      type: 'completion',
      criteria: {
        questPeriod: 'weekly'
      },
      rarity: 'rare',
      active: true
    },

    // Daily Streak Badges (1-10 days)
    {
      code: 'daily_streak_1',
      name: 'First Step',
      description: 'Complete all daily quests for 1 day',
      icon: '🔥',
      type: 'streak',
      criteria: {
        streakDays: 1,
        questPeriod: 'daily'
      },
      rarity: 'common',
      active: true
    },
    {
      code: 'daily_streak_2',
      name: 'Building Momentum',
      description: 'Complete all daily quests for 2 consecutive days',
      icon: '🔥',
      type: 'streak',
      criteria: {
        streakDays: 2,
        questPeriod: 'daily'
      },
      rarity: 'common',
      active: true
    },
    {
      code: 'daily_streak_3',
      name: 'Three Days Strong',
      description: 'Complete all daily quests for 3 consecutive days',
      icon: '🔥',
      type: 'streak',
      criteria: {
        streakDays: 3,
        questPeriod: 'daily'
      },
      rarity: 'common',
      active: true
    },
    {
      code: 'daily_streak_4',
      name: 'Four Day Fighter',
      description: 'Complete all daily quests for 4 consecutive days',
      icon: '🔥',
      type: 'streak',
      criteria: {
        streakDays: 4,
        questPeriod: 'daily'
      },
      rarity: 'common',
      active: true
    },
    {
      code: 'daily_streak_5',
      name: 'Five Day Fire',
      description: 'Complete all daily quests for 5 consecutive days',
      icon: '🔥🔥',
      type: 'streak',
      criteria: {
        streakDays: 5,
        questPeriod: 'daily'
      },
      rarity: 'rare',
      active: true
    },
    {
      code: 'daily_streak_6',
      name: 'Six Day Soldier',
      description: 'Complete all daily quests for 6 consecutive days',
      icon: '🔥🔥',
      type: 'streak',
      criteria: {
        streakDays: 6,
        questPeriod: 'daily'
      },
      rarity: 'rare',
      active: true
    },
    {
      code: 'daily_streak_7',
      name: 'Week Warrior',
      description: 'Complete all daily quests for 7 consecutive days',
      icon: '🔥🔥',
      type: 'streak',
      criteria: {
        streakDays: 7,
        questPeriod: 'daily'
      },
      rarity: 'rare',
      active: true
    },
    {
      code: 'daily_streak_8',
      name: 'Eight Day Elite',
      description: 'Complete all daily quests for 8 consecutive days',
      icon: '🔥🔥🔥',
      type: 'streak',
      criteria: {
        streakDays: 8,
        questPeriod: 'daily'
      },
      rarity: 'epic',
      active: true
    },
    {
      code: 'daily_streak_9',
      name: 'Nine Day Ninja',
      description: 'Complete all daily quests for 9 consecutive days',
      icon: '🔥🔥🔥',
      type: 'streak',
      criteria: {
        streakDays: 9,
        questPeriod: 'daily'
      },
      rarity: 'epic',
      active: true
    },
    {
      code: 'daily_streak_10',
      name: 'Perfect Ten',
      description: 'Complete all daily quests for 10 consecutive days',
      icon: '🔥🔥🔥🔥',
      type: 'streak',
      criteria: {
        streakDays: 10,
        questPeriod: 'daily'
      },
      rarity: 'legendary',
      active: true
    },

    // Weekly Streak Badges (1-10 weeks)
    {
      code: 'weekly_streak_1',
      name: 'Weekly Beginner',
      description: 'Complete all weekly quests for 1 week',
      icon: '💎',
      type: 'streak',
      criteria: {
        streakWeeks: 1,
        questPeriod: 'weekly'
      },
      rarity: 'common',
      active: true
    },
    {
      code: 'weekly_streak_2',
      name: 'Two Week Wonder',
      description: 'Complete all weekly quests for 2 consecutive weeks',
      icon: '💎',
      type: 'streak',
      criteria: {
        streakWeeks: 2,
        questPeriod: 'weekly'
      },
      rarity: 'common',
      active: true
    },
    {
      code: 'weekly_streak_3',
      name: 'Triple Threat',
      description: 'Complete all weekly quests for 3 consecutive weeks',
      icon: '💎',
      type: 'streak',
      criteria: {
        streakWeeks: 3,
        questPeriod: 'weekly'
      },
      rarity: 'common',
      active: true
    },
    {
      code: 'weekly_streak_4',
      name: 'Monthly Master',
      description: 'Complete all weekly quests for 4 consecutive weeks',
      icon: '💎',
      type: 'streak',
      criteria: {
        streakWeeks: 4,
        questPeriod: 'weekly'
      },
      rarity: 'rare',
      active: true
    },
    {
      code: 'weekly_streak_5',
      name: 'Five Week Force',
      description: 'Complete all weekly quests for 5 consecutive weeks',
      icon: '💎💎',
      type: 'streak',
      criteria: {
        streakWeeks: 5,
        questPeriod: 'weekly'
      },
      rarity: 'rare',
      active: true
    },
    {
      code: 'weekly_streak_6',
      name: 'Six Week Superstar',
      description: 'Complete all weekly quests for 6 consecutive weeks',
      icon: '💎💎',
      type: 'streak',
      criteria: {
        streakWeeks: 6,
        questPeriod: 'weekly'
      },
      rarity: 'rare',
      active: true
    },
    {
      code: 'weekly_streak_7',
      name: 'Seven Week Sensation',
      description: 'Complete all weekly quests for 7 consecutive weeks',
      icon: '💎💎',
      type: 'streak',
      criteria: {
        streakWeeks: 7,
        questPeriod: 'weekly'
      },
      rarity: 'epic',
      active: true
    },
    {
      code: 'weekly_streak_8',
      name: 'Eight Week Extraordinaire',
      description: 'Complete all weekly quests for 8 consecutive weeks',
      icon: '💎💎💎',
      type: 'streak',
      criteria: {
        streakWeeks: 8,
        questPeriod: 'weekly'
      },
      rarity: 'epic',
      active: true
    },
    {
      code: 'weekly_streak_9',
      name: 'Nine Week Noble',
      description: 'Complete all weekly quests for 9 consecutive weeks',
      icon: '💎💎💎',
      type: 'streak',
      criteria: {
        streakWeeks: 9,
        questPeriod: 'weekly'
      },
      rarity: 'epic',
      active: true
    },
    {
      code: 'weekly_streak_10',
      name: 'Ten Week Titan',
      description: 'Complete all weekly quests for 10 consecutive weeks',
      icon: '💎💎💎💎',
      type: 'streak',
      criteria: {
        streakWeeks: 10,
        questPeriod: 'weekly'
      },
      rarity: 'legendary',
      active: true
    },

    // Daily Milestone Badges (Set 2 - awarded at 10, 20, 30, 40, 50 total streaks)
    {
      code: 'daily_milestone_1',
      name: 'Dedicated Devotee',
      description: 'Reached 10-day streak milestone',
      icon: '🏆',
      type: 'achievement',
      criteria: {
        threshold: 10,
        questPeriod: 'daily'
      },
      rarity: 'epic',
      active: true
    },
    {
      code: 'daily_milestone_2',
      name: 'Persistent Pioneer',
      description: 'Reached 20-day streak milestone',
      icon: '🏆🏆',
      type: 'achievement',
      criteria: {
        threshold: 20,
        questPeriod: 'daily'
      },
      rarity: 'epic',
      active: true
    },
    {
      code: 'daily_milestone_3',
      name: 'Consistent Champion',
      description: 'Reached 30-day streak milestone',
      icon: '🏆🏆🏆',
      type: 'achievement',
      criteria: {
        threshold: 30,
        questPeriod: 'daily'
      },
      rarity: 'legendary',
      active: true
    },
    {
      code: 'daily_milestone_4',
      name: 'Legendary Loyalist',
      description: 'Reached 40-day streak milestone',
      icon: '🏆🏆🏆🏆',
      type: 'achievement',
      criteria: {
        threshold: 40,
        questPeriod: 'daily'
      },
      rarity: 'legendary',
      active: true
    },
    {
      code: 'daily_milestone_5',
      name: 'Ultimate ARMY',
      description: 'Reached 50-day streak milestone - Maximum dedication!',
      icon: '👑',
      type: 'achievement',
      criteria: {
        threshold: 50,
        questPeriod: 'daily'
      },
      rarity: 'legendary',
      active: true
    },

    // Weekly Milestone Badges (Set 4 - awarded at 10, 20, 30, 40, 50 total streaks)
    {
      code: 'weekly_milestone_1',
      name: 'Weekly Warrior',
      description: 'Reached 10-week streak milestone',
      icon: '💫',
      type: 'achievement',
      criteria: {
        threshold: 10,
        questPeriod: 'weekly'
      },
      rarity: 'epic',
      active: true
    },
    {
      code: 'weekly_milestone_2',
      name: 'Marathon Master',
      description: 'Reached 20-week streak milestone',
      icon: '💫💫',
      type: 'achievement',
      criteria: {
        threshold: 20,
        questPeriod: 'weekly'
      },
      rarity: 'epic',
      active: true
    },
    {
      code: 'weekly_milestone_3',
      name: 'Endurance Elite',
      description: 'Reached 30-week streak milestone',
      icon: '💫💫💫',
      type: 'achievement',
      criteria: {
        threshold: 30,
        questPeriod: 'weekly'
      },
      rarity: 'legendary',
      active: true
    },
    {
      code: 'weekly_milestone_4',
      name: 'Unstoppable Force',
      description: 'Reached 40-week streak milestone',
      icon: '💫💫💫💫',
      type: 'achievement',
      criteria: {
        threshold: 40,
        questPeriod: 'weekly'
      },
      rarity: 'legendary',
      active: true
    },
    {
      code: 'weekly_milestone_5',
      name: 'Eternal Devotion',
      description: 'Reached 50-week streak milestone - Near one full year!',
      icon: '👑',
      type: 'achievement',
      criteria: {
        threshold: 50,
        questPeriod: 'weekly'
      },
      rarity: 'legendary',
      active: true
    }
  ]

  for (const badgeData of badges) {
    await Badge.findOneAndUpdate(
      { code: badgeData.code },
      badgeData,
      { upsert: true, new: true }
    )
    console.log(`✓ Seeded badge: ${badgeData.code}`)
  }

  console.log(`\n✅ Successfully seeded ${badges.length} quest badges`)
  process.exit(0)
}

seedQuestBadges().catch(err => {
  console.error('Error seeding quest badges:', err)
  process.exit(1)
})
