import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  choices: {
    type: [String],
    required: true,
    validate: {
      validator: (v: string[]) => Array.isArray(v) && v.length >= 2,
      message: 'At least two choices are required'
    }
  },
  answerIndex: { type: Number, required: true, min: 0 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  tags: [{ type: String, trim: true }],
  locale: { type: String, default: 'en', index: true },
  source: { type: String, trim: true, default: '' },
  explanation: { type: String, trim: true },
  hash: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ['approved', 'retired', 'pending'], default: 'approved', index: true },
  createdAt: { type: Date, default: Date.now }
})

// Note: hash field already has unique: true above, so no need for explicit index
questionSchema.index({ status: 1, locale: 1, difficulty: 1 })

export const Question = mongoose.models.Question || mongoose.model('Question', questionSchema)


