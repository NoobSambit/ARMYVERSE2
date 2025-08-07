import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, songs } = body
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Spotify access token required' }, { status: 401 })
    }

    if (!songs?.length) {
      return NextResponse.json({ error: 'No songs provided' }, { status: 400 })
    }

    // 1. Get current user's ID
    const userResponse = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!userResponse.ok) {
      throw new Error('Failed to get Spotify user profile')
    }
    
    const userData = await userResponse.json()
    const userId = userData.id

    // 2. Create new playlist
    const playlistResponse = await fetch(`${SPOTIFY_API_BASE}/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name || 'AI Generated BTS Playlist',
        description: 'Created with ArmyVerse AI Playlist Generator',
        public: false
      })
    })

    if (!playlistResponse.ok) {
      throw new Error('Failed to create Spotify playlist')
    }

    const playlist = await playlistResponse.json()

    // 3. Search and add tracks
    const trackUris = []
    for (const song of songs) {
      // Use the spotifyId if available, otherwise search
      if (song.spotifyId) {
        trackUris.push(`spotify:track:${song.spotifyId}`)
      } else {
        const query = `track:${song.title} artist:${song.artist}`
        const searchResponse = await fetch(
          `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        )

        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          if (searchData.tracks.items.length > 0) {
            trackUris.push(searchData.tracks.items[0].uri)
          }
        }
      }
    }

    // 4. Add tracks to playlist
    if (trackUris.length > 0) {
      await fetch(`${SPOTIFY_API_BASE}/playlists/${playlist.id}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: trackUris })
      })
    }

    return NextResponse.json({
      success: true,
      playlistUrl: playlist.external_urls.spotify,
      tracksAdded: trackUris.length
    })

  } catch (error) {
    console.debug('Error exporting to Spotify:', error)
    return NextResponse.json({ 
      error: 'Failed to export playlist',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}