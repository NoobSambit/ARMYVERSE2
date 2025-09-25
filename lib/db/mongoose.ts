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
    // Prefer IPv4 to avoid some SRV/DNS/IPv6 resolution issues in certain environments
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
      // KeepAlive to maintain connection and detect network issues
      // @ts-ignore - options are forwarded to the underlying driver
      heartbeatFrequencyMS: 5000
    } as any)
    
    global._mongooseConn = conn.connection
    console.debug('✅ MongoDB connected successfully')
    
    return conn.connection
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    console.error('💡 Make sure your MONGODB_URI is correct and contains valid options')
    // Provide actionable hint for common SRV DNS refusal (e.g., ECONNREFUSED querySrv)
    if (typeof mongoURI === 'string' && mongoURI.startsWith('mongodb+srv://')) {
      console.error('🛠️ Tip: If SRV DNS fails, try switching to a standard mongodb:// URI with explicit host:port and replica set options, or ensure your network/DNS allows _mongodb._tcp lookups.')
    }
    throw error
  }
}