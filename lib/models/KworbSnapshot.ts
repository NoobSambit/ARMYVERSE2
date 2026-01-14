import mongoose, { Schema } from 'mongoose'

const KworbSnapshotSchema = new Schema({
  dateKey: { type: String, index: true },
  songs: [{}],
  songsByArtist: [{}],
  albumsByArtist: [{}],
  albums: [{}],
  daily200: [{}],
  artistsAllTime: [{}],
  monthlyListeners: [{}],
  artistMetadata: [{}]
}, { timestamps: true })

// Compound index for faster latest queries
KworbSnapshotSchema.index({ dateKey: -1 })

export default mongoose.models.KworbSnapshot || mongoose.model('KworbSnapshot', KworbSnapshotSchema)


