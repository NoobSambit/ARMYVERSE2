'use client'

import { useState, useEffect, useRef } from 'react'

type Song = {
  rank: number
  title: string
  artist: string
  thumbnail?: string
  views?: number
  dailyStreams?: number
  totalStreams?: number
  yesterday?: number
}

const members = [
  { id: 'all', name: 'All', image: '/profile-icons/7.png' },
  { id: 'RM', name: 'RM', image: '/profile-icons/RM.png' },
  { id: 'Jin', name: 'Jin', image: '/profile-icons/JIN.png' },
  { id: 'Suga', name: 'Suga', image: '/profile-icons/SUGA.png' },
  { id: 'J-Hope', name: 'J-Hope', image: '/profile-icons/JHOPE.png' },
  { id: 'Jimin', name: 'Jimin', image: '/profile-icons/JIMIN.png' },
  { id: 'V', name: 'V', image: '/profile-icons/V.png' },
  { id: 'Jungkook', name: 'Jungkook', image: '/profile-icons/JUNGKOOK.png' },
]

const formatNumber = (num: number) => {
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toLocaleString()
}

export default function TrendingWidget() {
  const [category, setCategory] = useState<'ot7' | 'solo'>('ot7')
  const [selectedMember, setSelectedMember] = useState('all')
  const [spotifySongs, setSpotifySongs] = useState<Song[]>([])
  const [youtubeSongs, setYoutubeSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(false) // Start with no loading - show data quickly
  const [isRefreshing, setIsRefreshing] = useState(false) // Subtle refresh indicator
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null)
  const isInitialLoad = useRef(true)

  useEffect(() => {
    const fetchTrending = async () => {
      // Only show full loading state on initial load
      if (isInitialLoad.current) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }
      setError(null)

      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin

        // For solo category, fetch specific member or all solo artists
        const memberParam = category === 'solo' && selectedMember !== 'all' ? `&member=${selectedMember}` : ''

        const [spotifyRes, youtubeRes] = await Promise.all([
          fetch(`${baseUrl}/api/trending/top-songs?platform=spotify&category=${category}${memberParam}`),
          fetch(`${baseUrl}/api/trending/top-songs?platform=youtube&category=${category}${memberParam}`)
        ])

        // Handle Spotify response
        if (spotifyRes?.ok) {
          const data = await spotifyRes.json()
          if (data.ok && data.songs?.length > 0) {
            setSpotifySongs(data.songs.slice(0, 3).map((s: any, idx: number) => ({
              rank: idx + 1,
              title: s.title,
              artist: s.artist,
              thumbnail: s.thumbnail,
              dailyStreams: s.dailyStreams,
              totalStreams: s.totalStreams
            })))
            if (data.lastRefreshedAt && !lastRefreshedAt) {
              setLastRefreshedAt(data.lastRefreshedAt)
            }
          } else {
            setError(data.error || 'Failed to load Spotify data')
          }
        } else {
          setError('Failed to connect to Spotify API')
        }

        // Handle YouTube response
        if (youtubeRes?.ok) {
          const data = await youtubeRes.json()
          if (data.ok && data.songs?.length > 0) {
            setYoutubeSongs(data.songs.slice(0, 3).map((s: any, idx: number) => ({
              rank: idx + 1,
              title: s.title,
              artist: s.artist,
              thumbnail: s.thumbnail,
              views: s.views,
              yesterday: s.yesterday
            })))
            if (data.lastRefreshedAt && !lastRefreshedAt) {
              setLastRefreshedAt(data.lastRefreshedAt)
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch trending songs:', err)
        setError('Failed to load trending data. Please try again.')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
        isInitialLoad.current = false
      }
    }

    fetchTrending()
  }, [category, selectedMember])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="col-span-1 md:col-span-2 md:row-span-2 glass-panel rounded-2xl p-4 sm:p-6 flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Trending Now</h3>
            <p className="text-[10px] sm:text-xs text-gray-400">
              Top tracks across platforms
              {lastRefreshedAt && ` • Updated ${formatTimestamp(lastRefreshedAt)}`}
            </p>
          </div>
          {isRefreshing && (
            <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          )}
        </div>
        <div className="flex p-0.5 sm:p-1 bg-secondary rounded-xl shrink-0">
          <button
            onClick={() => {
              setCategory('ot7')
              setSelectedMember('all')
            }}
            className={`px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold transition-colors rounded-md ${category === 'ot7' ? 'text-white bg-primary shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
          >
            OT7
          </button>
          <button
            onClick={() => setCategory('solo')}
            className={`px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold transition-colors rounded-md ${category === 'solo' ? 'text-white bg-primary shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
          >
            Solo
          </button>
        </div>
      </div>

      {/* Member Selection - Only show in Solo mode */}
      {category === 'solo' && (
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member.id)}
              className={`flex flex-col items-center gap-1 shrink-0 ${selectedMember === member.id ? '' : 'opacity-50 hover:opacity-100'
                } transition-opacity`}
            >
              <div className={`size-10 sm:size-12 rounded-full overflow-hidden border-2 ${selectedMember === member.id ? 'border-primary' : 'border-transparent'
                } transition-colors`}>
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium">{member.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:gap-4 flex-1">
        {/* Loading State */}
        {isLoading && (
          <div className="col-span-full flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full"></div>
              <p className="text-xs text-gray-400">Loading trending tracks...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="col-span-full bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-xs text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && spotifySongs.length === 0 && youtubeSongs.length === 0 && (
          <div className="col-span-full flex items-center justify-center py-8">
            <p className="text-xs text-gray-400">No trending data available</p>
          </div>
        )}

        {/* Spotify List */}
        {!isLoading && spotifySongs.length > 0 && (
          <div className="bg-secondary/30 rounded-xl p-3 sm:p-4 border border-white/5">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 text-accent-green">
              <span className="material-symbols-outlined text-xs sm:text-sm">social_distance</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase">Spotify Global</span>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {spotifySongs.map((song) => (
                <TrendingItem key={song.rank} rank={song.rank} title={song.title} artist={song.artist} thumbnail={song.thumbnail} dailyStreams={song.dailyStreams} totalStreams={song.totalStreams} />
              ))}
            </div>
          </div>
        )}

        {/* YouTube List */}
        {!isLoading && youtubeSongs.length > 0 && (
          <div className="bg-secondary/30 rounded-xl p-3 sm:p-4 border border-white/5">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 text-red-500">
              <span className="material-symbols-outlined text-xs sm:text-sm">play_arrow</span>
              <span className="text-[10px] sm:text-xs font-bold uppercase">YouTube Trending</span>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {youtubeSongs.map((song) => (
                <TrendingItem key={song.rank} rank={song.rank} title={song.title} artist={song.artist} thumbnail={song.thumbnail} isYoutube views={song.views} yesterday={song.yesterday} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TrendingItem({ rank, title, artist, thumbnail, isYoutube, views, dailyStreams, totalStreams, yesterday }: { rank: number, title: string, artist: string, thumbnail?: string, isYoutube?: boolean, views?: number, dailyStreams?: number, totalStreams?: number, yesterday?: number }) {
  const displayViews = isYoutube ? views : totalStreams
  const dailyChange = isYoutube ? yesterday : dailyStreams

  return (
    <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
      {!isYoutube && <span className="text-base sm:text-lg font-bold text-gray-500 w-3 sm:w-4 shrink-0">{rank}</span>}
      <div
        className="size-8 sm:size-10 rounded bg-gray-700 bg-cover shrink-0"
        style={{ backgroundImage: thumbnail ? `url('${thumbnail}')` : `url('https://api.dicebear.com/7.x/shapes/svg?seed=${title}')` }}
      ></div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs sm:text-sm font-bold text-white truncate ${isYoutube ? 'group-hover:text-red-500' : 'group-hover:text-accent-green'}`}>{title}</p>
        <div className="flex items-center gap-2">
          <p className="text-[10px] sm:text-xs text-gray-400 truncate">{artist}</p>
          {displayViews !== undefined && (
            <>
              <span className="text-gray-600">•</span>
              <p className="text-[10px] sm:text-xs text-gray-400">
                {isYoutube ? `${formatNumber(displayViews)} views` : formatNumber(displayViews)}
              </p>
            </>
          )}
          {dailyChange !== undefined && dailyChange > 0 && (
            <>
              <span className="text-gray-600">•</span>
              <p className="text-[10px] sm:text-xs text-green-400">
                +{formatNumber(dailyChange)}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
