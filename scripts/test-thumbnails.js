const mongoose = require('mongoose')

async function testThumbnails() {
  console.log('🔍 Testing thumbnail data...')
  
  try {
    // Load environment variables
    require('dotenv').config({ path: '.env.local' })
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set')
      return
    }
    
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connected successfully!')
    
    // Define Track schema
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
    
    // Get sample tracks with thumbnails
    const tracksWithThumbnails = await Track.find({ 
      isBTSFamily: true,
      'thumbnails.large': { $exists: true, $ne: null }
    }).limit(5)
    
    const tracksWithoutThumbnails = await Track.find({ 
      isBTSFamily: true,
      $or: [
        { 'thumbnails.large': { $exists: false } },
        { 'thumbnails.large': null },
        { 'thumbnails.large': '' }
      ]
    }).limit(5)
    
    console.log(`📊 Thumbnail Statistics:`)
    console.log(`   Tracks with thumbnails: ${tracksWithThumbnails.length}`)
    console.log(`   Tracks without thumbnails: ${tracksWithoutThumbnails.length}`)
    
    if (tracksWithThumbnails.length > 0) {
      console.log('✅ Sample tracks with thumbnails:')
      tracksWithThumbnails.forEach((track, index) => {
        console.log(`   ${index + 1}. ${track.name} by ${track.artist}`)
        console.log(`      Large: ${track.thumbnails?.large ? '✅' : '❌'}`)
        console.log(`      Medium: ${track.thumbnails?.medium ? '✅' : '❌'}`)
        console.log(`      Small: ${track.thumbnails?.small ? '✅' : '❌'}`)
      })
    }
    
    if (tracksWithoutThumbnails.length > 0) {
      console.log('⚠️  Sample tracks without thumbnails:')
      tracksWithoutThumbnails.forEach((track, index) => {
        console.log(`   ${index + 1}. ${track.name} by ${track.artist}`)
      })
    }
    
    // Test the API endpoint data structure
    const apiTracks = await Track.find({ isBTSFamily: true })
      .select('spotifyId name artist album thumbnails')
      .limit(3)
    
    console.log('\n📝 API Response Structure:')
    apiTracks.forEach((track, index) => {
      console.log(`   Track ${index + 1}:`)
      console.log(`     spotifyId: ${track.spotifyId}`)
      console.log(`     name: ${track.name}`)
      console.log(`     artist: ${track.artist}`)
      console.log(`     album: ${track.album}`)
      console.log(`     thumbnails: ${JSON.stringify(track.thumbnails)}`)
    })
    
  } catch (error) {
    console.error('❌ Thumbnail test failed:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

testThumbnails() 