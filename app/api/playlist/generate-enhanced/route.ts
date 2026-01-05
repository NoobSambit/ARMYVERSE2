import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { connect } from '@/lib/db/mongoose'
import { Track } from '@/lib/models/Track'
import { Playlist } from '@/lib/models/Playlist'

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

    return spotifyAccessToken
  } catch (error) {
    console.error('Failed to get Spotify access token:', error)
    return null
  }
}

// Enhanced lookup with album support and audio features
const findTrackInDatabase = async (title: string, artist: string, album: string = '') => {
  try {
    await connect()

    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    const cleanTitle = title.replace(/\(feat\..*?\)/gi, '').replace(/\(.*?version.*?\)/gi,'').trim()
    const cleanAlbum = album.replace(/\(.*?version.*?\)/gi,'').trim()

    const artistFallbacks = [
      artist,
      'BTS',
      'RM', 'Jin', 'SUGA', 'Agust D', 'j-hope', 'Jimin', 'V', 'Jung Kook'
    ].filter((a, i, arr) => arr.indexOf(a) === i)

    const escapedTitle = escapeRegex(cleanTitle)
    const escapedAlbum = cleanAlbum ? escapeRegex(cleanAlbum) : ''

    for (const tryArtist of artistFallbacks) {
      const escapedArtist = escapeRegex(tryArtist)

      const queries = []

      queries.push({
        name: new RegExp(`^${escapedTitle}$`, 'i'),
        artist: new RegExp(`^${escapedArtist}$`, 'i'),
        isBTSFamily: true
      })

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
          return {
            spotifyId: track.spotifyId,
            albumArt: track.thumbnails?.large || track.thumbnails?.medium || track.thumbnails?.small || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
            spotifyUrl: `https://open.spotify.com/track/${track.spotifyId}`,
            duration: track.duration,
            popularity: track.popularity,
            previewUrl: track.previewUrl,
            audioFeatures: track.audioFeatures,
            bpm: track.audioFeatures?.tempo
          }
        }
      }
    }

    return null
  } catch (err) {
    console.error('DB lookup error:', err)
    return null
  }
}

