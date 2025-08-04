import mongoose from 'mongoose'

const trackSchema = new mongoose.Schema({
  spotifyId: {
    type: String,
    required: true,
    unique: true
  },
  youtubeId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  album: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in milliseconds
    required: true
  },
  popularity: {
    type: Number,
    min: 0,
    max: 100
  },
  // Flag to indicate the track belongs to BTS or BTS member solo discography
  isBTSFamily: {
    type: Boolean,
    default: false,
    index: true
  },
  releaseDate: Date,
  genres: [String],
  audioFeatures: {
    danceability: Number,
    energy: Number,
    valence: Number,
    tempo: Number,
    acousticness: Number,
    instrumentalness: Number,
    liveness: Number,
    speechiness: Number
  },
  thumbnails: {
    small: String,
    medium: String,
    large: String
  },
  previewUrl: String,
  isExplicit: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

trackSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

trackSchema.index({ name: 'text', artist: 'text', album: 'text' })

export const Track = mongoose.models.Track || mongoose.model('Track', trackSchema)