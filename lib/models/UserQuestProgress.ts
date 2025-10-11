import mongoose from 'mongoose'

const userQuestProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  code: { type: String, required: true },
  periodKey: { type: String, required: true },
  progress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  claimed: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
})

userQuestProgressSchema.index({ userId: 1, code: 1, periodKey: 1 }, { unique: true })

export const UserQuestProgress = mongoose.models.UserQuestProgress || mongoose.model('UserQuestProgress', userQuestProgressSchema)


