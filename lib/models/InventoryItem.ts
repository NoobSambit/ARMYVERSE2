import mongoose from 'mongoose'

const inventoryItemSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photocard', required: true },
  acquiredAt: { type: Date, default: Date.now, index: true },
  source: {
    type: {
      type: String,
      enum: ['quiz'],
      required: true,
      default: 'quiz'
    },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizSession' }
  }
})

inventoryItemSchema.index({ userId: 1, acquiredAt: -1 })

export const InventoryItem = mongoose.models.InventoryItem || mongoose.model('InventoryItem', inventoryItemSchema)


