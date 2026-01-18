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
  spotifyId?: string
}

interface TopSongsProps {
  songs: Song[]
  allSongs?: Song[] // All songs for the modal
}

export default function TopSongs({ songs, allSongs }: TopSongsProps) {
  const [showModal, setShowModal] = useState(false)

  // Use allSongs if provided, otherwise use songs
  const displaySongs = allSongs || songs
  const getSpotifyUrl = (song: Song) =>
    song.spotifyId ? `https://open.spotify.com/track/${song.spotifyId}` : null

  return (
    <>
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-bold text-base sm:text-lg">Top Songs</h3>
          {allSongs && allSongs.length > 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="text-[#895af6] text-xs sm:text-sm font-medium hover:underline"
            >
              View All ({allSongs.length})
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {songs.map((song, i) => {
            const spotifyUrl = getSpotifyUrl(song)
            return (
            <div
              key={i}
              className="bg-[#2e2249] rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-4 hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5"
            >
              <div className="relative h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 min-w-[48px] sm:min-w-[56px] md:min-w-[64px] rounded-xl overflow-hidden">
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  className="h-full w-full object-cover"
                />
                {spotifyUrl ? (
                  <a
                    href={spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Open ${song.title} on Spotify`}
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#1DB954]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 6.628 5.373 12 12 12s12-5.372 12-12C24 5.373 18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                  </a>
                ) : (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white fill-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h4 className="text-white font-bold truncate text-sm">{song.title}</h4>
                <p className="text-[#a290cb] text-[10px] sm:text-xs truncate">{song.streams} Streams</p>
              </div>
              <div className="text-[#a290cb] text-[10px] sm:text-xs font-mono hidden sm:block">{song.duration}</div>
            </div>
          )})}
        </div>
      </div>

      {/* Modal for all songs */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1225] rounded-t-3xl sm:rounded-t-2xl w-full sm:max-w-4xl max-h-[85vh] sm:max-h-[80vh] flex flex-col border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 sticky top-0 bg-[#1a1225]">
              <h2 className="text-white font-bold text-lg sm:text-xl">All Songs</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Songs list */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {displaySongs.map((song, i) => {
                  const spotifyUrl = getSpotifyUrl(song)
                  return (
                  <div
                    key={i}
                    className="bg-[#2e2249] rounded-xl p-2.5 sm:p-4 flex items-center gap-2.5 sm:gap-4 hover:bg-white/5 transition-colors group border border-transparent hover:border-white/5"
                  >
                    <div className="relative h-11 w-11 sm:h-14 sm:w-14 min-w-[44px] sm:min-w-[56px] rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="h-full w-full object-cover"
                      />
                      {spotifyUrl ? (
                        <a
                          href={spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Open ${song.title} on Spotify`}
                        >
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-[#1DB954]"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 6.628 5.373 12 12 12s12-5.372 12-12C24 5.373 18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                          </svg>
                        </a>
                      ) : (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <h4 className="text-white font-semibold truncate text-sm">{song.title}</h4>
                      <p className="text-[#a290cb] text-[10px] sm:text-xs">{song.streams} streams</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 sm:gap-1 flex-shrink-0">
                      {song.dailyGain !== undefined && (
                        <div className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium ${
                          song.dailyGain > 0 ? 'text-green-400' : song.dailyGain < 0 ? 'text-red-400' : 'text-white/40'
                        }`}>
                          {song.dailyGain > 0 ? <TrendingUp className="w-3 h-3" /> : song.dailyGain < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                          {song.dailyGain > 0 ? '+' : ''}{song.dailyGain.toLocaleString()}
                        </div>
                      )}
                      <div className="text-white/30 text-[10px] sm:text-xs font-mono">#{i + 1}</div>
                    </div>
                  </div>
                )})}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-white/10 flex justify-between items-center text-xs sm:text-sm text-white/60 sticky bottom-0 bg-[#1a1225]">
              <span>{displaySongs.length} songs total</span>
              <button
                onClick={() => setShowModal(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#895af6] hover:bg-[#7a4ae6] text-white rounded-lg transition-colors text-xs sm:text-sm"
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
