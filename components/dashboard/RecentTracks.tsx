'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Music, ExternalLink, Radio } from 'lucide-react'

interface RecentTracksProps {
  tracks: any[]
  loading?: boolean
}

// Helper to extract image URL from Last.fm array or string
const getImageUrl = (image: any, fallback: string = ''): string => {
  if (!image) return fallback
  if (typeof image === 'string') return image
  if (Array.isArray(image)) {
    // Try to get extralarge, then large, then medium
    const sizes = ['extralarge', 'large', 'medium', 'small']
    for (const size of sizes) {
      const img = image.find((i: any) => i.size === size)
      if (img && img['#text']) return img['#text']
    }
    // Fallback to last item (usually largest) or first
    const last = image[image.length - 1]
    if (last && last['#text']) return last['#text']
  }
  return fallback
}

export default function RecentTracks({ tracks, loading = false }: RecentTracksProps) {

  const formatTimestamp = (timestamp?: { uts: string; '#text': string }): string => {
    if (!timestamp) return ''
    const date = new Date(parseInt(timestamp.uts) * 1000)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/5 h-full min-h-[500px]"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-800 rounded mb-6 w-1/3"></div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-800 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-800 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-black/20 backdrop-blur-xl rounded-3xl p-5 border border-white/5 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white">Recent Tracks</h3>
          <p className="text-xs text-gray-400">Live updates from Last.fm</p>
        </div>
      </div>

      {/* Scrollable list container - fills remaining height but capped */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar max-h-[calc(100vh-250px)] min-h-[400px]">
        <AnimatePresence initial={false}>
          {tracks.map((track, index) => {
            const isNowPlaying = track.nowplaying || track['@attr']?.nowplaying === 'true'
            const artistName = typeof track.artist === 'string' ? track.artist : track.artist?.name || track.artists?.[0]?.name || 'Unknown Artist'
            const albumName = track.album?.name || track.album?.['#text'] || 'Unknown Album'
            
            // Fix image loading logic
            const imageUrl = getImageUrl(track.image, 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=60&h=60')
            
            const timeAgo = !isNowPlaying && track.date ? formatTimestamp(track.date) : ''

            return (
              <motion.div
                key={track.url || track.name + index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isNowPlaying 
                    ? 'bg-purple-500/10 border border-purple-500/20' 
                    : 'hover:bg-white/5 border border-transparent hover:border-white/5'
                }`}
              >
                {/* Album Art */}
                <div className="relative shrink-0">
                  <img
                    src={imageUrl}
                    alt={albumName}
                    className="w-12 h-12 rounded-lg object-cover shadow-lg"
                    onError={(e) => {
                      // Fallback on error
                      e.currentTarget.src = 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=60&h=60'
                    }}
                  />
                  {isNowPlaying ? (
                    <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center backdrop-blur-[1px]">
                      <div className="flex gap-0.5 items-end h-3">
                        <motion.div animate={{ height: [4, 12, 6] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-purple-400 rounded-full" />
                        <motion.div animate={{ height: [8, 4, 10] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-1 bg-purple-400 rounded-full" />
                        <motion.div animate={{ height: [6, 10, 5] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 bg-purple-400 rounded-full" />
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  )}
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className={`font-semibold text-sm truncate ${isNowPlaying ? 'text-purple-300' : 'text-white'}`}>
                      {track.name}
                    </p>
                    {isNowPlaying && (
                       <Radio className="w-3 h-3 text-purple-400 animate-pulse shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-gray-400 text-xs truncate">
                    {artistName}
                  </p>
                </div>

                {/* Time / Actions */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {!isNowPlaying && (
                    <span className="text-[10px] text-gray-500 font-mono">{timeAgo}</span>
                  )}
                  {/* Only show external link on hover to keep it clean */}
                  <button 
                    onClick={() => window.open(track.url || track.external_urls?.lastfm, '_blank')}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-opacity"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {tracks.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
          <Music className="w-10 h-10 mb-2 opacity-20" />
          <p className="text-sm">No recent tracks</p>
        </div>
      )}
    </motion.div>
  )
}
