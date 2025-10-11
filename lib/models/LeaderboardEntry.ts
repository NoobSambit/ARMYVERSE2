import mongoose from 'mongoose'

export interface ILeaderboardEntry {
  _id: mongoose.Types.ObjectId
  periodKey: string
  userId: string
  score: number
  displayName: string
  avatarUrl: string
  updatedAt: Date
}

const leaderboardEntrySchema = new mongoose.Schema<ILeaderboardEntry>({
  periodKey: { type: String, required: true },
  userId: { type: String, required: true },
  score: { type: Number, default: 0 },
  displayName: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
})

leaderboardEntrySchema.index({ periodKey: 1, userId: 1 }, { unique: true })
leaderboardEntrySchema.index({ periodKey: 1, score: -1 })

export const LeaderboardEntry = mongoose.models.LeaderboardEntry || mongoose.model<ILeaderboardEntry>('LeaderboardEntry', leaderboardEntrySchema)


