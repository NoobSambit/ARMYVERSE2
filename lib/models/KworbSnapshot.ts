import mongoose, { Schema } from 'mongoose'

const KworbSnapshotSchema = new Schema({
  dateKey: { type: String, index: true },
  songs: [{}],
  songsByArtist: [{}],
  albumsByArtist: [{}],
  albums: [{}],
  daily200: [{}],
  artistsAllTime: [{}],
  monthlyListeners: [{}]
}, { timestamps: true })

export default mongoose.models.KworbSnapshot || mongoose.model('KworbSnapshot', KworbSnapshotSchema)


