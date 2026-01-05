import mongoose from 'mongoose'

const userQuestProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  code: { type: String, required: true },
  periodKey: { type: String, required: true },
  progress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  claimed: { type: Boolean, default: false },
  streamingBaseline: {
    tracks: [{
      trackName: { type: String },
      artistName: { type: String },
      initialCount: { type: Number }
    }],
    timestamp: { type: Date }
  },
  // Track individual progress for each track/album target
  trackProgress: {
    type: Map,
    of: Number,
    default: () => new Map()
  },
  updatedAt: { type: Date, default: Date.now }
})

userQuestProgressSchema.index({ userId: 1, code: 1, periodKey: 1 }, { unique: true })

export const UserQuestProgress = mongoose.models.UserQuestProgress || mongoose.model('UserQuestProgress', userQuestProgressSchema)


