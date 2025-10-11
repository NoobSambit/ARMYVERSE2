import mongoose from 'mongoose'

const userGameStateSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  pity: {
    sinceEpic: { type: Number, default: 0 },
    sinceLegendary: { type: Number, default: 0 }
  },
  streak: {
    dailyCount: { type: Number, default: 0 },
    lastPlayAt: { type: Date, default: null }
  },
  dust: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  limits: {
    quizStartsToday: { type: Number, default: 0 },
    dateKey: { type: String, default: '' }
  }
})

// Note: userId field already has unique: true above, so no need for explicit index

export const UserGameState = mongoose.models.UserGameState || mongoose.model('UserGameState', userGameStateSchema)


