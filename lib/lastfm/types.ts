// Last.fm API Type Definitions

export interface LastFmImage {
  '#text': string
  size: 'small' | 'medium' | 'large' | 'extralarge'
}

export interface LastFmUser {
  name: string
  realname: string
  url: string
  image: LastFmImage[]
  playcount: string
  registered: {
    unixtime: string
    '#text': number
  }
  subscriber: '0' | '1'
  country?: string
  age?: string
  gender?: string
}

export interface LastFmArtist {
  name: string
  mbid?: string
  url: string
  image?: LastFmImage[]
  playcount?: string
  '@attr'?: {
    rank?: string
  }
  streamable?: string
}

export interface LastFmAlbum {
  '#text': string
  mbid?: string
}

export interface LastFmTrack {
  name: string
  artist: LastFmArtist | {
    name: string
    mbid?: string
    url: string
  }
  album?: LastFmAlbum | {
    '#text': string
    mbid?: string
  }
  url: string
  image?: LastFmImage[]
  date?: {
    uts: string
    '#text': string
  }
  '@attr'?: {
    nowplaying?: 'true'
    rank?: string
  }
  playcount?: string
  duration?: string
  loved?: '0' | '1'
}

export interface LastFmTopTrack extends LastFmTrack {
  playcount: string
  '@attr': {
    rank: string
  }
}

export interface LastFmTopArtist {
  name: string
  playcount: string
  mbid?: string
  url: string
  streamable: string
  image: LastFmImage[]
  '@attr': {
    rank: string
  }
}

export interface LastFmTopAlbum {
  name: string
  playcount: string
  mbid?: string
  url: string
  artist: {
    name: string
    mbid?: string
    url: string
  }
  image: LastFmImage[]
  '@attr': {
    rank: string
  }
}

export interface LastFmWeeklyChart {
  from: string
  to: string
}

export interface LastFmWeeklyTrackChart {
  name: string
  mbid?: string
  playcount: string
  url: string
  artist: {
    '#text': string
    mbid?: string
  }
  '@attr': {
    rank: string
  }
}

// BTS-specific types
export interface BTSMemberPreference {
  member: 'RM' | 'Jin' | 'Suga' | 'J-Hope' | 'Jimin' | 'V' | 'Jungkook'
  plays: number
}

export interface TimelineEntry {
  date: Date
  plays: number
  topTrack: string | null
  topMember: string | null
}

export interface BTSTimeline {
  firstPlay: Date | null
  evolution: TimelineEntry[]
  totalPlays: number
  peakPeriod: {
    date: Date
    plays: number
  } | null
  favoriteEra: {
    album: string
    plays: number
  } | null
}

// API Response wrappers
export interface LastFmUserResponse {
  user: LastFmUser
}

export interface LastFmRecentTracksResponse {
  recenttracks: {
    track: LastFmTrack[] | LastFmTrack | undefined // Can be array, single object, or undefined
    '@attr'?: {
      user: string
      totalPages: string
      page: string
      perPage: string
      total: string
    }
  }
}

export interface LastFmTopTracksResponse {
  toptracks: {
    track: LastFmTopTrack[] | LastFmTopTrack | undefined // Can be array, single object, or undefined
    '@attr'?: {
      user: string
      totalPages: string
      page: string
      perPage: string
      total: string
    }
  }
}

export interface LastFmTopArtistsResponse {
  topartists: {
    artist: LastFmTopArtist[]
    '@attr': {
      user: string
      totalPages: string
      page: string
      perPage: string
      total: string
    }
  }
}

export interface LastFmTopAlbumsResponse {
  topalbums: {
    album: LastFmTopAlbum[]
    '@attr': {
      user: string
      totalPages: string
      page: string
      perPage: string
      total: string
    }
  }
}

export interface LastFmWeeklyChartListResponse {
  weeklychartlist: {
    chart: LastFmWeeklyChart[]
    '@attr': {
      user: string
    }
  }
}

export interface LastFmWeeklyTrackChartResponse {
  weeklytrackchart: {
    track: LastFmWeeklyTrackChart[]
    '@attr': {
      user: string
      from: string
      to: string
    }
  }
}

export interface LastFmErrorResponse {
  error: number
  message: string
}

// Time periods supported by Last.fm
export type LastFmPeriod = 'overall' | '7day' | '1month' | '3month' | '6month' | '12month'

// Request options
export interface LastFmRecentTracksOptions {
  limit?: number
  from?: number
  to?: number
  page?: number
  extended?: 0 | 1
}

export interface LastFmTopOptions {
  period?: LastFmPeriod
  limit?: number
  page?: number
}
