import mongoose, { Schema } from 'mongoose'

// Daily view data point
const DailyViewPointSchema = new Schema({
  date: String,
  views: Number
}, { _id: false })

// Monthly view data point
const MonthlyViewPointSchema = new Schema({
  date: String,
  views: Number
}, { _id: false })

// Yearly view data point
const YearlyViewPointSchema = new Schema({
  year: String,
  views: Number
}, { _id: false })

// Individual song with detailed stats
const YouTubeSongSchema = new Schema({
  rank: Number,
  videoId: String,
  title: String,
  artist: String,
  views: Number,
  yesterday: Number,
  published: String,
  thumbnail: String,
  url: String,
  // Detailed statistics (fetched on demand)
  detail: {
    totalViews: Number,
    likes: Number,
    mostViewsInADay: Number,
    mostViewsDate: String,
    expectedMilestone: String,
    milestoneViews: Number,
    milestoneDate: String,
    dailyViews: [DailyViewPointSchema],
    monthlyViews: [MonthlyViewPointSchema],
    yearlyViews: [YearlyViewPointSchema],
    topLists: [String],
    milestones: [String],
    peakPosition: Number,
    chartedWeeks: Number
  },
  detailLastFetched: Date
}, { _id: false })

// Artist group (BTS or solo member)
const YouTubeArtistGroupSchema = new Schema({
  artist: String,
  pageUrl: String,
  songs: [YouTubeSongSchema],
  // Aggregated stats
  totalViews: Number,
  totalSongs: Number,
  dailyAvg: Number
}, { _id: false })

const YouTubeKworbSnapshotSchema = new Schema({
  dateKey: { type: String, index: true },
  artistGroups: [YouTubeArtistGroupSchema],
  // Metadata
  lastRefreshedAt: Date,
  sourceUrl: String
}, { timestamps: true })

// Compound index for faster latest queries
YouTubeKworbSnapshotSchema.index({ dateKey: -1 })

export default mongoose.models.YouTubeKworbSnapshot ||
  mongoose.model('YouTubeKworbSnapshot', YouTubeKworbSnapshotSchema)
