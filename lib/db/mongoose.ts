import mongoose from 'mongoose'

declare global {
  var _mongooseConn: mongoose.Connection | null
}

export async function connect() {
  if (global._mongooseConn) {
    return global._mongooseConn
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is required')
  }

  let mongoURI = process.env.MONGODB_URI

  // If using MongoDB Atlas, ensure proper options are present exactly once
  if (mongoURI.startsWith('mongodb+srv://') && !/retryWrites/i.test(mongoURI)) {
    // Append default options only if they are missing
    mongoURI += (mongoURI.includes('?') ? '&' : '?') + 'retryWrites=true&w=majority'
  }

  console.debug('🔗 Connecting to MongoDB...')
  
  try {
    mongoose.set('strictQuery', true)
    
    const conn = await mongoose.connect(mongoURI)
    
    global._mongooseConn = conn.connection
    console.debug('✅ MongoDB connected successfully')
    
    return conn.connection
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    console.error('💡 Make sure your MONGODB_URI is correct and contains valid options')
    throw error
  }
}