// Spotify search with BTS family filter
const searchSpotifyTrack = async (title: string, artist: string) => {
  const cleanTitle = title.replace(/\(feat\..*?\)/gi, '').trim()
  const query = `${cleanTitle} ${artist}`

  try {
    const token = await getSpotifyAccessToken()
    if (!token) throw new Error('No token')

    const url = `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=5`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.ok) {
      const data = await response.json()
      if (data.tracks.items.length > 0) {
        const track = data.tracks.items.find((t: any) => t.artists.some((a: any) => BTS_FAMILY.includes(a.name)))
        if (!track) return null
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
    console.error('Spotify search failed:', err)
  }

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
    const body = await req.json()

    const {
      prompt,
      playlistName,
      mood,
      moods,
      artistBias,
      playlistLength,
      yearEra,
      playlistType,
      seedTracks,
      audioFeatures,
      format,
      genreMix,
      flowPattern,
      context,
      lyricalMatch,
      userId,
      firebaseUid,
      saveToDb = false
    } = body

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (!groq) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    // Create sophisticated prompt for Groq
    let enhancedPrompt = `You are an expert BTS music curator. Create a carefully curated BTS playlist based on the specifications below.

MAIN REQUEST: "${prompt}"

CORE CONSTRAINTS:
- Return exactly ${playlistLength || 10} songs
- Playlist type: ${playlistType || 'feel-based'}
- CRITICAL: ONLY include songs that actually exist on Spotify and are officially released
- NO unreleased songs, demos, fan-made versions, or non-existent tracks
- Songs must be from BTS's official discography (group or solo releases)
- Ensure variety - avoid repeating the same song or very similar tracks`

    if (mood || (moods && moods.length > 0)) {
      const moodStr = moods && moods.length > 0 ? moods.join(', ') : mood
      enhancedPrompt += `\n- Target mood: ${moodStr}`
    }

    if (artistBias && artistBias.length > 0) {
      enhancedPrompt += `\n- Emphasize these BTS members: ${artistBias.join(', ')}`
    }

    if (yearEra && yearEra.length > 0) {
      enhancedPrompt += `\n- Focus on these eras: ${yearEra.join(', ')}`
    }

    if (seedTracks && seedTracks.length > 0) {
      const seedInfo = seedTracks.map((t: any) => {
        const trackName = t.name || t.title
        const energy = t.audioFeatures?.energy ? `Energy: ${Math.round(t.audioFeatures.energy * 100)}%` : ''
        const dance = t.audioFeatures?.danceability ? `Dance: ${Math.round(t.audioFeatures.danceability * 100)}%` : ''
        const features = [energy, dance].filter(Boolean).join(', ')
        return `"${trackName}" by ${t.artist}${features ? ` (${features})` : ''}`
      }).join(', ')

      enhancedPrompt += `\n- Seed tracks to match: ${seedInfo}`
      enhancedPrompt += `\n  → Select songs with similar energy, danceability, and overall vibe`
    }

    if (audioFeatures) {
      if (audioFeatures.danceability !== undefined) {
        const danceStr = audioFeatures.danceability > 66 ? 'highly danceable' : audioFeatures.danceability > 33 ? 'moderately danceable' : 'calm/slow'
        enhancedPrompt += `\n- Danceability preference: ${danceStr}`
      }
      if (audioFeatures.valence !== undefined) {
        const valenceStr = audioFeatures.valence > 66 ? 'happy/upbeat' : audioFeatures.valence > 33 ? 'neutral mood' : 'melancholic/sad'
        enhancedPrompt += `\n- Mood/valence preference: ${valenceStr}`
      }
    }

    if (format && format !== 'standard') {
      enhancedPrompt += `\n- Format preference: ${format}`
    }

    if (genreMix) {
      const sortedGenres = Object.entries(genreMix)
        .sort(([, a]: any, [, b]: any) => b - a)
        .filter(([, val]: any) => val > 5) // Only mention genres with >5%

      if (sortedGenres.length > 0) {
        const genreLabels: Record<string, string> = {
          ballad: 'Ballads',
          hiphop: 'Hip-Hop',
          edm: 'EDM/Electronic',
          rnb: 'R&B',
          rock: 'Rock',
          dancePop: 'Dance-Pop'
        }

        const genreBreakdown = sortedGenres
          .map(([genre, percent]) => `${genreLabels[genre] || genre} (${Math.round(percent as number)}%)`)
          .join(', ')

        enhancedPrompt += `\n- Genre distribution: ${genreBreakdown}`
        enhancedPrompt += `\n  → Select songs matching these genre proportions approximately`
      }
    }

    if (flowPattern && flowPattern !== 'random') {
      const flowDescriptions: Record<string, string> = {
        'slow-build': 'Start calm and gradually increase energy towards the end',
        'consistent': 'Maintain consistent energy level throughout',
        'wave': 'Alternate between high and low energy',
        'cool-down': 'Start with high energy and gradually decrease to calm'
      }
      enhancedPrompt += `\n- Flow pattern: ${flowDescriptions[flowPattern] || flowPattern}`
    }

    if (context && context !== 'auto') {
      const contextDescriptions: Record<string, string> = {
        'workout': 'high-energy songs perfect for exercise',
        'study': 'calm, focused songs for concentration',
        'party': 'upbeat, fun party songs',
        'sleep': 'soft, calming songs for relaxation',
        'commute': 'engaging songs perfect for travel'
      }
      enhancedPrompt += `\n- Context: Optimize for ${contextDescriptions[context] || context}`
    }

    if (lyricalMatch) {
      enhancedPrompt += `\n- Pay special attention to lyrical themes and storytelling consistency`
    }

    enhancedPrompt += `

SONG SELECTION STRATEGY:
1. Balance Requirements:
   - Match the main request and mood/vibe
   - Follow the genre distribution percentages
   - Respect the flow pattern (energy progression)
   - Consider context (workout, study, etc.)
   - Include variety across eras unless specified otherwise

2. Quality Standards:
   - ONLY officially released songs available on Spotify
   - Include both popular hits and deep cuts for diversity
   - Avoid repetitive sounds - each song should add unique value
   - If seed tracks provided, match their energy/style
   - Balance between group songs and solo work based on member preferences

3. Energy Flow:
   ${flowPattern === 'slow-build' ? '- Start with lower energy tracks, gradually build to high energy peaks' :
     flowPattern === 'consistent' ? '- Maintain steady energy throughout, minimal fluctuation' :
     flowPattern === 'wave' ? '- Alternate between high energy and calm, create dynamic contrast' :
     flowPattern === 'cool-down' ? '- Begin with energetic tracks, end with calm/soothing songs' :
     '- Natural, organic flow based on song transitions'}

ARTIST ATTRIBUTION RULES (CRITICAL):
- BTS GROUP albums → "artist": "BTS"
  Examples: Dark & Wild, Wings, Love Yourself series, Map of the Soul series, BE, Proof
  This includes solo/unit tracks ON group albums (e.g., Singularity, Epiphany, Serendipity)

- SOLO albums → "artist": [Member Name]
  Examples: Indigo (RM), The Astronaut (Jin), D-2/Agust D (SUGA), Hope World/Jack In The Box (j-hope),
            FACE (Jimin), Layover (V), GOLDEN (Jung Kook)

VERIFIED BTS DISCOGRAPHY EXAMPLES:
Group Songs:
- {"title": "Dynamite", "artist": "BTS", "album": "BE"}
- {"title": "Spring Day", "artist": "BTS", "album": "You Never Walk Alone"}
- {"title": "Blood Sweat & Tears", "artist": "BTS", "album": "WINGS"}
- {"title": "Boy With Luv", "artist": "BTS", "album": "Map of the Soul: Persona"}
- {"title": "Butter", "artist": "BTS", "album": "Butter"}
- {"title": "Yet To Come", "artist": "BTS", "album": "Proof"}

Solo/Unit on Group Albums:
- {"title": "Singularity", "artist": "BTS", "album": "Love Yourself 轉 'Tear'"}
- {"title": "Euphoria", "artist": "BTS", "album": "Love Yourself 結 'Answer'"}
- {"title": "Serendipity", "artist": "BTS", "album": "Love Yourself 承 'Her'"}
- {"title": "Moon", "artist": "BTS", "album": "Map of the Soul: 7"}
- {"title": "Inner Child", "artist": "BTS", "album": "Map of the Soul: 7"}

Solo Albums:
- {"title": "Like Crazy", "artist": "Jimin", "album": "FACE"}
- {"title": "Seven", "artist": "Jung Kook", "album": "GOLDEN"}
- {"title": "Wildflower", "artist": "RM", "album": "Indigo"}
- {"title": "The Astronaut", "artist": "Jin", "album": "The Astronaut"}
- {"title": "Arson", "artist": "j-hope", "album": "Jack In The Box"}
- {"title": "Slow Dancing", "artist": "V", "album": "Layover"}
- {"title": "Daechwita", "artist": "SUGA", "album": "D-2"}

REQUIRED OUTPUT FORMAT:
Return ONLY a valid JSON object with this exact structure:
{
  "playlist": [
    {"title": "Song Name", "artist": "Artist Name", "album": "Album Name"},
    {"title": "Song Name", "artist": "Artist Name", "album": "Album Name"}
  ]
}

FINAL CHECKLIST BEFORE RETURNING:
✓ Exact count: ${playlistLength || 10} songs
✓ All songs are real and exist on Spotify
✓ Artist attribution follows the rules above
✓ Album names are official and accurate
✓ Genre distribution approximately matches requested percentages
✓ Energy flow matches the pattern specified
✓ Variety in selection (no duplicates or very similar songs)
✓ Valid JSON format with no additional text

Return ONLY the JSON object, no explanations, no commentary, no markdown formatting.`

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

    // Parse JSON from response
    let aiPlaylist
    try {
      const parsed = JSON.parse(text.trim())

      if (Array.isArray(parsed)) {
        aiPlaylist = parsed
      } else if (parsed.playlist && Array.isArray(parsed.playlist)) {
        aiPlaylist = parsed.playlist
      } else {
        throw new Error('Invalid playlist format')
      }

      if (aiPlaylist.length === 0) {
        throw new Error('Invalid playlist format - empty array')
      }

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)

      // Fallback playlist
      aiPlaylist = [
        { title: "Dynamite", artist: "BTS", album: "BE" },
        { title: "Butter", artist: "BTS", album: "Butter" },
        { title: "Life Goes On", artist: "BTS", album: "BE" },
        { title: "Spring Day", artist: "BTS", album: "You Never Walk Alone" },
        { title: "DNA", artist: "BTS", album: "Love Yourself 承 'Her'" },
        { title: "Boy With Luv", artist: "BTS", album: "Map of the Soul: Persona" },
        { title: "Like Crazy", artist: "Jimin", album: "FACE" },
        { title: "Seven", artist: "Jung Kook", album: "GOLDEN" }
      ].slice(0, playlistLength || 10)
    }

    // Look up each track in the database
    const enhancedPlaylist = []

    for (const track of aiPlaylist) {
      const enhancedTrack: any = {
        title: track.title || 'Unknown Title',
        artist: track.artist || 'Unknown Artist',
        album: track.album || ''
      }

      // Database lookup first
      const dbData = await findTrackInDatabase(enhancedTrack.title, enhancedTrack.artist, enhancedTrack.album)

      if (dbData && dbData.spotifyId) {
        Object.assign(enhancedTrack, dbData)
      } else {
        // Fallback to Spotify search
        const spotifyData = await searchSpotifyTrack(enhancedTrack.title, enhancedTrack.artist)

        if (spotifyData && spotifyData.spotifyId) {
          Object.assign(enhancedTrack, spotifyData)
        } else {
          enhancedTrack.spotifyId = null
          enhancedTrack.albumArt = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
          enhancedTrack.spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(enhancedTrack.title + ' ' + enhancedTrack.artist)}`
          enhancedTrack.duration = 180000
          enhancedTrack.popularity = null
        }
      }

      enhancedPlaylist.push(enhancedTrack)
    }

    // Save to database if requested
    if (saveToDb && (userId || firebaseUid)) {
      try {
        await connect()

        const playlistDoc = new Playlist({
          name: playlistName || `AI Playlist - ${new Date().toLocaleDateString()}`,
          description: prompt,
          prompt: prompt,
          tracks: enhancedPlaylist.map((t: any) => ({
            spotifyId: t.spotifyId,
            name: t.title,
            artist: t.artist,
            album: t.album,
            albumArt: t.albumArt,
            duration: t.duration,
            popularity: t.popularity,
            previewUrl: t.previewUrl,
            bpm: t.bpm
          })),
          userId: userId || firebaseUid,
          firebaseUid: firebaseUid,
          moods: moods || (mood ? [mood] : []),
          generationParams: {
            playlistType: playlistType || 'feel-based',
            playlistLength: playlistLength || 10,
            selectedMembers: artistBias || [],
            selectedEras: yearEra || [],
            audioFeatures: audioFeatures || {},
            seedTracks: seedTracks || [],
            format: format || 'standard',
            genreMix: genreMix || {},
            flowPattern: flowPattern || 'slow-build',
            context: context || 'auto',
            lyricalMatch: lyricalMatch || false
          }
        })

        await playlistDoc.save()

        return NextResponse.json({
          playlist: enhancedPlaylist,
          playlistId: playlistDoc._id.toString(),
          saved: true
        })
      } catch (dbError) {
        console.error('Failed to save playlist:', dbError)
        // Return playlist anyway
        return NextResponse.json({
          playlist: enhancedPlaylist,
          saved: false,
          error: 'Failed to save to database'
        })
      }
    }

    return NextResponse.json({
      playlist: enhancedPlaylist,
      saved: false
    })

  } catch (error) {
    console.error('Enhanced AI playlist generation error:', error)
    return NextResponse.json({
      error: 'Failed to generate enhanced AI playlist',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
