'use client'

import React, { useState } from 'react'
import { Play, X, TrendingUp, TrendingDown } from 'lucide-react'

interface Song {
  title: string
  streams: string
  duration: string
  coverUrl: string
  dailyGain?: number
  totalStreams?: number
}

interface TopSongsProps {
  songs: Song[]
  allSongs?: Song[] // All songs for the modal
}

export default function TopSongs({ songs, allSongs }: TopSongsProps) {
  const [showModal, setShowModal] = useState(false)

  // Use allSongs if provided, otherwise use songs
  const displaySongs = allSongs || songs

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">Top Songs</h3>
          {allSongs && allSongs.length > 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="text-[#895af6] text-sm font-medium hover:underline"
            >
              View All ({allSongs.length})
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map((song, i) => (
            <div
              key={i}
              className="bg-[#2e2249] rounded-xl p-3 flex items-center gap-4 hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5"
            >
              <div className="relative h-16 w-16 min-w-[64px] rounded-xl overflow-hidden">
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h4 className="text-white font-bold truncate">{song.title}</h4>
                <p className="text-[#a290cb] text-xs truncate">{song.streams} Streams</p>
              </div>
              <div className="text-[#a290cb] text-xs font-mono">{song.duration}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for all songs */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1225] rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-white font-bold text-xl">All Songs</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Songs list */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displaySongs.map((song, i) => (
                  <div
                    key={i}
                    className="bg-[#2e2249] rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group border border-transparent hover:border-white/5"
                  >
                    <div className="relative h-14 w-14 min-w-[56px] rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <h4 className="text-white font-semibold truncate text-sm">{song.title}</h4>
                      <p className="text-[#a290cb] text-xs">{song.streams} streams</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {song.dailyGain !== undefined && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${
                          song.dailyGain > 0 ? 'text-green-400' : song.dailyGain < 0 ? 'text-red-400' : 'text-white/40'
                        }`}>
                          {song.dailyGain > 0 ? <TrendingUp className="w-3 h-3" /> : song.dailyGain < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                          {song.dailyGain > 0 ? '+' : ''}{song.dailyGain.toLocaleString()}
                        </div>
                      )}
                      <div className="text-white/30 text-xs font-mono">#{i + 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 flex justify-between items-center text-sm text-white/60">
              <span>{displaySongs.length} songs total</span>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-[#895af6] hover:bg-[#7a4ae6] text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
