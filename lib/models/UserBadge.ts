import mongoose from 'mongoose'

export interface IUserBadge {
  _id: mongoose.Types.ObjectId
  userId: string
  badgeId: mongoose.Types.ObjectId
  earnedAt: Date
  metadata?: {
    streakCount?: number
    questCode?: string
    cyclePosition?: number
    milestoneNumber?: number
    completionDate?: string
    completionStreakCount?: number // The streak count when completion badge was earned
    completionType?: 'daily' | 'weekly' // Type of completion badge
  }
}

const userBadgeSchema = new mongoose.Schema<IUserBadge>({
  userId: { type: String, required: true, index: true },
  badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true, index: true },
  earnedAt: { type: Date, default: Date.now, index: true },
  metadata: {
    streakCount: { type: Number },
    questCode: { type: String },
    cyclePosition: { type: Number },
    milestoneNumber: { type: Number },
    completionDate: { type: String },
    completionStreakCount: { type: Number },
    completionType: { type: String, enum: ['daily', 'weekly'] }
  }
})

// Compound index: prevent duplicate badge awards
// Includes metadata.completionStreakCount to allow multiple completion badges (with different streak counts)
// while getting unique constraint for standard badges (where streak count is null)
userBadgeSchema.index({ userId: 1, badgeId: 1, 'metadata.completionStreakCount': 1 }, { unique: true })
userBadgeSchema.index({ userId: 1, earnedAt: -1 })

export const UserBadge = mongoose.models.UserBadge || mongoose.model<IUserBadge>('UserBadge', userBadgeSchema)
