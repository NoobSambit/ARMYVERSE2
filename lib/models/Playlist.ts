import mongoose from 'mongoose'

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  prompt: {
    type: String,
    required: true
  },
  tracks: [{
    spotifyId: String,
    name: String,
    artist: String,
    album: String,
    albumArt: String,
    duration: Number,
    popularity: Number,
    previewUrl: String,
    bpm: Number
  }],
  userId: {
    type: String, // Firebase UID
    required: false,
    index: true
  },
  firebaseUid: {
    type: String,
    index: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [String],
  mood: String,
  moods: [String],
  activity: String,

  // Generation parameters
  generationParams: {
    playlistType: {
      type: String,
      enum: ['feel-based', 'era-based', 'member-based', 'mixed'],
      default: 'feel-based'
    },
    playlistLength: {
      type: Number,
      default: 10
    },
    selectedMembers: [String],
    selectedEras: [String],
    audioFeatures: {
      danceability: Number,
      valence: Number,
      energy: Number
    },
    seedTracks: [{
      spotifyId: String,
      name: String,
      artist: String
    }],
    format: {
      type: String,
      enum: ['standard', 'remix', 'instrumental'],
      default: 'standard'
    }
  },

  // Metadata
  spotifyPlaylistId: String,
  spotifyPlaylistUrl: String,
  exportedAt: Date,
  viewCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
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

playlistSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

playlistSchema.index({ userId: 1, createdAt: -1 })
playlistSchema.index({ firebaseUid: 1, createdAt: -1 })
playlistSchema.index({ isPublic: 1, createdAt: -1 })

export const Playlist = mongoose.models.Playlist || mongoose.model('Playlist', playlistSchema)