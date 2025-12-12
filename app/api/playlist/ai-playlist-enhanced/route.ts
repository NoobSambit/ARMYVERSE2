import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { connect } from '@/lib/db/mongoose'
import { Track } from '@/lib/models/Track'

export const runtime = 'nodejs'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

// Initialize Groq AI
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null

// Cache for Spotify access token
let spotifyAccessToken: string | null = null
let tokenExpiration: number | null = null

// Whitelist of accepted BTS family artist names
const BTS_FAMILY = ['BTS','RM','Jin','SUGA','Agust D','j-hope','Jimin','V','Jungkook','Jung Kook']

// Get Spotify access token (Client Credentials)
const getSpotifyAccessToken = async () => {
  if (spotifyAccessToken && tokenExpiration && Date.now() < tokenExpiration) {
    return spotifyAccessToken
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')
      },
      body: 'grant_type=client_credentials'
    })

    const data = await response.json()
    spotifyAccessToken = data.access_token
    tokenExpiration = Date.now() + (data.expires_in * 1000) - 60000 // 1 minute buffer
    
    console.debug('✅ Got Spotify access token')
    return spotifyAccessToken
  } catch (error) {
    console.debug('❌ Failed to get Spotify access token:', error)
    return null
  }
}

// UPDATED lookup with album support
const findTrackInDatabase = async (title: string, artist: string, album: string = '') => {
  try {
    await connect()

    // Escape regex special characters
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    const cleanTitle = title.replace(/\(feat\..*?\)/gi, '').replace(/\(.*?version.*?\)/gi,'').trim()
    const cleanAlbum = album.replace(/\(.*?version.*?\)/gi,'').trim()

    // Artist fallback list - try original artist first, then BTS, then all members
    const artistFallbacks = [
      artist, // Original artist from AI
      'BTS', // Most likely correct for group album tracks
      'RM', 'Jin', 'SUGA', 'Agust D', 'j-hope', 'Jimin', 'V', 'Jung Kook'
    ].filter((a, i, arr) => arr.indexOf(a) === i) // Remove duplicates

    // Build regex patterns
    const escapedTitle = escapeRegex(cleanTitle)
    const escapedAlbum = cleanAlbum ? escapeRegex(cleanAlbum) : ''

    // Try each artist fallback - but limit attempts for performance
    for (const tryArtist of artistFallbacks) {
      const escapedArtist = escapeRegex(tryArtist)

      // Simplified query strategy - only try the most likely matches
      const queries = []

      // 1. Exact title + exact artist (most common case)
      queries.push({
        name: new RegExp(`^${escapedTitle}$`, 'i'),
        artist: new RegExp(`^${escapedArtist}$`, 'i'),
        isBTSFamily: true
      })

      // 2. If album provided, try with album match
      if (escapedAlbum) {
        queries.push({
          name: new RegExp(`^${escapedTitle}$`, 'i'),
          artist: new RegExp(`^${escapedArtist}$`, 'i'),
          album: new RegExp(escapedAlbum, 'i'),
          isBTSFamily: true
        })
      }

      for (const query of queries) {
        const track = await Track.findOne(query).sort({ popularity: -1 }).lean()
        if (track) {
          console.debug(`✅ Found match: ${track.name} - ${track.artist} (${track.album})`)
          return {
            spotifyId: track.spotifyId,
            albumArt: track.thumbnails?.large || track.thumbnails?.medium || track.thumbnails?.small || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
            spotifyUrl: `https://open.spotify.com/track/${track.spotifyId}`,
            duration: track.duration,
            popularity: track.popularity,
            previewUrl: track.previewUrl
          }
        }
      }
    }

    return null
  } catch (err) {
    console.debug('❌ DB lookup error:', err)
    return null
  }
}

