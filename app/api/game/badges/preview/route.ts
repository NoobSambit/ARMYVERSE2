import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * GET /api/game/badges/preview
 *
 * Public endpoint to fetch all available badges for the landing page showcase
 */
export async function GET() {
  try {
    // Return all available badges with their image paths
    const badges = [
      // Daily Completion Badges
      {
        code: 'daily_completion',
        name: 'Daily Devotion',
        category: 'completion',
        imageUrl: '/badges/completion/daily-completion.png',
        tier: 5,
        maxTier: 10,
        description: 'Complete all daily quests'
      },
      // Weekly Completion Badges
      {
        code: 'weekly_completion',
        name: 'Weekly Warrior',
        category: 'completion',
        imageUrl: '/badges/completion/weekly-completion.png',
        tier: 3,
        maxTier: 10,
        description: 'Complete all weekly quests'
      },
      // Daily Streak Badges
      {
        code: 'streak_1',
        name: 'Day Streak I',
        category: 'daily-streak',
        imageUrl: '/badges/daily-streak/streak-1.png',
        tier: 1,
        maxTier: 10,
        description: '1 day login streak'
      },
      {
        code: 'streak_2',
        name: 'Day Streak II',
        category: 'daily-streak',
        imageUrl: '/badges/daily-streak/streak-2.png',
        tier: 2,
        maxTier: 10,
        description: '2 day login streak'
      },
      {
        code: 'streak_3',
        name: 'Day Streak III',
        category: 'daily-streak',
        imageUrl: '/badges/daily-streak/streak-3.png',
        tier: 3,
        maxTier: 10,
        description: '3 day login streak'
      },
      {
        code: 'streak_5',
        name: 'Day Streak V',
        category: 'daily-streak',
        imageUrl: '/badges/daily-streak/streak-5.png',
        tier: 5,
        maxTier: 10,
        description: '5 day login streak'
      },
      {
        code: 'streak_7',
        name: 'Week Warrior',
        category: 'daily-streak',
        imageUrl: '/badges/daily-streak/streak-10.png',
        tier: 7,
        maxTier: 10,
        description: '7 day login streak'
      },
      // Daily Milestone Badges
      {
        code: 'milestone_1',
        name: 'Milestone I',
        category: 'daily-milestone',
        imageUrl: '/badges/daily-milestone/milestone-1.png',
        tier: 1,
        maxTier: 5,
        description: 'Complete 10 daily quests'
      },
      {
        code: 'milestone_2',
        name: 'Milestone II',
        category: 'daily-milestone',
        imageUrl: '/badges/daily-milestone/milestone-2.png',
        tier: 2,
        maxTier: 5,
        description: 'Complete 25 daily quests'
      },
      {
        code: 'milestone_3',
        name: 'Milestone III',
        category: 'daily-milestone',
        imageUrl: '/badges/daily-milestone/milestone-3.png',
        tier: 3,
        maxTier: 5,
        description: 'Complete 50 daily quests'
      },
      {
        code: 'milestone_4',
        name: 'Milestone IV',
        category: 'daily-milestone',
        imageUrl: '/badges/daily-milestone/milestone-4.png',
        tier: 4,
        maxTier: 5,
        description: 'Complete 75 daily quests'
      },
      {
        code: 'milestone_5',
        name: 'Milestone V',
        category: 'daily-milestone',
        imageUrl: '/badges/daily-milestone/milestone-5.png',
        tier: 5,
        maxTier: 5,
        description: 'Complete 100 daily quests'
      },
    ]

    return NextResponse.json({
      badges,
      total: badges.length
    })
  } catch (error) {
    console.error('Preview badges fetch error:', error)
    return NextResponse.json({ badges: [], total: 0 })
  }
}
