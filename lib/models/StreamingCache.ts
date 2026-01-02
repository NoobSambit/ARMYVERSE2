import mongoose from 'mongoose'

export interface IStreamingCache {
  _id: mongoose.Types.ObjectId
  userId: string
  lastfmUsername: string
  recentTracks: Array<{
    trackName: string
    artistName: string
    albumName: string
    timestamp: Date
  }>
  topTracks: Array<{
    trackName: string
    artistName: string
    playcount: number
  }>
  cachedAt: Date
  expiresAt: Date
}

const streamingCacheSchema = new mongoose.Schema<IStreamingCache>({
  userId: { type: String, required: true, index: true },
  lastfmUsername: { type: String, required: true },
  recentTracks: [{
    trackName: { type: String },
    artistName: { type: String },
    albumName: { type: String },
    timestamp: { type: Date }
  }],
  topTracks: [{
    trackName: { type: String },
    artistName: { type: String },
    playcount: { type: Number }
  }],
  cachedAt: { type: Date, default: Date.now, index: true },
  expiresAt: { type: Date, required: true, index: true }
})

// Compound index for cache lookup
streamingCacheSchema.index({ userId: 1, cachedAt: -1 })

// TTL index: auto-delete expired cache
streamingCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const StreamingCache = mongoose.models.StreamingCache || mongoose.model<IStreamingCache>('StreamingCache', streamingCacheSchema)
