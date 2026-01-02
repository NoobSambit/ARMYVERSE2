import { QuestDefinition } from '@/lib/models/QuestDefinition'
import { dailyKey, weeklyKey } from './quests'

/**
 * Ensure daily quiz quests exist (2 quizzes)
 */
export async function ensureDailyQuizQuests(): Promise<void> {
  const code = `quiz_daily_${dailyKey()}`

  const existing = await QuestDefinition.findOne({ code })

  if (!existing) {
    await QuestDefinition.create({
      code,
      title: 'Daily Quiz Quest',
      period: 'daily',
      goalType: 'quiz:complete',
      goalValue: 2, // 2 quizzes
      reward: {
        dust: 40,
        xp: 15
      },
      active: true
    })
  }
}

/**
 * Ensure weekly quiz quests exist (10 quizzes)
 */
export async function ensureWeeklyQuizQuests(): Promise<void> {
  const code = `quiz_weekly_${weeklyKey()}`

  const existing = await QuestDefinition.findOne({ code })

  if (!existing) {
    await QuestDefinition.create({
      code,
      title: 'Weekly Quiz Quest',
      period: 'weekly',
      goalType: 'quiz:complete',
      goalValue: 10, // 10 quizzes
      reward: {
        dust: 250,
        xp: 100
      },
      active: true
    })
  }
}
