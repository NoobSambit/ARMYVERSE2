export function buildSpotifyLink(spotifyId?: string, title?: string, artist?: string) {
  if (spotifyId) return `https://open.spotify.com/track/${spotifyId}`
  const q = encodeURIComponent([title, artist, 'BTS'].filter(Boolean).join(' '))
  return `https://open.spotify.com/search/${q}`
}

export function buildYouTubeLink(videoId?: string, title?: string) {
  if (videoId) return `https://www.youtube.com/watch?v=${videoId}`
  const q = encodeURIComponent([title, 'BTS'].filter(Boolean).join(' '))
  return `https://www.youtube.com/results?search_query=${q}`
}


