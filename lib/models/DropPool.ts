import mongoose from 'mongoose'

const dropPoolSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  window: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  weights: {
    common: { type: Number, required: true },
    rare: { type: Number, required: true },
    epic: { type: Number, required: true },
    legendary: { type: Number, required: true }
  },
  featured: {
    rarityBoost: {
      epic: { type: Number, default: 0 },
      legendary: { type: Number, default: 0 }
    },
    set: { type: String, default: undefined },
    members: [{ type: String }]
  },
  active: { type: Boolean, default: true }
})

dropPoolSchema.index({ slug: 1 }, { unique: true })
dropPoolSchema.index({ 'window.start': 1, 'window.end': 1, active: 1 })

export const DropPool = mongoose.models.DropPool || mongoose.model('DropPool', dropPoolSchema)


