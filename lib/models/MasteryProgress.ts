import mongoose from 'mongoose'

const masteryProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  kind: { type: String, enum: ['member', 'era'], required: true },
  key: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  lastUpdatedAt: { type: Date, default: Date.now }
})

masteryProgressSchema.index({ userId: 1, kind: 1, key: 1 }, { unique: true })

export const MasteryProgress = mongoose.models.MasteryProgress || mongoose.model('MasteryProgress', masteryProgressSchema)


