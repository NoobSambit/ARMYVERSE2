import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { connect } from '@/lib/db/mongoose'
import { Track } from '@/lib/models/Track'

export const runtime = 'nodejs'

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null

// Simple track lookup from DB
const findTrackInDatabase = async (title: string, artist: string) => {
  try {
    await connect()
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const cleanTitle = title.replace(/\(feat\..*?\)/gi, '').trim()

    const track = await Track.findOne({
      name: new RegExp(`^${escapeRegex(cleanTitle)}$`, 'i'),
      artist: new RegExp(`^${escapeRegex(artist)}$`, 'i'),
      isBTSFamily: true
    }).sort({ popularity: -1 }).lean()

    if (track) {
      return {
        spotifyId: track.spotifyId,
        albumArt: track.thumbnails?.large || track.thumbnails?.medium || track.thumbnails?.small,
        spotifyUrl: `https://open.spotify.com/track/${track.spotifyId}`,
        duration: track.duration,
        popularity: track.popularity,
        previewUrl: track.previewUrl,
        audioFeatures: track.audioFeatures,
        bpm: track.audioFeatures?.tempo
      }
    }
    return null
  } catch (err) {
    console.error('DB lookup error:', err)
    return null
  }
}

export async function POST(req: Request) {
  try {
    const { currentPlaylist, instruction, originalPrompt } = await req.json()

    if (!currentPlaylist || currentPlaylist.length === 0) {
      return NextResponse.json({ error: 'Current playlist required' }, { status: 400 })
    }

    if (!instruction?.trim()) {
      return NextResponse.json({ error: 'Evolution instruction required' }, { status: 400 })
    }

    if (!groq) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    // Build current playlist summary for AI
    const currentTracks = currentPlaylist.slice(0, 20).map((t: any) =>
      `"${t.title}" by ${t.artist}`
    ).join('\n')

    const evolvePrompt = `You have an existing BTS playlist. Your task is to evolve it based on user instructions.

CURRENT PLAYLIST (${currentPlaylist.length} songs):
${currentTracks}
${currentPlaylist.length > 20 ? `... and ${currentPlaylist.length - 20} more songs` : ''}

ORIGINAL REQUEST: "${originalPrompt || 'Not specified'}"

USER'S EVOLUTION INSTRUCTION: "${instruction}"

TASK:
Based on the evolution instruction, create an improved playlist. You can:
- Keep some songs from the current playlist if they fit the new direction
- Replace songs that don't match the new instruction
- Add new songs that better fit the evolution request
- Maintain approximately the same playlist length (${currentPlaylist.length} songs)

IMPORTANT RULES:
- ONLY include officially released BTS songs that exist on Spotify
- Include both BTS group songs and solo member songs
- Follow the evolution instruction carefully
- If instruction says "more energetic", pick higher energy songs
- If instruction says "add variety", include different styles/eras
- If instruction says "focus on vocals", prioritize vocal line ballads
- If instruction says "remove similar", avoid repetitive songs

SONG ATTRIBUTION RULES:
- If song is on a BTS GROUP album → "artist": "BTS"
- If song is on a SOLO album → "artist": [Member Name]

REQUIRED FORMAT - Return ONLY this JSON object:
{
  "playlist": [
    {"title": "Song Name", "artist": "Artist Name", "album": "Album Name"},
    {"title": "Song Name", "artist": "Artist Name", "album": "Album Name"}
  ],
  "changes": "Brief description of what changed (1-2 sentences)"
}

Only return the JSON object, no other text.`

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: evolvePrompt }],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: "json_object" }
    })

    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error('No response from AI')
    }

    const response = JSON.parse(completion.choices[0].message.content)
    const aiPlaylist = response.playlist || []
    const changes = response.changes || 'Playlist evolved based on your instruction'

    if (!Array.isArray(aiPlaylist) || aiPlaylist.length === 0) {
      throw new Error('Invalid playlist format from AI')
    }

    // Enrich with database data
    const enhancedPlaylist = []
    for (const track of aiPlaylist) {
      const enhancedTrack: any = {
        title: track.title || 'Unknown Title',
        artist: track.artist || 'Unknown Artist',
        album: track.album || ''
      }

      const dbData = await findTrackInDatabase(enhancedTrack.title, enhancedTrack.artist)
      if (dbData && dbData.spotifyId) {
        Object.assign(enhancedTrack, dbData)
      } else {
        enhancedTrack.spotifyId = null
        enhancedTrack.albumArt = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
        enhancedTrack.spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(enhancedTrack.title + ' ' + enhancedTrack.artist)}`
        enhancedTrack.duration = 180000
        enhancedTrack.popularity = null
      }

      enhancedPlaylist.push(enhancedTrack)
    }

    return NextResponse.json({
      playlist: enhancedPlaylist,
      changes
    })

  } catch (error) {
    console.error('Evolve playlist error:', error)
    return NextResponse.json(
      { error: 'Failed to evolve playlist' },
      { status: 500 }
    )
  }
}
