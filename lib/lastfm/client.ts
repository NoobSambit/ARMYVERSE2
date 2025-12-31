// Last.fm API Client with Rate Limiting

import {
  LastFmUserResponse,
  LastFmRecentTracksResponse,
  LastFmTopTracksResponse,
  LastFmTopArtistsResponse,
  LastFmTopAlbumsResponse,
  LastFmWeeklyChartListResponse,
  LastFmWeeklyTrackChartResponse,
  LastFmErrorResponse,
  LastFmRecentTracksOptions,
  LastFmTopOptions,
  LastFmUser,
  LastFmTrack,
  LastFmTopTrack,
  LastFmTopArtist,
  LastFmTopAlbum,
  LastFmWeeklyChart,
  LastFmWeeklyTrackChart,
} from './types'

const BASE_URL = 'https://ws.audioscrobbler.com/2.0/'

// Rate limiter using token bucket algorithm
class RateLimiter {
  private tokens: number
  private lastRefill: number
  private readonly maxTokens = 5
  private readonly refillRate = 5 // tokens per second
  private readonly windowMs = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.tokens = this.maxTokens
    this.lastRefill = Date.now()
  }

  private refill() {
    const now = Date.now()
    const timePassed = now - this.lastRefill
    const tokensToAdd = (timePassed / 1000) * this.refillRate

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
    this.lastRefill = now
  }

  async acquire(): Promise<void> {
    this.refill()

    if (this.tokens >= 1) {
      this.tokens -= 1
      return
    }

    // Wait until we have a token
    const waitTime = ((1 - this.tokens) / this.refillRate) * 1000
    await new Promise(resolve => setTimeout(resolve, waitTime))

    this.refill()
    this.tokens -= 1
  }
}

export class LastFmClient {
  private apiKey: string
  private rateLimiter: RateLimiter

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.LASTFM_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Last.fm API key not provided. API calls will fail.')
    }
    this.rateLimiter = new RateLimiter()
  }

  private async fetchWithRateLimit<T>(
    params: Record<string, string | number>
  ): Promise<T> {
    await this.rateLimiter.acquire()

    const url = new URL(BASE_URL)
    url.searchParams.append('api_key', this.apiKey)
    url.searchParams.append('format', 'json')

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })

    try {
      const response = await fetch(url.toString())
      const data = await response.json()

      // Check for Last.fm API errors
      if ('error' in data) {
        const error = data as LastFmErrorResponse
        throw new Error(`Last.fm API Error ${error.error}: ${error.message}`)
      }

      return data as T
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to fetch from Last.fm API')
    }
  }

  async getUserInfo(username: string): Promise<LastFmUser> {
    const response = await this.fetchWithRateLimit<LastFmUserResponse>({
      method: 'user.getinfo',
      user: username,
    })
    return response.user
  }

  async getRecentTracks(
    username: string,
    options: LastFmRecentTracksOptions = {}
  ): Promise<{ tracks: LastFmTrack[]; total: number }> {
    const response = await this.fetchWithRateLimit<LastFmRecentTracksResponse>({
      method: 'user.getrecenttracks',
      user: username,
      limit: options.limit || 50,
      page: options.page || 1,
      from: options.from,
      to: options.to,
      extended: options.extended || 0,
    })

    return {
      tracks: response.recenttracks.track,
      total: parseInt(response.recenttracks['@attr'].total),
    }
  }

  async getTopTracks(
    username: string,
    options: LastFmTopOptions = {}
  ): Promise<{ tracks: LastFmTopTrack[]; total: number }> {
    const response = await this.fetchWithRateLimit<LastFmTopTracksResponse>({
      method: 'user.gettoptracks',
      user: username,
      period: options.period || 'overall',
      limit: options.limit || 50,
      page: options.page || 1,
    })

    return {
      tracks: response.toptracks.track,
      total: parseInt(response.toptracks['@attr'].total),
    }
  }

  async getTopArtists(
    username: string,
    options: LastFmTopOptions = {}
  ): Promise<{ artists: LastFmTopArtist[]; total: number }> {
    const response = await this.fetchWithRateLimit<LastFmTopArtistsResponse>({
      method: 'user.gettopartists',
      user: username,
      period: options.period || 'overall',
      limit: options.limit || 50,
      page: options.page || 1,
    })

    return {
      artists: response.topartists.artist,
      total: parseInt(response.topartists['@attr'].total),
    }
  }

  async getTopAlbums(
    username: string,
    options: LastFmTopOptions = {}
  ): Promise<{ albums: LastFmTopAlbum[]; total: number }> {
    const response = await this.fetchWithRateLimit<LastFmTopAlbumsResponse>({
      method: 'user.gettopalbums',
      user: username,
      period: options.period || 'overall',
      limit: options.limit || 50,
      page: options.page || 1,
    })

    return {
      albums: response.topalbums.album,
      total: parseInt(response.topalbums['@attr'].total),
    }
  }

  async getWeeklyChartList(username: string): Promise<LastFmWeeklyChart[]> {
    const response = await this.fetchWithRateLimit<LastFmWeeklyChartListResponse>({
      method: 'user.getweeklychartlist',
      user: username,
    })

    return response.weeklychartlist.chart
  }

  async getWeeklyTrackChart(
    username: string,
    from: string,
    to: string
  ): Promise<LastFmWeeklyTrackChart[]> {
    const response = await this.fetchWithRateLimit<LastFmWeeklyTrackChartResponse>({
      method: 'user.getweeklytrackchart',
      user: username,
      from,
      to,
    })

    return response.weeklytrackchart.track || []
  }

  // Utility method to get image URL with fallback
  static getImageUrl(images: { '#text': string; size: string }[] | undefined, fallback: string = ''): string {
    if (!images || images.length === 0) return fallback

    const priority = ['extralarge', 'large', 'medium', 'small']
    for (const size of priority) {
      const img = images.find(i => i.size === size)
      if (img && img['#text']) return img['#text']
    }

    return fallback
  }
}

// Export singleton instance
let lastFmClient: LastFmClient | null = null

export function getLastFmClient(): LastFmClient {
  if (!lastFmClient) {
    lastFmClient = new LastFmClient()
  }
  return lastFmClient
}
