import { ArtistSongsGroup, ArtistAlbumsGroup, RankRow, StreamRow, AlbumRow } from './kworbTypes'

export interface ArtistMetadata {
  spotifyId: string
  imageUrl: string
  fetchedAt: Date
}

export interface KworbSnapshotDocument {
  _id: string
  dateKey: string
  songsByArtist: ArtistSongsGroup[]
  albumsByArtist: ArtistAlbumsGroup[]
  daily200: RankRow[]
  artistsAllTime: RankRow[]
  monthlyListeners: RankRow[]
  songs?: StreamRow[]
  albums?: AlbumRow[]
  artistMetadata?: Record<string, ArtistMetadata>
  createdAt: Date
  updatedAt: Date
}

export interface ChangeData {
  songsByArtist: Record<string, {
    streamsChange: number
    dailyChange: number
    tracksChange: number
  }>
  totalSongs: number
  totalAlbums: number
  daily200Entries: number
  daily200: Record<string, { rankChange: number, streamsChange: number }>
  artistsAllTime: Record<string, { rankChange: number }>
  monthlyListeners: Record<string, { rankChange: number }>
}

export interface SnapshotComparison {
  ok: boolean
  snapshot: KworbSnapshotDocument
  changes24h: ChangeData | null
  changes7d: ChangeData | null
  meta: {
    currentDate: string
    date24h: string | null
    date7d: string | null
  }
}
