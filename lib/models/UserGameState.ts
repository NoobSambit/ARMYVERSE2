import mongoose from 'mongoose'

export interface IUserGameState {
  _id: mongoose.Types.ObjectId
  userId: string
  pity: {
    sinceEpic: number
    sinceLegendary: number
  }
  streak: {
    dailyCount: number
    weeklyCount: number
    lastPlayAt: Date | null
    lastDailyQuestCompletionAt: Date | null
    lastWeeklyQuestCompletionAt: Date | null
  }
  dust: number
  xp: number
  level: number
  limits: {
    quizStartsToday: number
    dateKey: string
  }
  badges: {
    lastDailyStreakMilestone: number
    lastWeeklyStreakMilestone: number
    dailyStreakMilestoneCount: number // How many times reached 10-day streak
    weeklyStreakMilestoneCount: number // How many times reached 10-week streak
  }
  // Track unique streaks that have been rewarded (prevents re-earning after breaking streak)
  earnedStreaks: {
    daily: number[] // Array of unique daily streak counts that were rewarded
    weekly: number[] // Array of unique weekly streak counts that were rewarded
    highestDaily: number // Highest daily streak ever achieved
    highestWeekly: number // Highest weekly streak ever achieved
  }
}

const userGameStateSchema = new mongoose.Schema<IUserGameState>({
  userId: { type: String, required: true, unique: true },
  pity: {
    sinceEpic: { type: Number, default: 0 },
    sinceLegendary: { type: Number, default: 0 }
  },
  streak: {
    dailyCount: { type: Number, default: 0 },
    weeklyCount: { type: Number, default: 0 },
    lastPlayAt: { type: Date, default: null },
    lastDailyQuestCompletionAt: { type: Date, default: null },
    lastWeeklyQuestCompletionAt: { type: Date, default: null }
  },
  dust: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  limits: {
    quizStartsToday: { type: Number, default: 0 },
    dateKey: { type: String, default: '' }
  },
  badges: {
    lastDailyStreakMilestone: { type: Number, default: 0 },
    lastWeeklyStreakMilestone: { type: Number, default: 0 },
    dailyStreakMilestoneCount: { type: Number, default: 0 },
    weeklyStreakMilestoneCount: { type: Number, default: 0 }
  },
  earnedStreaks: {
    daily: { type: [Number], default: [] },
    weekly: { type: [Number], default: [] },
    highestDaily: { type: Number, default: 0 },
    highestWeekly: { type: Number, default: 0 }
  }
})

// Note: userId field already has unique: true above, so no need for explicit index

export const UserGameState = mongoose.models.UserGameState || mongoose.model<IUserGameState>('UserGameState', userGameStateSchema)


