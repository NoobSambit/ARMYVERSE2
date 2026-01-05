/**
 * Check albums in database
 */
import * as dotenv from 'dotenv'
import mongoose from 'mongoose'
import type { IAlbum } from '../lib/models/Album'

const albumSchema = new mongoose.Schema({
  name: { type: String, required: true },
  artist: { type: String, required: true },
  spotifyId: { type: String, required: true, unique: true, index: true },
  isBTSFamily: { type: Boolean, default: false, index: true },
  tracks: [{
    name: { type: String, required: true },
    artist: { type: String, required: true },
    spotifyId: { type: String, required: true }
  }],
  trackCount: { type: Number, required: true },
  releaseDate: { type: Date },
  coverImage: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const Album = (mongoose.models.Album || mongoose.model<IAlbum>('Album', albumSchema)) as mongoose.Model<IAlbum>

dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

async function main() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not found')
  }

  await mongoose.connect(MONGODB_URI)

  const albumsByArtist = await Album.aggregate([
    { $match: { isBTSFamily: true } },
    {
      $group: {
        _id: '$artist',
        count: { $sum: 1 },
        albums: { $push: { name: '$name', tracks: '$trackCount' } }
      }
    },
    { $sort: { _id: 1 } }
  ])

  console.log('\n📊 BTS Family Albums in Database:\n')

  for (const artist of albumsByArtist) {
    console.log(`\n${artist._id} (${artist.count} albums):`)
    artist.albums
      .sort((a: any, b: any) => a.name.localeCompare(b.name))
      .forEach((album: any) => {
        console.log(`  - ${album.name} (${album.tracks} tracks)`)
      })
  }

  const total = await Album.countDocuments({ isBTSFamily: true })
  console.log(`\n✅ Total BTS Family albums: ${total}\n`)

  await mongoose.disconnect()
}

main().catch(console.error)
