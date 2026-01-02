import mongoose from 'mongoose'

export interface IBadge {
  _id: mongoose.Types.ObjectId
  code: string
  name: string
  description: string
  icon: string
  type: 'streak' | 'achievement' | 'event' | 'quest' | 'completion'
  criteria?: {
    streakDays?: number
    streakWeeks?: number
    questPeriod?: 'daily' | 'weekly'
    questType?: 'streaming' | 'quiz' | 'any'
    threshold?: number
  }
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  active: boolean
  createdAt: Date
}

const badgeSchema = new mongoose.Schema<IBadge>({
  code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '🏆' },
  type: { type: String, enum: ['streak', 'achievement', 'event', 'quest', 'completion'], required: true },
  criteria: {
    streakDays: { type: Number },
    streakWeeks: { type: Number },
    questPeriod: { type: String, enum: ['daily', 'weekly'] },
    questType: { type: String, enum: ['streaming', 'quiz', 'any'] },
    threshold: { type: Number }
  },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
})

badgeSchema.index({ code: 1 }, { unique: true })
badgeSchema.index({ type: 1, active: 1 })

export const Badge = mongoose.models.Badge || mongoose.model<IBadge>('Badge', badgeSchema)
