import mongoose from 'mongoose'

export interface IAlbum {
  _id: mongoose.Types.ObjectId
  name: string
  artist: string
  spotifyId: string
  isBTSFamily: boolean
  tracks: Array<{
    name: string
    artist: string
    spotifyId: string
  }>
  trackCount: number
  releaseDate?: Date
  coverImage?: string
  createdAt: Date
  updatedAt: Date
}

const albumSchema = new mongoose.Schema<IAlbum>({
  name: { type: String, required: true },
  artist: { type: String, required: true },
  spotifyId: { type: String, required: true, unique: true, index: true },
  isBTSFamily: { type: Boolean, default: false, index: true },
  tracks: [{
    name: { type: String, required: true },
    artist: { type: String, required: true },
    spotifyId: { type: String, required: true }
  }],
  trackCount: { type: Number, required: true },
  releaseDate: { type: Date },
  coverImage: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Indexes
albumSchema.index({ name: 1, artist: 1 })
albumSchema.index({ isBTSFamily: 1, trackCount: 1 })

export const Album = mongoose.models.Album || mongoose.model<IAlbum>('Album', albumSchema)
