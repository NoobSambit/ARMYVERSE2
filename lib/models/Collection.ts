import mongoose from 'mongoose'

const collectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  coverImage: {
    type: String,
    default: null
  },
  owner: {
    id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    avatar: { type: String, default: null }
  },
  slug: {
    type: String,
    required: true
  },
  visibility: {
    type: String,
    enum: ['public', 'unlisted', 'private'],
    default: 'public',
    index: true
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }],
  tags: [{ type: String, trim: true }],
  mood: { type: String, trim: true },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

collectionSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

collectionSchema.index({ 'owner.id': 1, slug: 1 }, { unique: true })
collectionSchema.index({ createdAt: -1 })

export const Collection = mongoose.models.Collection || mongoose.model('Collection', collectionSchema)


