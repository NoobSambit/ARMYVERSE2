// Utility to map Last.fm data to component-compatible formats

import { LastFmClient } from '../lastfm/client'
import { LastFmTrack, LastFmTopTrack, LastFmTopArtist } from '../lastfm/types'

/**
 * Maps Last.fm track to a format compatible with existing components
 */
export function mapLastFmTrack(track: LastFmTrack | LastFmTopTrack): any {
  const artistName = typeof track.artist === 'string'
    ? track.artist
    : 'name' in track.artist
    ? track.artist.name
    : ''

  const albumName = track.album
    ? typeof track.album === 'string'
      ? track.album
      : '#text' in track.album
      ? track.album['#text']
      : ''
    : ''

  const image = track.image
    ? LastFmClient.getImageUrl(track.image, 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=300')
    : 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=300'

  return {
    id: track.url || track.name,
    name: track.name,
    artists: [{
      id: artistName,
      name: artistName
    }],
    artist: artistName,
    album: {
      id: albumName,
      name: albumName,
      '#text': albumName,
      images: track.image ? [{ url: image }] : []
    },
    image,
    url: track.url,
    external_urls: {
      lastfm: track.url
    },
    playcount: 'playcount' in track ? track.playcount : undefined,
    date: 'date' in track && track.date ? track.date : undefined,
    '@attr': track['@attr'],
    nowplaying: track['@attr']?.nowplaying === 'true'
  }
}

/**
 * Maps Last.fm artist to a format compatible with existing components
 */
export function mapLastFmArtist(artist: LastFmTopArtist): any {
  const image = LastFmClient.getImageUrl(
    artist.image,
    'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=300'
  )

  return {
    id: artist.url || artist.name,
    name: artist.name,
    url: artist.url,
    image,
    images: artist.image ? [{ url: image }] : [],
    playcount: artist.playcount ? parseInt(artist.playcount) : 0,
    rank: artist['@attr']?.rank ? parseInt(artist['@attr'].rank) : 0,
    external_urls: {
      lastfm: artist.url
    }
  }
}
