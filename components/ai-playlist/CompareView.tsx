'use client'

import React from 'react'
import { X, Check, Music } from 'lucide-react'

interface Track {
  title?: string
  name?: string
  artist: string
  spotifyId?: string
  albumArt?: string
}

interface Playlist {
  playlist: Track[]
  playlistId?: string
}

interface CompareViewProps {
  playlists: Playlist[]
  onClose: () => void
  onSelect: (playlist: Playlist) => void
}

export default function CompareView({ playlists, onClose, onSelect }: CompareViewProps) {
  // Calculate overlap between playlists
  const calculateOverlap = (pl1: Track[], pl2: Track[]) => {
    const pl1Ids = new Set(pl1.map(t => t.spotifyId || t.title || t.name).filter(Boolean))
    const overlap = pl2.filter(t => pl1Ids.has(t.spotifyId || t.title || t.name))
    return overlap.length
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel rounded-3xl w-full max-w-6xl max-h-[85vh] flex flex-col border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Compare Playlists</h2>
            <p className="text-sm text-gray-400 mt-1">
              {playlists.length} playlist{playlists.length !== 1 ? 's' : ''} to compare
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((playlist, idx) => (
              <div
                key={playlist.playlistId || idx}
                className="glass-panel rounded-2xl p-5 border border-white/10"
              >
                {/* Playlist Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">
                    Playlist {idx + 1}
                  </h3>
                  <button
                    onClick={() => onSelect(playlist)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Select
                  </button>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Tracks</span>
                    <span className="text-sm font-bold text-white">{playlist.playlist.length}</span>
                  </div>

                  {/* Overlap with first playlist */}
                  {idx > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Overlap with Playlist 1</span>
                      <span className="text-sm font-bold text-purple-400">
                        {calculateOverlap(playlists[0].playlist, playlist.playlist)} songs
                      </span>
                    </div>
                  )}

                  {/* Unique tracks */}
                  {idx > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Unique tracks</span>
                      <span className="text-sm font-bold text-green-400">
                        {playlist.playlist.length - calculateOverlap(playlists[0].playlist, playlist.playlist)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Track Preview */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">
                    Track Preview
                  </p>
                  {playlist.playlist.slice(0, 5).map((track, trackIdx) => (
                    <div
                      key={trackIdx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-black/20"
                    >
                      <div className="w-8 h-8 rounded bg-gray-700 flex-shrink-0 overflow-hidden">
                        {track.albumArt ? (
                          <img
                            src={track.albumArt}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">
                          {track.title || track.name}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {track.artist}
                        </p>
                      </div>
                    </div>
                  ))}
                  {playlist.playlist.length > 5 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      +{playlist.playlist.length - 5} more tracks
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Overlap Matrix (if more than 2 playlists) */}
          {playlists.length > 2 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-white mb-4">Overlap Matrix</h3>
              <div className="glass-panel rounded-2xl p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left text-xs text-gray-400 font-medium pb-3"></th>
                        {playlists.map((_, idx) => (
                          <th
                            key={idx}
                            className="text-center text-xs text-gray-400 font-medium pb-3"
                          >
                            PL {idx + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {playlists.map((pl1, idx1) => (
                        <tr key={idx1}>
                          <td className="text-xs text-gray-400 font-medium py-2">
                            Playlist {idx1 + 1}
                          </td>
                          {playlists.map((pl2, idx2) => {
                            const overlap = idx1 === idx2
                              ? pl1.playlist.length
                              : calculateOverlap(pl1.playlist, pl2.playlist)
                            const percentage = idx1 === idx2
                              ? 100
                              : Math.round((overlap / pl1.playlist.length) * 100)

                            return (
                              <td key={idx2} className="text-center py-2">
                                <div
                                  className={`inline-block px-3 py-1 rounded-xl ${
                                    idx1 === idx2
                                      ? 'bg-purple-600/20 text-purple-300'
                                      : percentage > 50
                                      ? 'bg-red-500/20 text-red-300'
                                      : percentage > 25
                                      ? 'bg-yellow-500/20 text-yellow-300'
                                      : 'bg-green-500/20 text-green-300'
                                  }`}
                                >
                                  <span className="text-xs font-bold">{overlap}</span>
                                  <span className="text-[10px] ml-1">({percentage}%)</span>
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
