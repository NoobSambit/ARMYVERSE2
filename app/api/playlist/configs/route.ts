import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import mongoose from 'mongoose'

export const runtime = 'nodejs'

// Define PlaylistConfig schema
const PlaylistConfigSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  config: {
    prompt: String,
    moods: [String],
    members: [String],
    era: String,
    format: String,
    length: Number,
    audioFeatures: {
      danceability: Number,
      valence: Number
    },
    genreMix: {
      ballad: Number,
      hiphop: Number,
      edm: Number,
      rnb: Number,
      rock: Number,
      dancePop: Number
    },
    flowPattern: String,
    context: String,
    lyricalMatch: Boolean,
    seedTracks: [mongoose.Schema.Types.Mixed]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const PlaylistConfig = mongoose.models.PlaylistConfig || mongoose.model('PlaylistConfig', PlaylistConfigSchema)

// GET - Fetch user's saved configurations
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const firebaseUid = searchParams.get('firebaseUid')

    if (!firebaseUid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    await connect()

    const configs = await PlaylistConfig.find({ firebaseUid })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    // Transform to match expected format
    const transformedConfigs = configs.map(c => ({
      ...c.config,
      name: c.name
    }))

    return NextResponse.json({ configs: transformedConfigs })

  } catch (error) {
    console.error('Error fetching configs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch configurations' },
      { status: 500 }
    )
  }
}

// POST - Save new configuration
export async function POST(req: Request) {
  try {
    const { firebaseUid, config } = await req.json()

    if (!firebaseUid || !config || !config.name) {
      return NextResponse.json(
        { error: 'User ID and config with name required' },
        { status: 400 }
      )
    }

    await connect()

    const newConfig = new PlaylistConfig({
      firebaseUid,
      name: config.name,
      config: {
        prompt: config.prompt,
        moods: config.moods,
        members: config.members,
        era: config.era,
        format: config.format,
        length: config.length,
        audioFeatures: config.audioFeatures,
        genreMix: config.genreMix,
        flowPattern: config.flowPattern,
        context: config.context,
        lyricalMatch: config.lyricalMatch,
        seedTracks: config.seedTracks
      }
    })

    await newConfig.save()

    return NextResponse.json({
      success: true,
      configId: newConfig._id.toString()
    })

  } catch (error) {
    console.error('Error saving config:', error)
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a configuration
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const configId = searchParams.get('configId')
    const firebaseUid = searchParams.get('firebaseUid')

    if (!configId || !firebaseUid) {
      return NextResponse.json(
        { error: 'Config ID and User ID required' },
        { status: 400 }
      )
    }

    await connect()

    const result = await PlaylistConfig.deleteOne({
      _id: configId,
      firebaseUid
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting config:', error)
    return NextResponse.json(
      { error: 'Failed to delete configuration' },
      { status: 500 }
    )
  }
}