// Hybrid Spotify search (v2) – always returns first result if available
const searchSpotifyTrack = async (title: string, artist: string) => {
  const cleanTitle = title.replace(/\(feat\..*?\)/gi, '').trim()
  const query = `${cleanTitle} ${artist}`

  try {
    const token = await getSpotifyAccessToken()
    if (!token) throw new Error('No token')

    const url = `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=1`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.ok) {
      const data = await response.json()
      if (data.tracks.items.length > 0) {
        // Pick the first track whose primary artist is in BTS_FAMILY
        const track = data.tracks.items.find((t: any) => t.artists.some((a: any) => BTS_FAMILY.includes(a.name)))
        if (!track) return null // no trusted match
        return {
          spotifyId: track.id,
          albumArt: track.album.images[0]?.url ?? null,
          spotifyUrl: track.external_urls.spotify,
          duration: track.duration_ms,
          popularity: track.popularity
        }
      }
    }
  } catch (err) {
    console.debug('Spotify quick search failed, falling back:', err)
  }

  // fallback generic search link
  return {
    spotifyId: null,
    albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(query)}`,
    duration: 180000,
    popularity: null
  }
}

export async function POST(req: Request) {
  try {
    console.debug('🤖 AI playlist with database lookup route hit!')
    
    const body = await req.json()
    console.debug('Request body:', body)
    
    const { 
      prompt, 
      mood, 
      artistBias, 
      playlistLength, 
      yearEra, 
      playlistType 
    } = body
    
    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }
    
    if (!groq) {
      console.debug('❌ Groq API key not configured')
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }
    
    console.debug('🎵 Generating AI playlist with database lookup...')
    
    // Create sophisticated prompt for Groq with STRICT validation
    let enhancedPrompt = `Create a BTS playlist with these specifications:

MAIN REQUEST: "${prompt}"

CONSTRAINTS:
- Return exactly ${playlistLength || 10} songs
- Playlist type: ${playlistType || 'feel-based'}
- ONLY include songs that actually exist on Spotify and are officially released
- NO unreleased songs, demos, or fan-made versions
- NO songs that don't exist in BTS's official discography`

    if (mood) {
      enhancedPrompt += `\n- Target mood: ${mood}`
    }

    if (artistBias && artistBias.length > 0) {
      enhancedPrompt += `\n- Emphasize these BTS members: ${artistBias.join(', ')}`
    }

    if (yearEra && yearEra.length > 0) {
      enhancedPrompt += `\n- Focus on these eras: ${yearEra.join(', ')}`
    }

    enhancedPrompt += `

SONG SELECTION RULES:
- ONLY include officially released BTS songs that exist on Spotify
- Include BTS group songs AND solo member songs (RM, Jin, Suga/Agust D, J-Hope, Jimin, V, Jungkook)
- Mix popular hits with deep cuts based on the request
- Consider the specified playlist type when choosing songs
- NEVER include unreleased songs, demos, or non-existent tracks

ARTIST RULES:
- If the song was released on a BTS GROUP album, set "artist": "BTS" (do NOT list individual members).
- This includes unit songs, solo tracks on group albums, and member-led tracks that appear on BTS albums.
- If the song was released on a SOLO album, set "artist" to that member (RM, Jin, SUGA/Agust D, j-hope, Jimin, V, Jung Kook).
- ALWAYS include the exact official album name in the "album" field.

VALID EXAMPLES (these songs exist on Spotify):
- "Euphoria" → {"title": "Euphoria", "artist": "BTS", "album": "Love Yourself 結 'Answer'"}
- "Moon" → {"title": "Moon", "artist": "BTS", "album": "Map of the Soul: 7"}
- "Serendipity" → {"title": "Serendipity", "artist": "BTS", "album": "Love Yourself 承 'Her'"}
- "Trivia 承 : Love" → {"title": "Trivia 承 : Love", "artist": "BTS", "album": "Love Yourself 結 'Answer'"}
- "Trivia 起 : Just Dance" → {"title": "Trivia 起 : Just Dance", "artist": "BTS", "album": "Love Yourself 結 'Answer'"}
- "Trivia 轉 : Seesaw" → {"title": "Trivia 轉 : Seesaw", "artist": "BTS", "album": "Love Yourself 結 'Answer'"}
- "Like Crazy" → {"title": "Like Crazy", "artist": "Jimin", "album": "FACE"}
- "Seven" → {"title": "Seven", "artist": "Jung Kook", "album": "GOLDEN"}
- "Chicken Noodle Soup" → {"title": "Chicken Noodle Soup", "artist": "j-hope", "album": "Hope World"}
- "Epilogue: Young Forever" → {"title": "Epilogue: Young Forever", "artist": "BTS", "album": "The Most Beautiful Moment in Life: Young Forever"}
- "The Truth Untold" → {"title": "The Truth Untold (feat. Steve Aoki)", "artist": "BTS", "album": "Love Yourself 轉 'Tear'"}
- "Stigma" → {"title": "Stigma", "artist": "BTS", "album": "WINGS"}
- "Singularity" → {"title": "Singularity", "artist": "BTS", "album": "Love Yourself 轉 'Tear'"}
- "Airplane pt.2" → {"title": "Airplane pt.2", "artist": "BTS", "album": "Love Yourself 結 'Answer'"}

