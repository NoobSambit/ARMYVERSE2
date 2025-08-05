import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function(this: any) {
      return !this.googleId // Password only required if not using Google OAuth
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

// Remove duplicate index definitions since unique: true already creates indexes
// userSchema.index({ email: 1 })  // Removed - duplicate of unique: true
// userSchema.index({ googleId: 1 })  // Removed - duplicate of unique: true

export const User = mongoose.models.User || mongoose.model('User', userSchema) 