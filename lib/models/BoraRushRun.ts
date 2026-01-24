import mongoose from 'mongoose'

export interface IBoraRushRun {
  _id: mongoose.Types.ObjectId
  userId: string
  runId: string
  turns: number
  xpAwarded: number
  cardId?: mongoose.Types.ObjectId
  duplicate?: boolean
  dustAwarded?: number
  playerCount: number
  winnerId: number
  completedAt: Date
}

const boraRushRunSchema = new mongoose.Schema<IBoraRushRun>({
  userId: { type: String, required: true, index: true },
  runId: { type: String, required: true, unique: true },
  turns: { type: Number, required: true },
  xpAwarded: { type: Number, required: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photocard' },
  duplicate: { type: Boolean, default: false },
  dustAwarded: { type: Number, default: 0 },
  playerCount: { type: Number, required: true, default: 1 },
  winnerId: { type: Number, required: true, default: 1 },
  completedAt: { type: Date, required: true }
}, {
  timestamps: true
})

boraRushRunSchema.index({ userId: 1, completedAt: 1 })

export const BoraRushRun = mongoose.models.BoraRushRun || mongoose.model<IBoraRushRun>('BoraRushRun', boraRushRunSchema)