INVALID EXAMPLES (DO NOT include these - they don't exist on Spotify):
- "4 O'Clock" (doesn't exist)
- "So Far Away (SUGA, Jin, Jung Kook ver.)" (doesn't exist)
- Any unreleased or demo versions

REQUIRED FORMAT - Return ONLY this JSON object with a "playlist" key containing an array:
{
  "playlist": [
    {"title": "Song Name", "artist": "Artist Name", "album": "Album Name"},
    {"title": "Song Name", "artist": "Artist Name", "album": "Album Name"}
  ]
}

IMPORTANT: Only return the JSON object, no explanations or other text. Only include songs that actually exist on Spotify.`

    console.debug('🤖 Using Groq with Llama 3.3 70B')

    // Use Groq with Llama 3.3 70B model
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: enhancedPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: "json_object" }
    })

    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error('No response from Groq API')
    }

    const text = completion.choices[0].message.content

    console.debug('🤖 Raw Groq response length:', text.length)
    
    // Parse JSON from response
    let aiPlaylist
    try {
      const parsed = JSON.parse(text.trim())

      // Handle both array and object with playlist key
      if (Array.isArray(parsed)) {
        aiPlaylist = parsed
      } else if (parsed.playlist && Array.isArray(parsed.playlist)) {
        aiPlaylist = parsed.playlist
      } else {
        throw new Error('Invalid playlist format - expected array or object with playlist key')
      }

      // Validate the playlist structure
      if (aiPlaylist.length === 0) {
        throw new Error('Invalid playlist format - empty array')
      }

      console.debug(`✅ Parsed ${aiPlaylist.length} songs from AI`)

    } catch (parseError) {
      console.debug('❌ Failed to parse AI response:', parseError)
      console.debug('Raw response was:', text)
      
      // Return fallback playlist based on parameters
      aiPlaylist = [
        { title: "Dynamite", artist: "BTS" },
        { title: "Butter", artist: "BTS" },
        { title: "Life Goes On", artist: "BTS" },
        { title: "Spring Day", artist: "BTS" },
        { title: "DNA", artist: "BTS" },
        { title: "Boy With Luv", artist: "BTS" },
        { title: "Like Crazy", artist: "Jimin" },
        { title: "Seven", artist: "Jungkook" }
      ].slice(0, playlistLength || 10)
      
      console.debug('🔄 Using fallback playlist due to parse error')
    }
    
    // NEW: Look up each track in the database
    console.debug('🎵 Looking up tracks in database...')
    const enhancedPlaylist = []

    for (const track of aiPlaylist) {
      const enhancedTrack: any = {
        title: track.title || 'Unknown Title',
        artist: track.artist || 'Unknown Artist',
        album: track.album || ''
      }

      // 1️⃣  Database lookup first
      console.debug(`�� Looking up: "${enhancedTrack.title}" by "${enhancedTrack.artist}" from album "${enhancedTrack.album}"`)
      const dbData = await findTrackInDatabase(enhancedTrack.title, enhancedTrack.artist, enhancedTrack.album)

      if (dbData && dbData.spotifyId) {
        // Use database data (real Spotify ID and metadata)
        Object.assign(enhancedTrack, dbData)
        console.debug(`✅ DB match: ${enhancedTrack.title} - ${enhancedTrack.artist}`)
      } else {
        // 2️⃣  Fallback to Spotify quick search (only accept BTS-family result)
        console.debug(`🔄 DB miss → Spotify search: ${enhancedTrack.title}`)
        const spotifyData = await searchSpotifyTrack(enhancedTrack.title, enhancedTrack.artist)

        if (spotifyData && spotifyData.spotifyId) {
          Object.assign(enhancedTrack, spotifyData)
          console.debug(`✅ Spotify match: ${enhancedTrack.title} - ${enhancedTrack.artist}`)
        } else {
          // 3️⃣  Add track with fallback data - don't skip it
          console.debug(`⚠️ Adding track with fallback: ${enhancedTrack.title} - ${enhancedTrack.artist}`)
          enhancedTrack.spotifyId = null
          enhancedTrack.albumArt = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
          enhancedTrack.spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(enhancedTrack.title + ' ' + enhancedTrack.artist)}`
          enhancedTrack.duration = 180000
          enhancedTrack.popularity = null
        }
      }

      enhancedPlaylist.push(enhancedTrack)
    }

    console.debug(`✅ Returning enhanced playlist with ${enhancedPlaylist.length} tracks`)
    return NextResponse.json(enhancedPlaylist)
    
  } catch (error) {
    console.debug('❌ Enhanced AI playlist generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate enhanced AI playlist', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}