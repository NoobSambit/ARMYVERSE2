import mongoose from 'mongoose'

const photocardSchema = new mongoose.Schema({
  member: { type: String, required: true, trim: true },
  era: { type: String, required: true, trim: true },
  set: { type: String, required: true, trim: true, index: true },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], required: true, index: true },
  publicId: { type: String, required: true, trim: true },
  attributes: [{ type: String, trim: true }],
  isLimited: { type: Boolean, default: false },
  craftCostDust: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now }
})

photocardSchema.index({ set: 1, rarity: 1 })

export const Photocard = mongoose.models.Photocard || mongoose.model('Photocard', photocardSchema)


