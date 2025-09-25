const mongoose = require('mongoose')

async function testDatabase() {
  console.log('🔍 Testing MongoDB connection...')
  
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set')
      console.log('💡 Please create a .env.local file with your MongoDB connection string')
      console.log('📝 Example: MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/armyverse?retryWrites=true&w=majority"')
      return
    }
    
    console.log('🔗 Connecting to MongoDB...')
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    
    console.log('✅ MongoDB connected successfully!')
    
    // Define Track schema (simplified version)
    const trackSchema = new mongoose.Schema({
      spotifyId: String,
      name: String,
      artist: String,
      album: String,
      isBTSFamily: Boolean,
      thumbnails: {
        small: String,
        medium: String,
        large: String
      }
    })
    
    const Track = mongoose.model('Track', trackSchema)
    
    // Count documents
    const totalTracks = await Track.countDocuments()
    const btsTracks = await Track.countDocuments({ isBTSFamily: true })
    
    console.log(`📊 Database Statistics:`)
    console.log(`   Total tracks: ${totalTracks}`)
    console.log(`   BTS family tracks: ${btsTracks}`)
    
    if (btsTracks === 0) {
      console.log('⚠️  No BTS tracks found in database!')
      console.log('💡 This might be why songs are not appearing in the manual playlist section')
    } else {
      console.log('✅ BTS tracks found - songs should appear in the application')
      
      // Show a sample track
      const sampleTrack = await Track.findOne({ isBTSFamily: true })
      if (sampleTrack) {
        console.log('📝 Sample track:')
        console.log(`   Name: ${sampleTrack.name}`)
        console.log(`   Artist: ${sampleTrack.artist}`)
        console.log(`   Album: ${sampleTrack.album}`)
        console.log(`   Has thumbnails: ${!!sampleTrack.thumbnails}`)
      }
    }
    
    // Check connection details
    const connection = mongoose.connection
    console.log('🔗 Connection details:')
    console.log(`   Host: ${connection.host}`)
    console.log(`   Port: ${connection.port}`)
    console.log(`   Database: ${connection.name}`)
    console.log(`   Ready state: ${connection.readyState}`)
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    console.error('💡 Common issues:')
    console.error('   1. MONGODB_URI is not set in .env.local')
    console.error('   2. MongoDB connection string is invalid')
    console.error('   3. Network connectivity issues')
    console.error('   4. MongoDB Atlas IP whitelist')
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' })

testDatabase() 