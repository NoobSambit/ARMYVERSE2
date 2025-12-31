'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Music, ExternalLink, Radio } from 'lucide-react'

interface RecentTracksProps {
  tracks: any[]
  loading?: boolean
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
        className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-purple-500/30"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-6 w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-700 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
                <div className="w-16 h-4 bg-gray-700 rounded"></div>
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
      className="bg-black/40 backdrop-blur-lg rounded-3xl p-4 sm:p-6 border border-purple-500/30"
    >
      <div className="flex items-center justify-between mb-6">
        <motion.h3
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl font-bold text-white flex items-center space-x-2"
        >
          <Music className="w-5 h-5 text-purple-400" />
          <span>Recent Tracks</span>
        </motion.h3>
      </div>

      {/* Constrain height and allow scrolling within the card */}
      <div className="max-h-80 sm:max-h-96 overflow-y-auto pr-1 space-y-3">
        <AnimatePresence>
          {tracks.map((track, index) => {
            const isNowPlaying = track.nowplaying || track['@attr']?.nowplaying === 'true'
            const artistName = typeof track.artist === 'string' ? track.artist : track.artist?.name || track.artists?.[0]?.name || 'Unknown Artist'
            const albumName = track.album?.name || track.album?.['#text'] || 'Unknown Album'
            const imageUrl = track.image || track.album?.images?.[0]?.url || 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=60&h=60'

            return (
              <motion.div
                key={track.url || track.name + index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className={`group flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-xl hover:bg-white/5 transition-all duration-300 ${
                  isNowPlaying ? 'bg-purple-500/10 border border-purple-500/30' : ''
                }`}
              >
                {/* Album Art */}
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={albumName}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
                  />
                  {isNowPlaying ? (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <Radio className="w-5 h-5 text-purple-400 animate-pulse" />
                    </div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 + 0.1 }}
                    className="text-white font-medium truncate text-sm sm:text-base"
                  >
                    {track.name}
                    {isNowPlaying && (
                      <span className="ml-2 text-xs text-purple-400">Now Playing</span>
                    )}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 + 0.15 }}
                    className="text-gray-400 text-xs sm:text-sm truncate"
                  >
                    {artistName}
                  </motion.p>
                </div>

                {/* Duration & Actions */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {track.date && !isNowPlaying && (
                    <div className="text-gray-400 text-xs hidden sm:block">
                      {formatTimestamp(track.date)}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => window.open(track.url || track.external_urls?.lastfm, '_blank')}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {tracks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <Music className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No recent tracks found</p>
          <p className="text-gray-500 text-sm">Start listening to see your recent activity</p>
        </motion.div>
      )}
    </motion.div>
  )
}