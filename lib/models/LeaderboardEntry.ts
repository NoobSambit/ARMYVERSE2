import mongoose from 'mongoose'

const leaderboardEntrySchema = new mongoose.Schema({
  periodKey: { type: String, required: true },
  userId: { type: String, required: true },
  score: { type: Number, default: 0 },
  displayName: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
})

leaderboardEntrySchema.index({ periodKey: 1, userId: 1 }, { unique: true })
leaderboardEntrySchema.index({ periodKey: 1, score: -1 })

export const LeaderboardEntry = mongoose.models.LeaderboardEntry || mongoose.model('LeaderboardEntry', leaderboardEntrySchema)


