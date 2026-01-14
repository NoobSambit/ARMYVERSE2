import mongoose from 'mongoose'

export interface ILeaderboardEntry {
  _id: mongoose.Types.ObjectId
  periodKey: string
  userId: string
  score: number
  level: number
  stats: {
    quizzesPlayed: number
    questionsCorrect: number
    totalQuestions: number
  }
  previousRank?: number
  rank?: number
  displayName: string
  avatarUrl: string
  lastPlayedAt?: Date
  periodStart: Date
  periodEnd: Date
  updatedAt: Date
}

const leaderboardEntrySchema = new mongoose.Schema<ILeaderboardEntry>({
  periodKey: { type: String, required: true },
  userId: { type: String, required: true },
  score: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  stats: {
    quizzesPlayed: { type: Number, default: 0 },
    questionsCorrect: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 }
  },
  previousRank: { type: Number },
  rank: { type: Number },
  displayName: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  lastPlayedAt: { type: Date },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

// Compound indexes for optimal query performance on free tier
leaderboardEntrySchema.index({ periodKey: 1, userId: 1 }, { unique: true })
leaderboardEntrySchema.index({ periodKey: 1, score: -1 })
leaderboardEntrySchema.index({ periodKey: 1, rank: 1 })

export const LeaderboardEntry = mongoose.models.LeaderboardEntry || mongoose.model<ILeaderboardEntry>('LeaderboardEntry', leaderboardEntrySchema)


