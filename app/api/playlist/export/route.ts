import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'
const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'

type SpotifyProfile = {
  id: string
  display_name?: string
  email?: string
}

function getBearerFromRequest(req: Request): string | null {
  const auth = req.headers.get('authorization') || req.headers.get('Authorization')
  if (!auth) return null
  const parts = auth.split(' ')
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer' && parts[1]) {
    return parts[1]
  }
  return null
}

async function getUserProfileFromToken(userAccessToken: string): Promise<SpotifyProfile | null> {
  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: { Authorization: `Bearer ${userAccessToken}` }
    })
    if (!res.ok) return null
    const profile = await res.json() as SpotifyProfile
    if (!profile?.id) return null
    return profile
  } catch {
    return null
  }
}

async function getOwnerAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_PLAYLIST_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Spotify export credentials not configured')
  }

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Failed to refresh Spotify token:', response.status, errorText)
    throw new Error('Failed to refresh Spotify token')
  }

  const data = await response.json() as { access_token?: string }

  if (!data.access_token) {
    throw new Error('Spotify token refresh response missing access_token')
  }

  return data.access_token
}

async function getOwnerUserId(accessToken: string): Promise<string> {
  const configuredUserId = process.env.SPOTIFY_PLAYLIST_OWNER_ID
  if (configuredUserId) {
    return configuredUserId
  }

  const profileResponse = await fetch(`${SPOTIFY_API_BASE}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  if (!profileResponse.ok) {
    const errorText = await profileResponse.text()
    console.error('Failed to fetch Spotify owner profile:', profileResponse.status, errorText)
    throw new Error('Failed to determine Spotify owner user id')
  }

  const profile = await profileResponse.json() as { id?: string }

  if (!profile.id) {
    throw new Error('Spotify owner profile missing id')
  }

  return profile.id
}

// Expose a lightweight diagnostics endpoint for internal checks
export async function GET(req: Request) {
  try {
    // Prefer user token diagnostics when provided
    const maybeUserToken = getBearerFromRequest(req)
    if (maybeUserToken) {
      const userProfile = await getUserProfileFromToken(maybeUserToken)
      if (userProfile) {
        console.log('Spotify export diagnostics: mode=user, userId=', userProfile.id)
        return NextResponse.json({
          tokenValid: true,
          mode: 'user',
          userData: userProfile
        })
      } else {
        return NextResponse.json({ error: 'Invalid or expired user token' }, { status: 401 })
      }
    }

    // Fall back to owner diagnostics
    const accessToken = await getOwnerAccessToken()
    const userId = await getOwnerUserId(accessToken)

    console.log('Spotify export diagnostics: mode=owner, ownerUserId=', userId)
    return NextResponse.json({ tokenValid: true, mode: 'owner', ownerUserId: userId })
  } catch (error) {
    console.error('Spotify export diagnostics failed:', error)
    return NextResponse.json({
      error: 'Diagnostics failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, songs } = body

    if (!songs?.length) {
      return NextResponse.json({ error: 'No songs provided' }, { status: 400 })
    }

    // Determine mode: user (if a valid Spotify user token is provided) or owner
    let mode: 'user' | 'owner' = 'owner'
    let actingAccessToken: string
    let targetUserId: string

    const maybeUserToken = getBearerFromRequest(req)
    if (maybeUserToken) {
      const userProfile = await getUserProfileFromToken(maybeUserToken)
      if (userProfile?.id) {
        mode = 'user'
        actingAccessToken = maybeUserToken
        targetUserId = userProfile.id
        console.log('Export mode=user; target userId:', targetUserId)
      } else {
        return NextResponse.json({ error: 'Unauthorized: invalid or expired user token' }, { status: 401 })
      }
    } else {
      // No user token provided, use owner
      actingAccessToken = await getOwnerAccessToken()
      targetUserId = await getOwnerUserId(actingAccessToken)
      console.log('Export mode=owner; owner userId:', targetUserId)
    }

    // 2. Create new playlist in the appropriate account
    const playlistResponse = await fetch(`${SPOTIFY_API_BASE}/users/${targetUserId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${actingAccessToken}`,
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
              headers: { 'Authorization': `Bearer ${actingAccessToken}` }
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
          'Authorization': `Bearer ${actingAccessToken}`,
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

    const result: any = {
      success: true,
      playlistUrl: playlist.external_urls.spotify,
      tracksAdded: trackUris.length,
      totalSongs: songs.length,
      searchErrors: searchErrors.length > 0 ? searchErrors : undefined,
      mode
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