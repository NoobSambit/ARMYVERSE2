import mongoose from 'mongoose'

const questDefinitionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  period: { type: String, enum: ['daily', 'weekly'], required: true },
  goalType: { type: String, required: true },
  goalValue: { type: Number, required: true },
  reward: {
    dust: { type: Number, default: 0 },
    ticket: {
      rarityMin: { type: String, enum: ['rare', 'epic', 'legendary'], default: undefined }
    }
  },
  active: { type: Boolean, default: true }
})

questDefinitionSchema.index({ code: 1 }, { unique: true })

export const QuestDefinition = mongoose.models.QuestDefinition || mongoose.model('QuestDefinition', questDefinitionSchema)


