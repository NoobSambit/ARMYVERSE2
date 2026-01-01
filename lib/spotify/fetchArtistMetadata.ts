import { ArtistMetadata } from './kworbSnapshotTypes'

const KNOWN_ARTISTS: Record<string, string> = {
  'BTS': '3Nrfpe0tUJi4K4DXYWgMUX',
  'Jin': '5vV3bFXnN6D6N3Nj4xRvaV',
  'Jungkook': '6HaGTQPmzraVmaVxvz6EUc',
  'J-Hope': '0b1sIQumIAsNbqAoIClSpy',
  'Suga': '0ebNdVaOfp6N0oZ1guIxM8',
  'Agust D': '5RmQ8k4l3HZ8JoPb4mNsML',
  'RM': '2auC28zjQyVTsiZKNgPRGs',
  'Jimin': '1oSPZhvZMIrWW5I41kPkkY',
  'V': '3JsHnjpbhX4SnySpvpa9DK'
}

async function getSpotifyToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing Spotify client credentials')
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    throw new Error(`Failed to get Spotify token: ${response.status}`)
  }

  const data = await response.json()
  return data.access_token
}

async function fetchArtistFromSpotify(artistId: string, token: string): Promise<{ id: string, imageUrl: string } | null> {
  try {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return {
      id: data.id,
      imageUrl: data.images?.[0]?.url || ''
    }
  } catch (err) {
    console.error(`Failed to fetch artist ${artistId}:`, err)
    return null
  }
}

async function searchArtistByName(artistName: string, token: string): Promise<{ id: string, imageUrl: string } | null> {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const artist = data.artists?.items?.[0]

    if (!artist) {
      return null
    }

    return {
      id: artist.id,
      imageUrl: artist.images?.[0]?.url || ''
    }
  } catch (err) {
    console.error(`Failed to search for artist ${artistName}:`, err)
    return null
  }
}

export async function fetchArtistMetadata(artistNames: string[]): Promise<Record<string, ArtistMetadata>> {
  const metadata: Record<string, ArtistMetadata> = {}

  try {
    const token = await getSpotifyToken()

    for (const artistName of artistNames) {
      try {
        let result: { id: string, imageUrl: string } | null = null

        // Try known artist ID first
        const knownId = KNOWN_ARTISTS[artistName]
        if (knownId) {
          result = await fetchArtistFromSpotify(knownId, token)
        }

        // Fallback to search if not found
        if (!result) {
          result = await searchArtistByName(artistName, token)
        }

        if (result) {
          metadata[artistName] = {
            spotifyId: result.id,
            imageUrl: result.imageUrl,
            fetchedAt: new Date()
          }
        }

        // Rate limit: 50ms delay between requests
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch (err) {
        console.error(`Error fetching metadata for ${artistName}:`, err)
        // Continue to next artist
      }
    }
  } catch (err) {
    console.error('Failed to get Spotify token:', err)
  }

  return metadata
}
