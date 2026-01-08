import mongoose from 'mongoose'

const masteryRewardLedgerSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  kind: { type: String, enum: ['member', 'era'], required: true },
  key: { type: String, required: true },
  milestone: { type: Number, required: true },
  rewards: {
    xp: { type: Number, default: 0 },
    dust: { type: Number, default: 0 }
  },
  source: { type: String, default: 'mastery_claim' },
  createdAt: { type: Date, default: Date.now }
})

masteryRewardLedgerSchema.index({ userId: 1, kind: 1, key: 1, milestone: 1 }, { unique: true })

export const MasteryRewardLedger = mongoose.models.MasteryRewardLedger || mongoose.model('MasteryRewardLedger', masteryRewardLedgerSchema)
