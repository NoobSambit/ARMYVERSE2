export type StreamRow = {
  name: string
  artist?: string
  album?: string
  totalStreams: number
  dailyGain?: number
  url?: string
  albumArt?: string
}

export type RankRow = {
  rank: number
  artist: string
  name?: string
  streams?: number
  listeners?: number
  daily?: number // Daily gain for artistsAllTime
  dailyChange?: number // Daily +/- for monthlyListeners
  url?: string
}

export type ArtistTotals = {
  streams: number
  daily: number
  tracks: number
}

export type ArtistSongsGroup = {
  artist: string
  pageUrl: string
  totals: ArtistTotals
  songs: StreamRow[]
}

export type AlbumRow = {
  name: string
  totalStreams: number
  dailyGain?: number
  url?: string
}

export type ArtistAlbumsGroup = {
  artist: string
  pageUrl: string
  totals: ArtistTotals
  albums: AlbumRow[]
}


