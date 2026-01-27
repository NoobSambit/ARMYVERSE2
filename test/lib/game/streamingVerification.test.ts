import { getRecentBTSTracks, normalizeTrackName, verifyStreamingQuest } from '@/lib/game/streamingVerification'
import { getLastFmClient } from '@/lib/lastfm/client'
import { isBTSTrack } from '@/lib/music/bts-detection'
import { UserQuestProgress } from '@/lib/models/UserQuestProgress'

jest.mock('@/lib/lastfm/client', () => ({
  getLastFmClient: jest.fn()
}))

jest.mock('@/lib/music/bts-detection', () => ({
  isBTSTrack: jest.fn()
}))

jest.mock('@/lib/models/StreamingCache', () => ({
  StreamingCache: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}))

jest.mock('@/lib/models/UserQuestProgress', () => ({
  UserQuestProgress: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}))

describe('streamingVerification', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('paginates Last.fm recent tracks and respects maxPages', async () => {
    ;(isBTSTrack as jest.Mock).mockReturnValue(true)

    const makeTrack = (name: string, uts: number) => ({
      name,
      artist: { name: 'BTS', url: '' },
      url: 'https://example.com',
      date: { uts: String(uts), '#text': '' }
    })

    const page1Tracks = Array.from({ length: 200 }, (_, i) => makeTrack(`Track 1-${i}`, 1700000000 + i))
    const page2Tracks = Array.from({ length: 200 }, (_, i) => makeTrack(`Track 2-${i}`, 1700001000 + i))

    const mockGetRecentTracks = jest.fn(async (_username: string, options: { page?: number }) => {
      const page = options?.page || 1
      if (page === 1) {
        return { tracks: page1Tracks, total: 500, totalPages: 3 }
      }
      if (page === 2) {
        return { tracks: page2Tracks, total: 500, totalPages: 3 }
      }
      return { tracks: [], total: 500, totalPages: 3 }
    })

    ;(getLastFmClient as jest.Mock).mockReturnValue({
      getRecentTracks: mockGetRecentTracks
    })

    const results = await getRecentBTSTracks('user-1', 'tester', new Date('2024-01-01T00:00:00Z'), {
      maxPages: 2,
      label: 'weekly'
    })

    expect(mockGetRecentTracks).toHaveBeenCalledTimes(2)
    expect(results.length).toBe(400)
  })

  it('does not regress track progress when new data is lower', async () => {
    const questDef: any = {
      code: 'stream_daily_songs_2024-01-01',
      period: 'daily',
      goalType: 'stream:songs',
      goalValue: 5,
      streamingMeta: {
        trackTargets: [
          { trackName: 'First Love', artistName: 'BTS', count: 5 }
        ]
      }
    }

    const trackKey = `track:${normalizeTrackName('First Love')}:bts`

    const progressRecord: any = {
      progress: 0,
      completed: false,
      claimed: false,
      trackProgress: new Map([[trackKey, 5]]),
      updatedAt: new Date(),
      save: jest.fn().mockResolvedValue(undefined)
    }

    ;(UserQuestProgress.findOne as jest.Mock).mockResolvedValue(progressRecord)

    await verifyStreamingQuest(
      'user-1',
      'tester',
      questDef,
      '2024-01-01',
      [{ trackName: 'First Love', artistName: 'BTS', count: 3 }]
    )

    expect(progressRecord.progress).toBe(5)
    expect(progressRecord.completed).toBe(true)
    expect((progressRecord.trackProgress as Record<string, number>)[trackKey]).toBe(5)
    expect(progressRecord.save).toHaveBeenCalledTimes(1)
  })

  it('does not regress album track progress when new data is missing', async () => {
    const questDef: any = {
      code: 'stream_weekly_albums_2024-01',
      period: 'weekly',
      goalType: 'stream:albums',
      goalValue: 2,
      streamingMeta: {
        albumTargets: [
          {
            albumName: 'Album X',
            trackCount: 2,
            tracks: [
              { name: 'Song A', artist: 'BTS' },
              { name: 'Song B', artist: 'BTS' }
            ]
          }
        ]
      }
    }

    const trackKey = `album:Album X:${normalizeTrackName('Song A')}`

    const progressRecord: any = {
      progress: 0,
      completed: false,
      claimed: false,
      trackProgress: new Map([[trackKey, 1]]),
      updatedAt: new Date(),
      save: jest.fn().mockResolvedValue(undefined)
    }

    ;(UserQuestProgress.findOne as jest.Mock).mockResolvedValue(progressRecord)

    await verifyStreamingQuest(
      'user-1',
      'tester',
      questDef,
      'weekly-2024-01',
      []
    )

    expect(progressRecord.progress).toBe(1)
    expect(progressRecord.completed).toBe(false)
    expect((progressRecord.trackProgress as Record<string, number>)[trackKey]).toBe(1)
    expect(progressRecord.save).toHaveBeenCalledTimes(1)
  })
})
