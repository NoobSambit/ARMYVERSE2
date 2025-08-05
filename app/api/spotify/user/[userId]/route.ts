import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    
    // Get Spotify token from localStorage (this would be handled by middleware in production)
    // For now, we'll use a mock response or get from session
    
    // Mock user profile for testing
    const userProfile = {
      id: userId,
      display_name: 'Spotify User',
      email: 'user@example.com',
      images: [
        {
          url: 'https://via.placeholder.com/150',
          height: 150,
          width: 150
        }
      ],
      followers: {
        total: 0
      },
      external_urls: {
        spotify: 'https://open.spotify.com/user/' + userId
      },
      href: 'https://api.spotify.com/v1/users/' + userId,
      type: 'user',
      uri: 'spotify:user:' + userId,
      created_at: new Date().toISOString()
    }
    
    return NextResponse.json(userProfile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
} 