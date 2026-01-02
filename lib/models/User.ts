import mongoose from 'mongoose'

// Profile subdocument schema
const profileSchema = new mongoose.Schema({
  // Public fields
  displayName: {
    type: String,
    required: function(this: any) {
      return !this.avatarUrl // DisplayName not required if no profile data
    },
    trim: true,
    minlength: 2,
    maxlength: 40
  },
  handle: {
    type: String,
    sparse: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 24,
    match: /^[a-z0-9_-]+$/
  },
  pronouns: {
    type: String,
    trim: true,
    maxlength: 50
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 160
  },
  avatarUrl: {
    type: String,
    trim: true
  },
  bannerUrl: {
    type: String,
    trim: true
  },
  bias: [{
    type: String,
    trim: true
  }],
  biasWrecker: {
    type: String,
    trim: true
  },
  favoriteEra: {
    type: String,
    trim: true
  },
  armySinceYear: {
    type: Number,
    min: 2013,
    max: new Date().getFullYear()
  },
  topSong: {
    id: String,
    name: String,
    artist: String
  },
  topAlbum: {
    id: String,
    name: String,
    artist: String
  },
  socials: {
    twitter: { type: String, trim: true },
    instagram: { type: String, trim: true },
    youtube: { type: String, trim: true },
    website: { type: String, trim: true },
    visibility: {
      twitter: { type: Boolean, default: true },
      instagram: { type: Boolean, default: true },
      youtube: { type: Boolean, default: true },
      website: { type: Boolean, default: true }
    }
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100
  },
  timezone: {
    type: String,
    trim: true
  },
  language: {
    type: String,
    trim: true,
    default: 'en'
  },
  
  // Personalization
  personalization: {
    accentColor: {
      type: String,
      default: '#8B5CF6'
    },
    themeIntensity: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    backgroundStyle: {
      type: String,
      enum: [
        // New styles
        'purple-nebula',
        'stage-lights',
        'army-constellation',
        'purple-aurora',
        'mesh-gradient',
        'glassmorphism',
        'geometric-grid',
        'holographic',
        // Legacy styles (for migration compatibility)
        'gradient',
        'noise',
        'bts-motif',
        'clean'
      ],
      default: 'mesh-gradient'
    },
    badgeStyle: {
      type: String,
      enum: ['minimal', 'collectible'],
      default: 'minimal'
    }
  },
  
  // Privacy & Safety
  privacy: {
    visibility: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public'
    },
    fieldVisibility: {
      bias: { type: Boolean, default: true },
      era: { type: Boolean, default: true },
      socials: { type: Boolean, default: true },
      stats: { type: Boolean, default: true }
    },
    explicitContentFilter: {
      type: Boolean,
      default: true
    },
    allowMentions: {
      type: Boolean,
      default: true
    },
    allowDMs: {
      type: Boolean,
      default: true
    },
    blockedUserIds: [{
      type: String
    }]
  },
  
  // Notifications
  notifications: {
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true }
    },
    quietHours: {
      start: { type: String }, // HH:MM format
      end: { type: String },   // HH:MM format
      timezone: { type: String }
    },
    blog: {
      comments: { type: Boolean, default: true },
      reactions: { type: Boolean, default: true },
      saves: { type: Boolean, default: true }
    },
    playlists: {
      exports: { type: Boolean, default: true },
      likes: { type: Boolean, default: true }
    },
    spotify: {
      weeklyRecap: { type: Boolean, default: true },
      recommendations: { type: Boolean, default: true }
    }
  },
  integrations: {
    spotify: {
      accessToken: { type: String },
      refreshToken: { type: String },
      scopes: [{ type: String }],
      tokenType: { type: String },
      expiresAt: { type: Date },
      spotifyUserId: { type: String, index: true },
      firebaseUid: { type: String, index: true },
      displayName: { type: String },
      avatarUrl: { type: String },
      updatedAt: { type: Date }
    },
    spotifyByo: {
      clientIdEnc: { type: String },
      clientSecretEnc: { type: String },
      refreshTokenEnc: { type: String },
      ownerId: { type: String },
      displayName: { type: String },
      avatarUrl: { type: String },
      scopes: [{ type: String }],
      tokenType: { type: String },
      accessToken: { type: String },
      expiresAt: { type: Date },
      updatedAt: { type: Date }
    },
    lastfm: {
      username: { type: String, trim: true, index: true },
      connectedAt: { type: Date },
      verified: { type: Boolean, default: false }
    },
    statsfm: {
      username: { type: String, trim: true },
      connectedAt: { type: Date },
      verified: { type: Boolean, default: false }
    }
  },
  pending: {
    spotifyByo: {
      state: { type: String },
      clientIdEnc: { type: String },
      clientSecretEnc: { type: String },
      codeVerifierEnc: { type: String },
      scopes: [{ type: String }],
      createdAt: { type: Date }
    }
  },
  
  // Computed/cached fields
  stats: {
    totalPlaylists: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalSaves: { type: Number, default: 0 }
  }
}, { _id: false })

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: function(this: any) {
      return !this.email // Name not required for Firebase Auth users
    },
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  password: {
    type: String,
    required: function(this: any) {
      return !this.googleId && !this.email // Password only required if not using Google OAuth and not Firebase Auth
    }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  image: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profile: {
    type: profileSchema,
    default: () => ({})
  },
  integrations: {
    spotify: {
      accessToken: { type: String },
      refreshToken: { type: String },
      scopes: [{ type: String }],
      tokenType: { type: String },
      expiresAt: { type: Date },
      spotifyUserId: { type: String, index: true },
      firebaseUid: { type: String, index: true },
      displayName: { type: String },
      avatarUrl: { type: String },
      updatedAt: { type: Date }
    },
    spotifyByo: {
      clientIdEnc: { type: String },
      clientSecretEnc: { type: String },
      refreshTokenEnc: { type: String },
      ownerId: { type: String, index: true },
      scopes: [{ type: String }],
      tokenType: { type: String },
      expiresAt: { type: Date },
      displayName: { type: String },
      avatarUrl: { type: String },
      updatedAt: { type: Date }
    },
    lastfm: {
      username: { type: String, trim: true, index: true },
      connectedAt: { type: Date },
      verified: { type: Boolean, default: false }
    },
    statsfm: {
      username: { type: String, trim: true },
      connectedAt: { type: Date },
      verified: { type: Boolean, default: false }
    }
  },
  pending: {
    spotifyByo: {
      state: { type: String },
      clientIdEnc: { type: String },
      clientSecretEnc: { type: String },
      scopes: [{ type: String }],
      codeVerifierEnc: { type: String },
      createdAt: { type: Date }
    }
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

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Indexes for profile fields (handle index is already defined in schema)
userSchema.index({ 'profile.socials.twitter': 1 }, { sparse: true })
userSchema.index({ 'profile.socials.instagram': 1 }, { sparse: true })
userSchema.index({ 'profile.socials.youtube': 1 }, { sparse: true })

// Text index for search
userSchema.index({ 
  'profile.displayName': 'text', 
  'profile.bio': 'text',
  'profile.handle': 'text'
})

export const User = mongoose.models.User || mongoose.model('User', userSchema) 