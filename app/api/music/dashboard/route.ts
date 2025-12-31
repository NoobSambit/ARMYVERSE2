// Music Dashboard API Route - Aggregates all Last.fm data

import { NextRequest, NextResponse } from 'next/server'
import { getLastFmClient, LastFmClient } from '@/lib/lastfm/client'
import {
  filterBTSTracks,
  calculateMemberPreference,
  getFavoriteBTSAlbum,
  calculateBTSPlays,
  calculateBTSPercentage,
} from '@/lib/music/bts-detection'
import { buildSimpleBTSTimeline } from '@/lib/music/timeline'
import { LastFmPeriod } from '@/lib/lastfm/types'

export interface MusicDashboardData {
  userProfile: {
    name: string
    realname: string
    url: string
    image: string
    playcount: number
    registered: Date
    accountAge: string
  }
  overview: {
    totalTracks: number
    totalArtists: number
    totalListeningTime: number
    btsPlays: number
    btsPercentage: number
    accountAge: string
  }
  recentTracks: any[]
  topArtists: any[]
  topTracks: any[]
  topAlbums: any[]
  btsAnalytics: {
    totalBTSPlays: number
    favoriteBTSAlbum: string
    memberPreference: Array<{ member: string; plays: number }>
    btsTracks: any[]
    soloTracks: any[]
  }
  btsTimeline: {
    firstPlay: Date | null
    evolution: Array<{ date: Date; plays: number; topTrack: string | null; topMember: string | null }>
    totalPlays: number
    peakPeriod: { date: Date; plays: number } | null
    favoriteEra: { album: string; plays: number } | null
  } | null
}

function calculateAccountAge(registeredTimestamp: number): string {
  const registered = new Date(registeredTimestamp * 1000)
  const now = new Date()
  const diffMs = now.getTime() - registered.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 30) {
    return `${diffDays} days`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months > 1 ? 's' : ''}`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years} year${years > 1 ? 's' : ''}`
  }
}

async function fetchDashboardData(
  username: string,
  period: LastFmPeriod = 'overall'
): Promise<MusicDashboardData> {
  const client = getLastFmClient()

  try {
    // Fetch all data in parallel where possible
    const [userInfo, recentTracksData, topTracksData, topArtistsData, topAlbumsData] = await Promise.all([
      client.getUserInfo(username),
      client.getRecentTracks(username, { limit: 50 }),
      client.getTopTracks(username, { limit: 200, period }),
      client.getTopArtists(username, { limit: 50, period }),
      client.getTopAlbums(username, { limit: 50, period }),
    ])

    // Calculate BTS analytics
    const { groupTracks, soloTracks } = filterBTSTracks(topTracksData.tracks)
    const memberPreference = calculateMemberPreference(topTracksData.tracks)
    const favoriteBTSAlbum = getFavoriteBTSAlbum(topTracksData.tracks)
    const totalBTSPlays = calculateBTSPlays(topTracksData.tracks)
    const totalPlaycount = parseInt(userInfo.playcount)
    const btsPercentage = calculateBTSPercentage(totalBTSPlays, totalPlaycount)

    // Calculate listening time (estimate: average song ~3 minutes)
    const totalListeningTime = Math.floor((totalPlaycount * 3) / 60) // in hours

    // Build BTS timeline (this is expensive, so we'll do it async or cache it)
    let btsTimeline = null
    try {
      // Use simple timeline for now to avoid too many API calls
      btsTimeline = await buildSimpleBTSTimeline(username, client)
    } catch (error) {
      console.error('Error building BTS timeline:', error)
    }

    // Prepare response
    const accountAge = calculateAccountAge(parseInt(userInfo.registered.unixtime))

    return {
      userProfile: {
        name: userInfo.name,
        realname: userInfo.realname,
        url: userInfo.url,
        image: LastFmClient.getImageUrl(userInfo.image, '/default-avatar.png'),
        playcount: totalPlaycount,
        registered: new Date(parseInt(userInfo.registered.unixtime) * 1000),
        accountAge,
      },
      overview: {
        totalTracks: topTracksData.total,
        totalArtists: topArtistsData.total,
        totalListeningTime,
        btsPlays: totalBTSPlays,
        btsPercentage,
        accountAge,
      },
      recentTracks: recentTracksData.tracks.slice(0, 50),
      topArtists: topArtistsData.artists,
      topTracks: topTracksData.tracks,
      topAlbums: topAlbumsData.albums,
      btsAnalytics: {
        totalBTSPlays,
        favoriteBTSAlbum,
        memberPreference,
        btsTracks: groupTracks.slice(0, 20),
        soloTracks: soloTracks.slice(0, 20),
      },
      btsTimeline,
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, period = 'overall' } = body

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Validate period
    const validPeriods: LastFmPeriod[] = ['overall', '7day', '1month', '3month', '6month', '12month']
    const selectedPeriod = validPeriods.includes(period) ? period : 'overall'

    const data = await fetchDashboardData(username, selectedPeriod)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Dashboard API error:', error)

    if (error instanceof Error) {
      // Check for Last.fm specific errors
      if (error.message.includes('User not found')) {
        return NextResponse.json(
          { error: 'Last.fm user not found. Please check the username.' },
          { status: 404 }
        )
      }

      if (error.message.includes('Invalid API key')) {
        return NextResponse.json(
          { error: 'Last.fm API configuration error' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
