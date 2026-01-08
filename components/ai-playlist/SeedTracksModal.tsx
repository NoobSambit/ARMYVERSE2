'use client'

import React, { useState, useEffect } from 'react'
import { Search, X, Music, Check } from 'lucide-react'

interface Track {
  _id?: string
  spotifyId?: string
  name?: string
  title?: string
  artist: string
  album?: string
  thumbnails?: {
    small?: string
    medium?: string
    large?: string
  }
  audioFeatures?: {
    danceability?: number
    energy?: number
    valence?: number
    tempo?: number
  }
}

interface SeedTracksModalProps {
  isOpen: boolean
  onClose: () => void
  selectedTracks: Track[]
  onTracksSelected: (tracks: Track[]) => void
  maxTracks?: number
}

export default function SeedTracksModal({
  isOpen,
  onClose,
  selectedTracks,
  onTracksSelected,
  maxTracks = 5
}: SeedTracksModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)
  const [localSelected, setLocalSelected] = useState<Track[]>(selectedTracks)

  useEffect(() => {
    setLocalSelected(selectedTracks)
  }, [selectedTracks])

  useEffect(() => {
    if (isOpen) {
      fetchTracks()
    }
  }, [isOpen, searchQuery])

  const fetchTracks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }
      params.append('limit', '50')

      const response = await fetch(`/api/playlist/seed-tracks?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTracks(data.tracks || [])
      }
    } catch (error) {
      console.error('Failed to fetch tracks:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTrack = (track: Track) => {
    const trackId = track.spotifyId || track._id || track.name || track.title
    const isSelected = localSelected.some(t => {
      const selectedId = t.spotifyId || t._id || t.name || t.title
      return selectedId === trackId
    })
    if (isSelected) {
      setLocalSelected(localSelected.filter(t => {
        const selectedId = t.spotifyId || t._id || t.name || t.title
        return selectedId !== trackId
      }))
    } else {
      if (localSelected.length < maxTracks) {
        setLocalSelected([...localSelected, track])
      }
    }
  }

  const handleApply = () => {
    onTracksSelected(localSelected)
    onClose()
  }

  const handleClear = () => {
    setLocalSelected([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel rounded-3xl w-full max-w-4xl max-h-[80vh] flex flex-col border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Select Seed Tracks</h2>
            <p className="text-sm text-gray-400 mt-1">
              Choose up to {maxTracks} songs to match the energy ({localSelected.length}/{maxTracks} selected)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by song name, artist, or album..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Selected Tracks Preview */}
        {localSelected.length > 0 && (
          <div className="p-4 bg-purple-900/20 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Selected Seeds
              </span>
              <button
                onClick={handleClear}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {localSelected.map((track) => (
                <div
                  key={track.spotifyId}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600/30 border border-purple-500/50 text-xs"
                >
                  <span className="text-white font-medium truncate max-w-[150px]">
                    {track.name}
                  </span>
                  <button
                    onClick={() => toggleTrack(track)}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tracks List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
            </div>
          ) : tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Music className="w-12 h-12 mb-3 opacity-50" />
              <p>No tracks found. Try a different search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tracks.map((track) => {
                const trackId = track.spotifyId || track._id || track.name || track.title
                const isSelected = localSelected.some(t => {
                  const selectedId = t.spotifyId || t._id || t.name || t.title
                  return selectedId === trackId
                })
                const isMaxed = localSelected.length >= maxTracks && !isSelected

                return (
                  <button
                    key={trackId}
                    onClick={() => !isMaxed && toggleTrack(track)}
                    disabled={isMaxed}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                      isSelected
                        ? 'bg-purple-600/30 border-2 border-purple-500 shadow-lg shadow-purple-900/30'
                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10 hover:border-white/20'
                    } ${isMaxed ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="w-12 h-12 rounded bg-gray-700 flex-shrink-0 overflow-hidden">
                      {track.thumbnails?.medium || track.thumbnails?.small ? (
                        <img
                          src={track.thumbnails.medium || track.thumbnails.small}
                          alt={track.name || track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-white truncate">
                        {track.name || track.title}
                      </h4>
                      <p className="text-xs text-gray-400 truncate">
                        {track.artist}{track.album ? ` • ${track.album}` : ''}
                      </p>
                      {track.audioFeatures && (
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] text-gray-500">
                            Energy: {Math.round((track.audioFeatures.energy || 0) * 100)}%
                          </span>
                          <span className="text-[10px] text-gray-500">
                            Dance: {Math.round((track.audioFeatures.danceability || 0) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold transition-all hover:shadow-lg hover:shadow-purple-900/50"
          >
            Apply Seeds ({localSelected.length})
          </button>
        </div>
      </div>
    </div>
  )
}
