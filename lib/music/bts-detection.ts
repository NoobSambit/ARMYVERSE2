// BTS Member Detection and Analytics Logic

import { LastFmTrack, LastFmTopTrack, BTSMemberPreference, LastFmWeeklyTrackChart } from '../lastfm/types'

// BTS member aliases (lowercase for case-insensitive matching)
export const BTS_MEMBER_ALIASES: Record<string, string[]> = {
  'RM': [
    'rm',
    'rap monster',
    'rapmonster',
    'rap mon',
    'kim namjoon',
    'namjoon',
    'kim nam-joon',
    'kim nam joon',
  ],
  'Jin': [
    'jin',
    'seokjin',
    'kim seokjin',
    'kim seok-jin',
    'kim seok jin',
  ],
  'Suga': [
    'suga',
    'agust d',
    'agustd',
    'august d',
    'min yoongi',
    'yoongi',
    'min yoon-gi',
    'min yoon gi',
    'daechwita',
  ],
  'J-Hope': [
    'j-hope',
    'jhope',
    'j hope',
    'hobi',
    'jung hoseok',
    'hoseok',
    'jung ho-seok',
    'jung ho seok',
    'hope world',
  ],
  'Jimin': [
    'jimin',
    'park jimin',
    'park ji-min',
    'park ji min',
  ],
  'V': [
    'v',
    'kim taehyung',
    'taehyung',
    'kim tae-hyung',
    'kim tae hyung',
    'tae',
    'taetae',
  ],
  'Jungkook': [
    'jungkook',
    'jung kook',
    'jeon jungkook',
    'jeon jung-kook',
    'jeon jung kook',
    'jk',
    'kookie',
    'golden',
  ],
}

// BTS group identifiers (lowercase)
export const BTS_GROUP_IDENTIFIERS = [
  'bts',
  '방탄소년단',
  'bangtan',
  'bangtan sonyeondan',
  'beyond the scene',
  'bulletproof boy scouts',
  'bangtan boys',
]

type BTSType = 'group' | 'solo' | null

/**
 * Normalizes a string for comparison (lowercase, trim whitespace)
 */
function normalize(str: string): string {
  return str.toLowerCase().trim()
}

/**
 * Extracts artist name from various Last.fm track formats
 */
function getArtistName(track: LastFmTrack | LastFmTopTrack | LastFmWeeklyTrackChart | any): string {
  if (typeof track.artist === 'string') {
    return track.artist
  }
  if (typeof track.artist === 'object') {
    if ('name' in track.artist) {
      return track.artist.name
    }
    if ('#text' in track.artist) {
      return track.artist['#text']
    }
  }
  return ''
}

/**
 * Checks if a track is by BTS (group or solo member)
 */
export function isBTSTrack(track: LastFmTrack | LastFmTopTrack | LastFmWeeklyTrackChart | any): BTSType {
  const artistName = normalize(getArtistName(track))
  const trackName = normalize(track.name || '')

  // Check if it's a BTS group track
  for (const identifier of BTS_GROUP_IDENTIFIERS) {
    if (artistName.includes(identifier)) {
      return 'group'
    }
  }

  // Check if it's a solo member track
  for (const aliases of Object.values(BTS_MEMBER_ALIASES)) {
    for (const alias of aliases) {
      if (artistName.includes(alias)) {
        return 'solo'
      }
    }
  }

  // Check track name for features (e.g., "Song ft. BTS" or "Song (feat. RM)")
  for (const identifier of BTS_GROUP_IDENTIFIERS) {
    if (trackName.includes(identifier) || trackName.includes(`ft. ${identifier}`) || trackName.includes(`feat. ${identifier}`)) {
      return 'group'
    }
  }

  for (const aliases of Object.values(BTS_MEMBER_ALIASES)) {
    for (const alias of aliases) {
      if (trackName.includes(`ft. ${alias}`) || trackName.includes(`feat. ${alias}`)) {
        return 'solo'
      }
    }
  }

  return null
}

/**
 * Detects which BTS member a track belongs to
 */
