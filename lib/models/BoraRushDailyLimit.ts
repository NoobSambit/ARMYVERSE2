import mongoose from 'mongoose'

export interface IBoraRushDailyLimit {
  _id: mongoose.Types.ObjectId
  userId: string
  dateKey: string
  xpAwards: number
  cardAwards: number
  createdAt?: Date
  updatedAt?: Date
}

const boraRushDailyLimitSchema = new mongoose.Schema<IBoraRushDailyLimit>({
  userId: { type: String, required: true, index: true },
  dateKey: { type: String, required: true },
  xpAwards: { type: Number, default: 0 },
  cardAwards: { type: Number, default: 0 }
}, {
  timestamps: true
})

boraRushDailyLimitSchema.index({ userId: 1, dateKey: 1 }, { unique: true })

export const BoraRushDailyLimit = mongoose.models.BoraRushDailyLimit || mongoose.model<IBoraRushDailyLimit>('BoraRushDailyLimit', boraRushDailyLimitSchema)
