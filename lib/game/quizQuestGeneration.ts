import { QuestDefinition } from '@/lib/models/QuestDefinition'
import { dailyKey, weeklyKey } from './quests'

type QuizGenOptions = {
  force?: boolean
  seedSuffix?: string
}

async function deactivateOldQuizQuests(period: 'daily' | 'weekly', keepCode: string) {
  await QuestDefinition.updateMany(
    { period, goalType: 'quiz:complete', code: { $ne: keepCode }, active: true },
    { $set: { active: false } }
  )
}

/**
 * Ensure daily quiz quests exist (2 quizzes)
 */
export async function ensureDailyQuizQuests(options: QuizGenOptions = {}): Promise<void> {
  const seedSuffix = options.seedSuffix || (options.force ? `manual-${Date.now()}` : '')
  const codeSuffix = options.force ? `-manual-${seedSuffix || Date.now()}` : ''
  const code = `quiz_daily_${dailyKey()}${codeSuffix}`

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

  await deactivateOldQuizQuests('daily', code)
}

/**
 * Ensure weekly quiz quests exist (10 quizzes)
 */
export async function ensureWeeklyQuizQuests(options: QuizGenOptions = {}): Promise<void> {
  const seedSuffix = options.seedSuffix || (options.force ? `manual-${Date.now()}` : '')
  const codeSuffix = options.force ? `-manual-${seedSuffix || Date.now()}` : ''
  const code = `quiz_weekly_${weeklyKey()}${codeSuffix}`

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

  await deactivateOldQuizQuests('weekly', code)
}
