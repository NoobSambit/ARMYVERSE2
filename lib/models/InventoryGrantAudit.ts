import mongoose from 'mongoose'

const inventoryGrantAuditSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizSession' },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photocard', required: true },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], required: true },
  seed: { type: String, required: true },
  poolSlug: { type: String, default: '' },
  reason: { type: String, enum: ['quiz', 'craft', 'quest', 'admin'], required: true },
  anomaly: { type: Boolean, default: false },
  xp: { type: Number, default: undefined },
  createdAt: { type: Date, default: Date.now }
})

inventoryGrantAuditSchema.index({ userId: 1, createdAt: -1 })

export const InventoryGrantAudit = mongoose.models.InventoryGrantAudit || mongoose.model('InventoryGrantAudit', inventoryGrantAuditSchema)