export function detectMember(track: LastFmTrack | LastFmTopTrack | LastFmWeeklyTrackChart | any): string | null {
  const artistName = normalize(getArtistName(track))
  const trackName = normalize(track.name || '')

  // Check artist name
  for (const [member, aliases] of Object.entries(BTS_MEMBER_ALIASES)) {
    for (const alias of aliases) {
      if (artistName.includes(alias)) {
        return member
      }
    }
  }

  // Check track name for features
  for (const [member, aliases] of Object.entries(BTS_MEMBER_ALIASES)) {
    for (const alias of aliases) {
      if (trackName.includes(`ft. ${alias}`) || trackName.includes(`feat. ${alias}`)) {
        return member
      }
    }
  }

  return null
}

/**
 * Filters tracks to get only BTS tracks
 */
export function filterBTSTracks(tracks: (LastFmTrack | LastFmTopTrack)[]): {
  groupTracks: LastFmTrack[]
  soloTracks: LastFmTrack[]
  allBTSTracks: LastFmTrack[]
} {
  const groupTracks: LastFmTrack[] = []
  const soloTracks: LastFmTrack[] = []

  for (const track of tracks) {
    const btsType = isBTSTrack(track)
    if (btsType === 'group') {
      groupTracks.push(track as LastFmTrack)
    } else if (btsType === 'solo') {
      soloTracks.push(track as LastFmTrack)
    }
  }

  return {
    groupTracks,
    soloTracks,
    allBTSTracks: [...groupTracks, ...soloTracks],
  }
}

/**
 * Calculates member preference from solo tracks
 */
export function calculateMemberPreference(tracks: (LastFmTrack | LastFmTopTrack)[]): BTSMemberPreference[] {
  const memberCounts: Record<string, number> = {
    'RM': 0,
    'Jin': 0,
    'Suga': 0,
    'J-Hope': 0,
    'Jimin': 0,
    'V': 0,
    'Jungkook': 0,
  }

  for (const track of tracks) {
    const btsType = isBTSTrack(track)
    if (btsType === 'solo') {
      const member = detectMember(track)
      if (member && member in memberCounts) {
        // For top tracks, use playcount if available
        if ('playcount' in track && track.playcount) {
          memberCounts[member] += parseInt(track.playcount)
        } else {
          // Otherwise count as 1 play
          memberCounts[member] += 1
        }
      }
    }
  }

  // Convert to array and sort by plays
  const preferences: BTSMemberPreference[] = Object.entries(memberCounts)
    .map(([member, plays]) => ({
      member: member as BTSMemberPreference['member'],
      plays,
    }))
    .sort((a, b) => b.plays - a.plays)

  return preferences
}

/**
 * Gets favorite BTS album from tracks
 */
export function getFavoriteBTSAlbum(tracks: (LastFmTrack | LastFmTopTrack)[]): string {
  const albumCounts: Record<string, number> = {}

  for (const track of tracks) {
    if (isBTSTrack(track)) {
      let albumName = ''

      if (track.album) {
        if (typeof track.album === 'string') {
          albumName = track.album
        } else if (typeof track.album === 'object') {
          albumName = '#text' in track.album ? track.album['#text'] : ''
        }
      }

      if (albumName) {
        const playcount = 'playcount' in track && track.playcount ? parseInt(track.playcount) : 1
        albumCounts[albumName] = (albumCounts[albumName] || 0) + playcount
      }
    }
  }

  // Find album with highest count
  let maxAlbum = 'Unknown'
  let maxCount = 0

  for (const [album, count] of Object.entries(albumCounts)) {
    if (count > maxCount) {
      maxCount = count
      maxAlbum = album
    }
  }

  return maxAlbum
}

/**
 * Calculates total BTS plays from tracks
 */
export function calculateBTSPlays(tracks: (LastFmTrack | LastFmTopTrack)[]): number {
  let total = 0

  for (const track of tracks) {
    if (isBTSTrack(track)) {
      if ('playcount' in track && track.playcount) {
        total += parseInt(track.playcount)
      } else {
        total += 1
      }
    }
  }

  return total
}

/**
 * Calculates BTS percentage of total listening
 */
export function calculateBTSPercentage(btsPlays: number, totalPlays: number): number {
  if (totalPlays === 0) return 0
  return Math.round((btsPlays / totalPlays) * 100)
}
