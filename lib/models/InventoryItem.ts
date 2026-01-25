import mongoose from 'mongoose'

const inventoryItemSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photocard', required: true },
  acquiredAt: { type: Date, default: Date.now, index: true },
  source: {
    type: {
      type: String,
      enum: [
        'quiz',
        'quest_streaming',
        'quest_quiz',
        'craft',
        'event',
        'mastery_level',
        'daily_completion',
        'weekly_completion',
        'daily_milestone',
        'weekly_milestone',
        'borarush'
      ],
      required: true,
      default: 'quiz'
    },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizSession' },
    questCode: { type: String },
    totalStreak: { type: Number },
    milestoneNumber: { type: Number },
    masteryKind: { type: String },
    masteryKey: { type: String },
    masteryLevel: { type: Number }
  }
})

inventoryItemSchema.index({ userId: 1, acquiredAt: -1 })

export const InventoryItem = mongoose.models.InventoryItem || mongoose.model('InventoryItem', inventoryItemSchema)
