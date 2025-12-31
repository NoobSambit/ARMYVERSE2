// BTS Timeline Calculation Logic

import { LastFmClient } from '../lastfm/client'
import { BTSTimeline, TimelineEntry, LastFmWeeklyChart } from '../lastfm/types'
import { isBTSTrack, getFavoriteBTSAlbum } from './bts-detection'

/**
 * Samples weekly charts to reduce API calls
 * Takes every 4th week to balance granularity with performance
 */
function sampleWeeks(charts: LastFmWeeklyChart[], startIndex: number = 0): LastFmWeeklyChart[] {
  const sampled: LastFmWeeklyChart[] = []

  for (let i = startIndex; i < charts.length; i += 4) {
    sampled.push(charts[i])
  }

  // Always include the last week if not already sampled
  const lastChart = charts[charts.length - 1]
  if (sampled.length === 0 || sampled[sampled.length - 1] !== lastChart) {
    sampled.push(lastChart)
  }

  return sampled
}

/**
 * Binary search to find the first week with BTS content
 * This optimizes the timeline calculation by not processing weeks before user discovered BTS
 */
async function binarySearchFirstBTS(
  client: LastFmClient,
  username: string,
  charts: LastFmWeeklyChart[]
): Promise<number> {
  if (charts.length === 0) return 0

  let left = 0
  let right = charts.length - 1
  let firstBTSIndex = charts.length

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const chart = charts[mid]

    try {
      const tracks = await client.getWeeklyTrackChart(username, chart.from, chart.to)
      const hasBTS = tracks.some(track => isBTSTrack(track))

      if (hasBTS) {
        firstBTSIndex = mid
        right = mid - 1 // Look for earlier BTS content
      } else {
        left = mid + 1 // Look later
      }
    } catch (error) {
      console.error(`Error fetching weekly chart at index ${mid}:`, error)
      // If error, default to searching earlier
      right = mid - 1
    }
  }

  return firstBTSIndex
}

/**
 * Detects the top member from BTS tracks in a time period
 */
function detectTopMember(tracks: any[]): string | null {
  const memberCounts: Record<string, number> = {}

  for (const track of tracks) {
    if (isBTSTrack(track) === 'solo') {
      const member = detectMember(track)
      if (member) {
        const playcount = track.playcount ? parseInt(track.playcount) : 1
        memberCounts[member] = (memberCounts[member] || 0) + playcount
      }
    }
  }

  // Find member with most plays
  let topMember: string | null = null
  let maxPlays = 0

  for (const [member, plays] of Object.entries(memberCounts)) {
    if (plays > maxPlays) {
      maxPlays = plays
      topMember = member
    }
  }

  return topMember
}

/**
 * Builds BTS listening timeline from Last.fm weekly charts
 */
export async function buildBTSTimeline(
  username: string,
  client: LastFmClient
): Promise<BTSTimeline> {
  try {
    // 1. Get all weekly charts
    const charts = await client.getWeeklyChartList(username)

    if (charts.length === 0) {
      return {
        firstPlay: null,
        evolution: [],
        totalPlays: 0,
        peakPeriod: null,
        favoriteEra: null,
      }
    }

    // 2. Binary search for first BTS play
    const firstBTSIndex = await binarySearchFirstBTS(client, username, charts)

    if (firstBTSIndex >= charts.length) {
      // No BTS content found
      return {
        firstPlay: null,
        evolution: [],
        totalPlays: 0,
        peakPeriod: null,
        favoriteEra: null,
      }
    }

    // 3. Sample weeks starting from first BTS play
    const sampled = sampleWeeks(charts, firstBTSIndex)

    // 4. Fetch BTS data for each sampled week
    const evolution: TimelineEntry[] = []
    const allBTSTracks: any[] = []

    for (const week of sampled) {
      try {
        const tracks = await client.getWeeklyTrackChart(username, week.from, week.to)
        const btsTracks = tracks.filter(track => isBTSTrack(track))

        const plays = btsTracks.reduce((sum, track) => {
          return sum + (track.playcount ? parseInt(track.playcount) : 1)
        }, 0)

        const topTrack = btsTracks.length > 0 ? btsTracks[0].name : null
        const topMember = detectTopMember(btsTracks)

        evolution.push({
          date: new Date(parseInt(week.from) * 1000),
          plays,
          topTrack,
          topMember,
        })

        // Collect all BTS tracks for album analysis
        allBTSTracks.push(...btsTracks)
      } catch (error) {
        console.error(`Error fetching week ${week.from}-${week.to}:`, error)
        // Continue with other weeks even if one fails
      }
    }

    // 5. Calculate insights
    const totalPlays = evolution.reduce((sum, entry) => sum + entry.plays, 0)

    // Find peak period
    let peakPeriod: { date: Date; plays: number } | null = null
    let maxPlays = 0

    for (const entry of evolution) {
      if (entry.plays > maxPlays) {
        maxPlays = entry.plays
        peakPeriod = {
          date: entry.date,
          plays: entry.plays,
        }
      }
    }

    // Determine favorite era/album
    const favoriteAlbum = getFavoriteBTSAlbum(allBTSTracks)
    const favoriteEra = favoriteAlbum && favoriteAlbum !== 'Unknown'
      ? {
          album: favoriteAlbum,
          plays: allBTSTracks.filter(t => {
            const album = t.album?.['#text'] || t.album
            return album === favoriteAlbum
          }).reduce((sum, t) => sum + (t.playcount ? parseInt(t.playcount) : 1), 0),
        }
      : null

    const firstPlay = evolution.length > 0 ? evolution[0].date : null

    return {
      firstPlay,
      evolution,
      totalPlays,
      peakPeriod,
      favoriteEra,
    }
  } catch (error) {
    console.error('Error building BTS timeline:', error)
    throw error
  }
}

/**
 * Simpler version that gets timeline from top tracks instead of weekly charts
 * Use this as fallback if weekly charts are not available or too expensive
 */
export async function buildSimpleBTSTimeline(
  username: string,
  client: LastFmClient
): Promise<BTSTimeline> {
  try {
    // Get top tracks for all time
    const { tracks } = await client.getTopTracks(username, { limit: 200, period: 'overall' })

    const btsTracks = tracks.filter(track => isBTSTrack(track))

    if (btsTracks.length === 0) {
      return {
        firstPlay: null,
        evolution: [],
        totalPlays: 0,
        peakPeriod: null,
        favoriteEra: null,
      }
    }

    // Calculate total plays
    const totalPlays = btsTracks.reduce((sum, track) => {
      return sum + (track.playcount ? parseInt(track.playcount) : 0)
    }, 0)

    // Get favorite album
    const favoriteAlbum = getFavoriteBTSAlbum(btsTracks)
    const favoriteEra = favoriteAlbum && favoriteAlbum !== 'Unknown'
      ? {
          album: favoriteAlbum,
          plays: btsTracks.filter(t => {
            const album = t.album?.['#text'] || ''
            return album === favoriteAlbum
          }).reduce((sum, t) => sum + parseInt(t.playcount || '0'), 0),
        }
      : null

    // Create simple evolution (we don't have time-series data in this version)
    return {
      firstPlay: null, // Can't determine from top tracks
      evolution: [],
      totalPlays,
      peakPeriod: null,
      favoriteEra,
    }
  } catch (error) {
    console.error('Error building simple BTS timeline:', error)
    throw error
  }
}
