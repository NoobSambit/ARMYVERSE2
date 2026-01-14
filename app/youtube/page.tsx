'use client'

import { useEffect, useState } from 'react'
import { Youtube, TrendingUp, Eye, Calendar, Search, X } from 'lucide-react'
import YouTubeSongList from '@/components/youtube/YouTubeSongList'
import YouTubeVideoModal from '@/components/youtube/YouTubeVideoModal'

// Artist member data
const MEMBERS = [
  { id: 'BTS', name: 'BTS', emoji: '💜' },
  { id: 'Jungkook', name: 'Jungkook', emoji: '🐰' },
  { id: 'V', name: 'V', emoji: '🐯' },
  { id: 'Jimin', name: 'Jimin', emoji: '🐥' },
  { id: 'Suga', name: 'Suga', emoji: '🐱' },
  { id: 'RM', name: 'RM', emoji: '🦖' },
  { id: 'Jin', name: 'Jin', emoji: '🐹' },
  { id: 'J-Hope', name: 'J-Hope', emoji: '🌞' },
]

export interface YouTubeSong {
  _id?: string
  rank: number
  videoId?: string
  title: string
  artist: string
  views: number
  yesterday: number
  published: string
  thumbnail?: string
  url?: string
}

export interface YouTubeArtistGroup {
  artist: string
  pageUrl: string
  songs: YouTubeSong[]
  totalViews?: number
  totalSongs?: number
  dailyAvg?: number
}

export interface YouTubeVideoDetail {
  videoId: string
  title: string
  artist: string
  published: string
  totalViews: number
  likes: number
  mostViewsInADay: number
  mostViewsDate: string
  expectedMilestone: string
  milestoneViews: number
  milestoneDate: string
  dailyViews: Array<{ date: string; views: number }>
  monthlyViews: Array<{ date: string; views: number }>
  yearlyViews: Array<{ year: string; views: number }>
  topLists: string[]
  milestones: string[]
  peakPosition: number
  chartedWeeks: number
}

export default function YouTubePage() {
  const [selectedMember, setSelectedMember] = useState(MEMBERS[0])
  const [data, setData] = useState<YouTubeArtistGroup | null>(null)
  const [allMembersData, setAllMembersData] = useState<YouTubeArtistGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSong, setSelectedSong] = useState<YouTubeVideoDetail | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchYouTubeData()
  }, [])

  const fetchYouTubeData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/youtube/data')
      if (!res.ok) throw new Error('Failed to fetch data')
      const json = await res.json()
      setAllMembersData(json.artistGroups || [])
      setLastRefreshedAt(json.lastRefreshedAt || null)

      // Set initial data for BTS
      const btsData = json.artistGroups?.find((g: YouTubeArtistGroup) => g.artist === 'BTS')
      if (btsData) {
        setData(btsData)
      }
    } catch (error) {
      console.error('Error fetching YouTube data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMemberChange = (member: typeof MEMBERS[0]) => {
    setSelectedMember(member)
    setSearchQuery('') // Clear search when switching members
    const memberData = allMembersData.find(
      (g: YouTubeArtistGroup) => g.artist === member.id
    )
    setData(memberData || null)
  }

  const handleSongClick = async (song: YouTubeSong) => {
    if (!song.videoId) return

    setDetailLoading(true)
    setModalOpen(true)
    setSelectedSong(null)

    try {
      const res = await fetch(`/api/youtube/data?videoId=${song.videoId}`)
      if (!res.ok) throw new Error('Failed to fetch video details')
      const detail: YouTubeVideoDetail = await res.json()
      setSelectedSong(detail)
    } catch (error) {
      console.error('Error fetching video detail:', error)
    } finally {
      setDetailLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toLocaleString()
  }

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Unknown'
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    }) + ' UTC'
  }

  // Filter songs by search query
  const filteredSongs = data?.songs?.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const hasActiveSearch = searchQuery.length > 0

  return (
    <div className="min-h-screen page-gradient">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <Youtube className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">YouTube Analytics</h1>
                <p className="text-xs text-white/60">
                  BTS & Solo Members • Updated {formatTimestamp(lastRefreshedAt)}
                </p>
              </div>
            </div>
            <button
              onClick={fetchYouTubeData}
              className="btn-glass-ghost text-sm"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      {/* Member Navigation */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {MEMBERS.map((member) => (
              <button
                key={member.id}
                onClick={() => handleMemberChange(member)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                  ${selectedMember.id === member.id
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <span>{member.emoji}</span>
                <span>{member.name}</span>
              </button>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${selectedMember.name} videos...`}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {hasActiveSearch && (
              <p className="text-xs text-white/40 mt-2">
                {filteredSongs.length} {filteredSongs.length === 1 ? 'result' : 'results'} found
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selected Member Stats */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bento-card rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-sm text-white/60">Total Views</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {data.totalViews ? formatNumber(data.totalViews) : 'N/A'}
              </p>
            </div>

            <div className="bento-card rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-sm text-white/60">Daily Average</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {data.dailyAvg ? formatNumber(data.dailyAvg) : 'N/A'}
              </p>
            </div>

            <div className="bento-card rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                  <Youtube className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-sm text-white/60">Total Videos</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {data.totalSongs || data.songs?.length || 0}
              </p>
            </div>

            <div className="bento-card rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-pink-400" />
                </div>
                <span className="text-sm text-white/60">Member</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {selectedMember.emoji} {selectedMember.name}
              </p>
            </div>
          </div>
        )}

        {/* Song List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
              <p className="text-white/60">Loading YouTube data...</p>
            </div>
          </div>
        ) : data && (hasActiveSearch ? filteredSongs : data.songs)?.length > 0 ? (
          <YouTubeSongList
            songs={hasActiveSearch ? filteredSongs : data.songs}
            onSongClick={handleSongClick}
            artist={selectedMember.name}
          />
        ) : (
          <div className="text-center py-20">
            <Youtube className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">
              {hasActiveSearch
                ? `No videos found for "${searchQuery}"`
                : `No videos found for ${selectedMember.name}`
              }
            </p>
          </div>
        )}
      </main>

      {/* Video Detail Modal */}
      {modalOpen && (
        <YouTubeVideoModal
          videoDetail={selectedSong}
          loading={detailLoading}
          onClose={() => {
            setModalOpen(false)
            setSelectedSong(null)
          }}
        />
      )}
    </div>
  )
}
