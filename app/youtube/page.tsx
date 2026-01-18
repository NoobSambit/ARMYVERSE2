'use client'

import { useEffect, useState } from 'react'
import {
  Youtube,
  TrendingUp,
  Eye,
  Calendar,
  Search,
  X,
  Loader2,
} from 'lucide-react'
import YouTubeSongList from '@/components/youtube/YouTubeSongList'
import YouTubeVideoModal from '@/components/youtube/YouTubeVideoModal'

// Artist member data
const MEMBERS = [
  { id: 'BTS', name: 'BTS' },
  { id: 'Jungkook', name: 'Jungkook' },
  { id: 'V', name: 'V' },
  { id: 'Jimin', name: 'Jimin' },
  { id: 'Suga', name: 'Suga' },
  { id: 'RM', name: 'RM' },
  { id: 'Jin', name: 'Jin' },
  { id: 'J-Hope', name: 'J-Hope' },
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
  const [selectedSong, setSelectedSong] = useState<YouTubeVideoDetail | null>(
    null
  )
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
      const btsData = json.artistGroups?.find(
        (g: YouTubeArtistGroup) => g.artist === 'BTS'
      )
      if (btsData) {
        setData(btsData)
      }
    } catch (error) {
      console.error('Error fetching YouTube data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMemberChange = (member: (typeof MEMBERS)[0]) => {
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
    return num.toLocaleString()
  }

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Unknown'
    const date = new Date(timestamp)
    return (
      date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC',
      }) + ' UTC'
    )
  }

  // Filter songs by search query
  const filteredSongs =
    data?.songs?.filter(
      song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

  const hasActiveSearch = searchQuery.length > 0

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      {/* Vibrant Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[128px]" />
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-violet-800/20 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-10 md:py-14">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="space-y-1.5 sm:space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white via-purple-100 to-purple-200 bg-clip-text text-transparent">
                YouTube Analytics
              </span>
            </h1>
            <p className="text-sm sm:text-base text-purple-200/40 font-medium">
              Real-time performance tracking • Updated{' '}
              {formatTimestamp(lastRefreshedAt)}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-purple-200/40 max-w-md md:text-right">
            Data is scraped from kworb.net. Minor inaccuracies or delays can be
            present compared to official YouTube stats.
          </p>
        </header>

        {/* Navigation & Controls */}
        <div className="sticky top-4 z-40 mb-8 md:mb-10">
          <div className="p-1.5 bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/5 rounded-[24px] shadow-2xl shadow-purple-900/10 flex flex-col md:flex-row gap-2 md:gap-3 items-center">
            {/* Member Tabs */}
            <nav className="flex-1 w-full overflow-x-auto scrollbar-hide flex items-center gap-1 pb-1 md:pb-0">
              {MEMBERS.map(member => (
                <button
                  key={member.id}
                  onClick={() => handleMemberChange(member)}
                  className={`
                    px-4 md:px-5 py-2 md:py-2.5 rounded-[18px] text-sm font-medium transition-all duration-300 whitespace-nowrap
                    ${
                      selectedMember.id === member.id
                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/25 scale-[1.02]'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  {member.name}
                </button>
              ))}
            </nav>

            {/* Search */}
            <div className="w-full md:w-auto relative group px-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/30 group-focus-within:text-purple-300/80 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full md:w-72 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/20 rounded-[18px] pl-11 pr-4 py-2.5 text-sm text-white placeholder-purple-200/30 focus:outline-none focus:bg-white/10 focus:border-purple-500/40 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-purple-200/40" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <main>
          {data && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
              {/* Total Views */}
              <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] bg-[#0F0F0F] border border-white/5 relative overflow-hidden group hover:border-purple-500/20 transition-colors">
                <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-purple-200/40 mb-1 sm:mb-2">
                  Total Views
                </p>
                <p className="text-xl sm:text-3xl font-bold text-white tracking-tight truncate">
                  {data.totalViews ? formatNumber(data.totalViews) : '-'}
                </p>
              </div>

              {/* Daily Average */}
              <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] bg-[#0F0F0F] border border-white/5 relative overflow-hidden group hover:border-purple-500/20 transition-colors">
                <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-fuchsia-400" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-purple-200/40 mb-1 sm:mb-2">
                  Daily Average
                </p>
                <p className="text-xl sm:text-3xl font-bold text-white tracking-tight truncate">
                  {data.dailyAvg ? formatNumber(data.dailyAvg) : '-'}
                </p>
              </div>

              {/* Total Videos */}
              <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] bg-[#0F0F0F] border border-white/5 relative overflow-hidden group hover:border-purple-500/20 transition-colors">
                <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Youtube className="w-6 h-6 sm:w-8 sm:h-8 text-violet-500" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-purple-200/40 mb-1 sm:mb-2">
                  Total Videos
                </p>
                <p className="text-xl sm:text-3xl font-bold text-white tracking-tight truncate">
                  {data.totalSongs || data.songs?.length || 0}
                </p>
              </div>

              {/* Artist Name */}
              <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] bg-[#0F0F0F] border border-white/5 relative overflow-hidden group hover:border-purple-500/20 transition-colors">
                <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-300" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-purple-200/40 mb-1 sm:mb-2">
                  Artist
                </p>
                <p className="text-xl sm:text-3xl font-bold text-white tracking-tight truncate">
                  {selectedMember.name}
                </p>
              </div>
            </div>
          )}

          {/* Song List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-purple-200/30 text-sm font-medium">
                Fetching analytics...
              </p>
            </div>
          ) : data &&
            (hasActiveSearch ? filteredSongs : data.songs)?.length > 0 ? (
            <YouTubeSongList
              songs={hasActiveSearch ? filteredSongs : data.songs}
              onSongClick={handleSongClick}
              artist={selectedMember.name}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-32 space-y-4 border border-dashed border-white/10 rounded-[32px] bg-white/[0.02]">
              <Search className="w-8 h-8 text-purple-200/20" />
              <p className="text-purple-200/40 text-sm">
                {hasActiveSearch
                  ? `No videos match "${searchQuery}"`
                  : `No videos found for ${selectedMember.name}`}
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
    </div>
  )
}
