import mongoose from 'mongoose'

const masteryLevelRewardLedgerSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  kind: { type: String, enum: ['member', 'era'], required: true },
  key: { type: String, required: true },
  level: { type: Number, required: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photocard' },
  awardedAt: { type: Date, default: Date.now }
})

masteryLevelRewardLedgerSchema.index(
  { userId: 1, kind: 1, key: 1, level: 1 },
  { unique: true }
)
masteryLevelRewardLedgerSchema.index({ userId: 1, awardedAt: -1 })

export const MasteryLevelRewardLedger =
  mongoose.models.MasteryLevelRewardLedger ||
  mongoose.model('MasteryLevelRewardLedger', masteryLevelRewardLedgerSchema)
