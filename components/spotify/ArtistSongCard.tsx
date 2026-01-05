'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, ExternalLink, Music } from 'lucide-react'
import ChangeIndicator from './ChangeIndicator'

interface StreamRow {
  name: string
  totalStreams: number
  dailyGain?: number
  url?: string
  albumArt?: string
}

interface ArtistSongCardProps {
  artist: string
  imageUrl?: string
  pageUrl?: string
  totals: {
    streams: number
    daily: number
    tracks: number
  }
  songs: StreamRow[]
  changes24h?: {
    streamsChange: number
    dailyChange: number
    tracksChange: number
  }
  changes7d?: {
    streamsChange: number
    dailyChange: number
    tracksChange: number
  }
  expanded: boolean
  onToggle: () => void
}

export default function ArtistSongCard({
  artist,
  imageUrl,
  pageUrl,
  totals,
  songs,
  expanded,
  onToggle
}: ArtistSongCardProps) {
  const formatNumber = (n?: number) => {
    if (typeof n !== 'number') return '-'
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
    return n.toLocaleString()
  }

  // Generate initials for placeholder avatar
  const initials = artist.split(' ').map(word => word[0]).join('').slice(0, 2)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl border transition-all overflow-hidden ${
        expanded 
          ? 'bg-[#1E1B2E] border-purple-500/30 ring-1 ring-purple-500/20' 
          : 'bg-[#18181B] border-white/5 hover:border-white/10'
      }`}
    >
      {/* Header */}
      <div
        onClick={onToggle}
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {/* Artist Avatar */}
            <div className="relative">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={artist}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/10">
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white truncate">{artist}</h3>
                {pageUrl && (
                  <a
                    href={pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-white/20 hover:text-purple-400 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="text-xs font-medium text-white/50">
                {formatNumber(totals.streams)} Total Streams
              </div>
            </div>
          </div>

          {/* Expand/Collapse Icon */}
          <div className="text-white/30">
             {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Songs List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/5 bg-black/20"
          >
            <div className="p-4 space-y-1">
              {songs.slice(0, 5).map((song, idx) => ( // Show top 5 songs by default in expanded view
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  {/* Album Art */}
                  {song.albumArt ? (
                    <img
                      src={song.albumArt}
                      alt={song.name}
                      className="w-10 h-10 rounded bg-white/5 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center">
                      <Music className="w-4 h-4 text-white/20" />
                    </div>
                  )}

                  {/* Song Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      {song.url ? (
                        <a
                          href={song.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-white hover:text-purple-400 transition-colors truncate"
                        >
                          {song.name}
                        </a>
                      ) : (
                        <span className="text-sm font-semibold text-white truncate">{song.name}</span>
                      )}
                    </div>
                    <div className="text-xs text-white/40 font-mono">
                      {song.totalStreams.toLocaleString()}
                    </div>
                  </div>

                  {/* Daily Gain Pill */}
                  {song.dailyGain !== undefined && (
                    <div className="flex-shrink-0">
                      <ChangeIndicator change24h={song.dailyGain} mode="pill" />
                    </div>
                  )}
                </div>
              ))}
              
              {songs.length > 5 && (
                <div className="pt-2 text-center">
                   <span className="text-xs text-white/30 italic">And {songs.length - 5} more...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
