import mongoose, { Schema } from 'mongoose'

const YouTubeKworbSnapshotSchema = new Schema({
  dateKey: { type: String, index: true },
  artistGroups: [{}], // Array of YouTubeArtistGroup
}, { timestamps: true })

export default mongoose.models.YouTubeKworbSnapshot || 
  mongoose.model('YouTubeKworbSnapshot', YouTubeKworbSnapshotSchema)
