'use client'

import { Youtube, Eye, TrendingUp, ExternalLink } from 'lucide-react'
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{artist} Videos</h2>
          <p className="text-sm text-white/60 mt-1">
            {songs.length} videos • Sorted by daily views
          </p>
        </div>
      </div>

      {/* Song List */}
      <div className="space-y-2">
        {songs.map((song, index) => (
          <button
            key={song.videoId || song.title || index}
            onClick={() => onSongClick(song)}
            className="
              w-full bento-card rounded-2xl p-4 transition-all duration-200
              hover:bg-white/10 hover:scale-[1.01] active:scale-[0.99]
              flex items-center gap-4 text-left group
            "
          >
            {/* Rank Badge */}
            <div className="
              flex-shrink-0 w-8 h-8 rounded-lg
              bg-gradient-to-br from-purple-500/20 to-pink-500/20
              flex items-center justify-center
              border border-purple-500/30
            ">
              <span className="text-sm font-bold text-white/80">#{song.rank || index + 1}</span>
            </div>

            {/* Thumbnail */}
            <div className="relative flex-shrink-0 w-32 h-20 rounded-xl overflow-hidden bg-black/50">
              <Image
                src={getThumbnailUrl(song)}
                alt={song.title}
                fill
                className="object-cover"
                sizes="128px"
              />
              {/* Play overlay */}
              <div className="
                absolute inset-0 bg-black/40 flex items-center justify-center
                opacity-0 group-hover:opacity-100 transition-opacity duration-200
              ">
                <div className="w-10 h-10 rounded-full bg-red-500/90 flex items-center justify-center">
                  <Youtube className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate group-hover:text-purple-400 transition-colors">
                {song.title}
              </h3>
              <p className="text-sm text-white/60 mt-0.5">
                {formatDate(song.published)}
              </p>
            </div>

            {/* Stats */}
            <div className="flex-shrink-0 flex items-center gap-6">
              {/* Total Views */}
              <div className="hidden sm:flex items-center gap-2">
                <Eye className="w-4 h-4 text-white/40" />
                <span className="text-white/80 font-medium">{formatNumber(song.views)}</span>
              </div>

              {/* Yesterday Views */}
              <div className="
                flex items-center gap-2 px-3 py-1.5 rounded-full
                bg-green-500/10 border border-green-500/20
              ">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400 font-medium text-sm">+{formatNumber(song.yesterday)}</span>
              </div>

              {/* External Link */}
              <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                <ExternalLink className="w-4 h-4 text-white/40" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {songs.length === 0 && (
        <div className="text-center py-12">
          <Youtube className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">No videos found</p>
        </div>
      )}
    </div>
  )
}
