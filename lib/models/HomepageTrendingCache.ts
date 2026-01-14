import mongoose, { Schema } from 'mongoose'

// Individual song with metadata
const TrendingSongSchema = new Schema({
  rank: Number,
  title: String,
  artist: String,
  thumbnail: String,
  url: String,
  dailyStreams: Number,
  totalStreams: Number,
  views: Number,
  yesterday: Number
}, { _id: false })

// Platform data (Spotify or YouTube) - use Schema.Types.Mixed for flexible solo data
const PlatformDataSchema = new Schema({
  ot7: [TrendingSongSchema], // Top 6 BTS songs
  solo: Schema.Types.Mixed // Flexible map of member -> songs
}, { _id: false })

const HomepageTrendingCacheSchema = new Schema({
  spotify: PlatformDataSchema,
  youtube: PlatformDataSchema,
  lastUpdated: { type: Date, index: true },
  version: Number // For cache busting
}, { timestamps: true })

// Index for quick latest fetch
HomepageTrendingCacheSchema.index({ lastUpdated: -1 })

export default mongoose.models.HomepageTrendingCache ||
  mongoose.model('HomepageTrendingCache', HomepageTrendingCacheSchema)
