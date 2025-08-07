import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

// Helper function to refresh Spotify access token
async function refreshSpotifyToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    })

    if (!response.ok) {
      console.error('Token refresh failed:', response.status, await response.text())
      return null
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error refreshing token:', error)
    return null
  }
}

// Test endpoint to check token validity
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // Test the token with a simple API call
    const testResponse = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const testData = await testResponse.json()

    return NextResponse.json({
      tokenValid: testResponse.ok,
      status: testResponse.status,
      userData: testData,
      scopes: testData.scope || 'No scopes found'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, songs } = body
    const authHeader = req.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')

    console.log('Export request received:', {
      hasToken: !!token,
      tokenLength: token?.length,
      songsCount: songs?.length,
      hasRefreshToken: !!body.refreshToken
    })

    if (!token) {
      return NextResponse.json({ error: 'Spotify access token required' }, { status: 401 })
    }

    if (!songs?.length) {
      return NextResponse.json({ error: 'No songs provided' }, { status: 400 })
    }

    // 1. Get current user's ID
    let userResponse = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    console.log('User profile response:', userResponse.status, userResponse.statusText)
    
    // If token is expired, try to refresh it
    if (userResponse.status === 401) {
      console.log('Token appears to be expired, attempting refresh...')
      // Get refresh token from request body if available
      const { refreshToken } = body
      if (refreshToken) {
        const newToken = await refreshSpotifyToken(refreshToken)
        if (newToken) {
          console.log('Token refreshed successfully')
          token = newToken
          userResponse = await fetch(`${SPOTIFY_API_BASE}/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          console.log('User profile response after refresh:', userResponse.status, userResponse.statusText)
        } else {
          console.log('Token refresh failed')
        }
      } else {
        console.log('No refresh token available')
      }
    }
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('Failed to get Spotify user profile:', userResponse.status, errorText)
      
      if (userResponse.status === 401) {
        return NextResponse.json({ 
          error: 'Spotify token expired or invalid. Please reconnect your account.',
          details: 'Token authentication failed'
        }, { status: 401 })
      }
      
      throw new Error(`Failed to get Spotify user profile: ${userResponse.status} ${errorText}`)
    }
    
    const userData = await userResponse.json()
    const userId = userData.id
    console.log('User ID retrieved:', userId)

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

    console.log('Playlist creation response:', playlistResponse.status, playlistResponse.statusText)

    if (!playlistResponse.ok) {
      const errorText = await playlistResponse.text()
      console.error('Failed to create Spotify playlist:', playlistResponse.status, errorText)
      
      if (playlistResponse.status === 403) {
        return NextResponse.json({ 
          error: 'Insufficient permissions. Please ensure your Spotify account has playlist creation permissions.',
          details: 'Playlist creation permission denied'
        }, { status: 403 })
      }
      
      throw new Error(`Failed to create Spotify playlist: ${playlistResponse.status} ${errorText}`)
    }

    const playlist = await playlistResponse.json()
    console.log('Playlist created:', playlist.id, playlist.name)

    // 3. Search and add tracks
    const trackUris = []
    let searchErrors = []
    
    for (const song of songs) {
      try {
        // Use the spotifyId if available, otherwise search
        if (song.spotifyId) {
          trackUris.push(`spotify:track:${song.spotifyId}`)
          console.log('Using existing spotifyId for:', song.title)
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
              console.log('Found track for:', song.title)
            } else {
              searchErrors.push(`No match found for: ${song.title} - ${song.artist}`)
              console.log('No match found for:', song.title)
            }
          } else {
            const errorText = await searchResponse.text()
            searchErrors.push(`Search failed for ${song.title}: ${searchResponse.status} ${errorText}`)
            console.log('Search failed for:', song.title, searchResponse.status)
          }
        }
      } catch (error) {
        searchErrors.push(`Error processing ${song.title}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        console.log('Error processing song:', song.title, error)
      }
    }

    console.log('Tracks to add:', trackUris.length, 'out of', songs.length)

    // 4. Add tracks to playlist
    if (trackUris.length > 0) {
      const addTracksResponse = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlist.id}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: trackUris })
      })

      console.log('Add tracks response:', addTracksResponse.status, addTracksResponse.statusText)

      if (!addTracksResponse.ok) {
        const errorText = await addTracksResponse.text()
        console.error('Failed to add tracks to playlist:', addTracksResponse.status, errorText)
        
        if (addTracksResponse.status === 403) {
          return NextResponse.json({ 
            error: 'Insufficient permissions to add tracks to playlist. Please check your Spotify account permissions.',
            details: 'Track addition permission denied'
          }, { status: 403 })
        }
        
        throw new Error(`Failed to add tracks to playlist: ${addTracksResponse.status} ${errorText}`)
      }
    }

    const result = {
      success: true,
      playlistUrl: playlist.external_urls.spotify,
      tracksAdded: trackUris.length,
      totalSongs: songs.length,
      searchErrors: searchErrors.length > 0 ? searchErrors : undefined
    }

    console.log('Export completed successfully:', result)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Error exporting to Spotify:', error)
    return NextResponse.json({ 
      error: 'Failed to export playlist',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}