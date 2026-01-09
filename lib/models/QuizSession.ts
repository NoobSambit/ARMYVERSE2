import mongoose from 'mongoose'

const quizSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true }],
  answers: { type: [Number], default: [] },
  seed: { type: String, required: true },
  score: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'expired'], default: 'active', index: true },
  mode: { type: String, enum: ['ranked', 'practice', 'quest'], default: 'ranked', index: true },
  poolSlug: { type: String, default: '' },
  expiresAt: { type: Date, index: true, required: true },
  createdAt: { type: Date, default: Date.now }
})

// TTL index on expiresAt (0 seconds)
quizSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
quizSessionSchema.index({ userId: 1, status: 1 })

if (mongoose.models.QuizSession) {
  delete mongoose.models.QuizSession
}

export const QuizSession = mongoose.model('QuizSession', quizSessionSchema)
