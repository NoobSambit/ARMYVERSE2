'use client'

import { Youtube, Eye, TrendingUp, ChevronRight, Play } from 'lucide-react'
import Image from 'next/image'
import { YouTubeSong as IYouTubeSong } from '@/app/youtube/page'

interface YouTubeSongListProps {
  songs: IYouTubeSong[]
  onSongClick: (song: IYouTubeSong) => void
  artist: string
}

export default function YouTubeSongList({ songs, onSongClick, artist }: YouTubeSongListProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toLocaleString()
  }

  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split('/')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  // Get thumbnail URL with fallback
  const getThumbnailUrl = (song: IYouTubeSong) => {
    if (song.thumbnail) return song.thumbnail
    if (song.videoId) {
      return `https://i.ytimg.com/vi/${song.videoId}/mqdefault.jpg`
    }
    return '/placeholder-video.png'
  }

  return (
    <div className="space-y-6">
      {/* List Header */}
      <div className="flex items-end justify-between px-2">
        <h2 className="text-xl font-medium text-white tracking-tight">Top Videos</h2>
        <span className="text-sm font-medium text-purple-200/40">{songs.length} videos</span>
      </div>

      {/* Song List */}
      <div className="flex flex-col gap-2">
        {songs.map((song, index) => (
          <div
            key={song.videoId || song.title || index}
            onClick={() => onSongClick(song)}
            className="
              group relative flex items-center gap-4 p-2 rounded-[24px] 
              hover:bg-purple-900/10 border border-transparent hover:border-purple-500/20 
              transition-all duration-300 cursor-pointer w-full
            "
          >
            {/* Rank */}
            <div className="w-10 sm:w-14 shrink-0 text-center">
              <span className={`
                text-sm sm:text-lg font-bold tabular-nums
                ${index < 3 ? 'text-purple-400' : 'text-white/20'}
              `}>
                #{song.rank || index + 1}
              </span>
            </div>

            {/* Thumbnail */}
            <div className="relative w-28 sm:w-40 aspect-video rounded-xl overflow-hidden bg-[#111] shrink-0 shadow-lg shadow-black/20 group-hover:shadow-purple-900/20 transition-all">
              <Image
                src={getThumbnailUrl(song)}
                alt={song.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 112px, 160px"
              />
              {/* Play overlay */}
              <div className="absolute inset-0 bg-purple-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                  <Play className="w-3.5 h-3.5 text-purple-900 fill-purple-900 ml-0.5" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 py-1 flex flex-col justify-center h-full">
              <h3 className="font-medium text-white/90 truncate group-hover:text-purple-200 transition-colors text-sm sm:text-base pr-4">
                {song.title}
              </h3>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-white/40 font-medium">{formatDate(song.published)}</span>
                <span className="hidden sm:block w-0.5 h-0.5 rounded-full bg-white/20" />
                <div className="flex items-center gap-1.5 sm:gap-2">
                   <TrendingUp className="w-3 h-3 text-purple-400" />
                   <span className="text-xs text-purple-400 font-medium">+{formatNumber(song.yesterday)}</span>
                </div>
              </div>
            </div>

            {/* Stats - Desktop */}
            <div className="hidden sm:flex items-center gap-6 sm:gap-12 shrink-0 pr-4">
              <div className="text-right min-w-[80px]">
                <p className="text-sm font-bold text-white tabular-nums">{formatNumber(song.views)}</p>
                <p className="text-[10px] uppercase tracking-wider text-purple-200/30 font-medium">Total Views</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                <ChevronRight className="w-4 h-4 text-purple-300" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {songs.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-[32px] bg-white/[0.02]">
          <Youtube className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No videos found</p>
        </div>
      )}
    </div>
  )
}
