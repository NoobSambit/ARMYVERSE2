import mongoose from 'mongoose'

export interface IUserBadge {
  _id: mongoose.Types.ObjectId
  userId: string
  badgeId: mongoose.Types.ObjectId
  earnedAt: Date
  metadata?: {
    streakCount?: number
    questCode?: string
  }
}

const userBadgeSchema = new mongoose.Schema<IUserBadge>({
  userId: { type: String, required: true, index: true },
  badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true, index: true },
  earnedAt: { type: Date, default: Date.now, index: true },
  metadata: {
    streakCount: { type: Number },
    questCode: { type: String }
  }
})

// Compound index: prevent duplicate badge awards
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true })
userBadgeSchema.index({ userId: 1, earnedAt: -1 })

export const UserBadge = mongoose.models.UserBadge || mongoose.model<IUserBadge>('UserBadge', userBadgeSchema)
