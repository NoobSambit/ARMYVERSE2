import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  visibility: {
    type: String,
    enum: ['public', 'unlisted', 'private'],
    default: 'public'
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    index: true
  }],
  content: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  mood: {
    type: String,
    enum: ['emotional', 'fun', 'hype', 'chill', 'romantic', 'energetic'],
    default: 'fun'
  },
  coverImage: {
    type: String,
    default: null
  },
  author: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  reactions: {
    moved: {
      type: Number,
      default: 0
    },
    loved: {
      type: Number,
      default: 0
    },
    surprised: {
      type: Number,
      default: 0
    }
  },
  comments: [commentSchema],
  savedBy: [{
    type: String
  }],
  readTime: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
})

// Update the updatedAt field before saving
blogSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  
  // Calculate read time (rough estimate: 200 words per minute)
  if (this.content) {
    const wordCount = this.content.split(/\s+/).length
    this.readTime = Math.ceil(wordCount / 200)
  }
  
  next()
})

// Create indexes for better query performance
blogSchema.index({ status: 1, createdAt: -1 })
blogSchema.index({ tags: 1 })
blogSchema.index({ mood: 1 })
blogSchema.index({ 'author.id': 1 })
blogSchema.index({ savedBy: 1 })
blogSchema.index({ title: 'text', tags: 'text' })
blogSchema.index({ visibility: 1 })

export const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema) 