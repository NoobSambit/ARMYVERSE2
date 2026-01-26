'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  Search,
  Plus,
  Trash2,
  Music,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Sparkles,
  GripVertical,
  RotateCw,
  Minus,
  SlidersHorizontal,
  TrendingUp,
  Edit3,
  Share2,
  HelpCircle,
  MapPin,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import StreamingFocusMode from '@/components/streaming/StreamingFocusMode'
import SharePlaylistModal from '@/components/ai-playlist/SharePlaylistModal'
import SpotifyBYOGuideModal from '@/components/playlist/SpotifyBYOGuideModal'
import GuidedTour, { RestartTourButton } from '@/components/ui/GuidedTour'
import { SongDoc, useAllSongs } from '@/hooks/useAllSongs'
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth'
import {
  CREATE_PLAYLIST_TOUR_ID,
  streamingModeTourSteps,
  manualModeTourSteps
} from '@/lib/tours/createPlaylistTour'

// Track with appearance count for manual curator
interface TrackWithCount extends SongDoc {
  appearances: number
}

const DEFAULT_PLAYLIST_NAME = 'armyverse.vercel.app playlist'

export default function CreatePlaylist() {
  const [searchQuery, setSearchQuery] = useState('')
  const [playlistName, setPlaylistName] = useState(DEFAULT_PLAYLIST_NAME)
  const [lastAutoName, setLastAutoName] = useState(DEFAULT_PLAYLIST_NAME)
  const [selectedTracks, setSelectedTracks] = useState<TrackWithCount[]>([])
  const [playlistTracks, setPlaylistTracks] = useState<SongDoc[]>([])
  const [mode, setMode] = useState<'manual' | 'streaming'>('streaming')
  const [focusResult, setFocusResult] = useState<SongDoc[] | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [savedPlaylistUrl, setSavedPlaylistUrl] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [lastExportCount, setLastExportCount] = useState(0)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [focusDraggedIndex, setFocusDraggedIndex] = useState<number | null>(
    null
  )
  const [focusDragOverIndex, setFocusDragOverIndex] = useState<number | null>(
    null
  )
  const [showBYOGuide, setShowBYOGuide] = useState(false)
  const { songs: allSongs } = useAllSongs()
  const { status, refreshStatus } = useSpotifyAuth()

  const handlePlaylistNameChange = (value: string) => {
    setPlaylistName(value)
  }

  const handleFocusTrackChange = useCallback(
    (track: SongDoc | null) => {
      if (!track) return
      const nextName = `${track.name} Focused Playlist`
      const trimmed = playlistName.trim()
      const shouldAutoUpdate =
        !trimmed ||
        trimmed === DEFAULT_PLAYLIST_NAME ||
        trimmed === lastAutoName
      if (shouldAutoUpdate) {
        setLastAutoName(nextName)
        setPlaylistName(nextName)
      }
    },
    [lastAutoName, playlistName]
  )

  const filteredTracks = allSongs.filter(
    track =>
      track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.album.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate total duration, appearances, and diversity
  const playlistStats = useMemo(() => {
    const totalMinutes = playlistTracks.length * 3.5
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round(totalMinutes % 60)
    const duration = `${hours}h ${minutes.toString().padStart(2, '0')}m`

    const totalAppearances = selectedTracks.reduce(
      (sum, t) => sum + t.appearances,
      0
    )
    const uniqueAlbums = new Set(selectedTracks.map(t => t.album)).size
    const diversity =
      selectedTracks.length >= 5 && uniqueAlbums >= 3
        ? 'High'
        : selectedTracks.length >= 3
          ? 'Medium'
          : 'Low'

    return {
      tracks: playlistTracks.length,
      duration,
      appearances: totalAppearances,
      diversity,
    }
  }, [playlistTracks, selectedTracks])

  // Calculate shuffle quality and skip risk
  const playlistQuality = useMemo(() => {
    if (playlistTracks.length === 0)
      return { shuffleQuality: 0, skipRisk: 'Low' }

    // Shuffle quality based on diversity and length
    const uniqueTracks = new Set(playlistTracks.map(t => t.spotifyId)).size
    const shuffleQuality = Math.min(
      98,
      Math.round((uniqueTracks / Math.max(playlistTracks.length, 1)) * 100)
    )

    // Skip risk based on repetition
    const avgAppearances = playlistTracks.length / Math.max(uniqueTracks, 1)
    const skipRisk =
      avgAppearances > 5 ? 'High' : avgAppearances > 3 ? 'Medium' : 'Low'

    return { shuffleQuality, skipRisk }
  }, [playlistTracks])

  // Focus playlist stats
  const focusDuration = useMemo(() => {
    if (!focusResult) return '0h 00m'
    const totalMinutes = focusResult.length * 3.5
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round(totalMinutes % 60)
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`
  }, [focusResult])

  // Add track to selected tracks with appearance count
  const addToSelected = (track: SongDoc) => {
    const existing = selectedTracks.find(t => t.spotifyId === track.spotifyId)
    if (existing) return
    setSelectedTracks([...selectedTracks, { ...track, appearances: 1 }])
    setSearchQuery('')
  }

  // Remove track from selected
  const removeFromSelected = (spotifyId: string) => {
    setSelectedTracks(selectedTracks.filter(t => t.spotifyId !== spotifyId))
  }

  // Adjust appearance count
  const updateAppearances = (spotifyId: string, delta: number) => {
    setSelectedTracks(
      selectedTracks.map(t => {
        if (t.spotifyId === spotifyId) {
          const newCount = Math.max(1, Math.min(50, t.appearances + delta))
          return { ...t, appearances: newCount }
        }
        return t
      })
    )
  }

  // Set all appearances to same value
  const setAllAppearances = () => {
    if (selectedTracks.length === 0) return
    const value = prompt('Set all tracks to how many appearances?', '1')
    const num = parseInt(value || '1')
    if (isNaN(num) || num < 1 || num > 50) return
    setSelectedTracks(selectedTracks.map(t => ({ ...t, appearances: num })))
  }

  // Equalize appearances
  const equalizeAppearances = () => {
    if (selectedTracks.length === 0) return
    const total = selectedTracks.reduce((sum, t) => sum + t.appearances, 0)
    const avg = Math.max(1, Math.round(total / selectedTracks.length))
    setSelectedTracks(selectedTracks.map(t => ({ ...t, appearances: avg })))
  }

  // Generate playlist from selected tracks
  const generatePlaylist = useCallback(() => {
    if (selectedTracks.length === 0) {
      setSaveError('Please add some tracks first')
      return
    }

    const generated: SongDoc[] = []
    selectedTracks.forEach(track => {
      for (let i = 0; i < track.appearances; i++) {
        generated.push(track)
      }
    })

    const shuffled = [...generated].sort(() => Math.random() - 0.5)
    setPlaylistTracks(shuffled)
    setSaveError(null)
  }, [selectedTracks])

  // Reverse playlist
  const reversePlaylist = () => {
    setPlaylistTracks([...playlistTracks].reverse())
  }

  // Clear all
  const clearAll = () => {
    setSelectedTracks([])
    setPlaylistTracks([])
  }

  // Remove from playlist
  const removeFromPlaylist = (index: number) => {
    setPlaylistTracks(playlistTracks.filter((_, i) => i !== index))
  }

  // Drag and drop handlers
  const handleDragStart = (index: number) => setDraggedIndex(index)

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null) return

    const newTracks = [...playlistTracks]
    const [draggedTrack] = newTracks.splice(draggedIndex, 1)
    newTracks.splice(dropIndex, 0, draggedTrack)

    setPlaylistTracks(newTracks)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Focus drag handlers
  const handleFocusDragStart = (index: number) => setFocusDraggedIndex(index)

  const handleFocusDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setFocusDragOverIndex(index)
  }

  const handleFocusDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (focusDraggedIndex === null || !focusResult) return

    const newTracks = [...focusResult]
    const [draggedTrack] = newTracks.splice(focusDraggedIndex, 1)
    newTracks.splice(dropIndex, 0, draggedTrack)

    setFocusResult(newTracks)
    setFocusDraggedIndex(null)
    setFocusDragOverIndex(null)
  }

  const handleFocusDragEnd = () => {
    setFocusDraggedIndex(null)
    setFocusDragOverIndex(null)
  }

  const removeFromFocusResult = (index: number) => {
    if (!focusResult) return
    setFocusResult(focusResult.filter((_, i) => i !== index))
  }

  const handleSaveToSpotify = useCallback(
    async (songsToSave?: SongDoc[]) => {
      const tracks = songsToSave || playlistTracks
      if (tracks.length === 0) {
        setSaveError('Please add some tracks to your playlist first')
        return
      }

      setIsSaving(true)
      setSaveError(null)
      setSaveSuccess(null)

      try {
        let accessToken = status?.accessToken || null
        if (!accessToken) {
          const refreshed = await refreshStatus()
          accessToken = refreshed?.accessToken || null
        }

        const makeBody = (useFallback: boolean = false) => ({
          name: playlistName,
          songs: tracks.map(track => ({
            title: track.name,
            artist: track.artist,
            spotifyId: track.spotifyId,
          })),
          fallbackToOwner: useFallback,
        })

        const makeHeaders = (token?: string | null) => {
          const h: Record<string, string> = {
            'Content-Type': 'application/json',
          }
          if (token) h['Authorization'] = `Bearer ${token}`
          return h
        }

        let response = await fetch('/api/playlist/export', {
          method: 'POST',
          headers: makeHeaders(accessToken),
          body: JSON.stringify(makeBody(false)),
        })

        let data = await response.json()

        if (!response.ok) {
          if (response.status === 401 && accessToken) {
            // Try to refresh the token
            const refreshed = await refreshStatus()
            if (refreshed?.accessToken) {
              response = await fetch('/api/playlist/export', {
                method: 'POST',
                headers: makeHeaders(refreshed.accessToken),
                body: JSON.stringify(makeBody(false)),
              })
              data = await response.json()

              // If still failing with 401, try fallback
              if (!response.ok && response.status === 401 && data.canFallback) {
                console.log(
                  'Token refresh succeeded but still invalid, using fallback'
                )
                response = await fetch('/api/playlist/export', {
                  method: 'POST',
                  headers: makeHeaders(refreshed.accessToken),
                  body: JSON.stringify(makeBody(true)),
                })
                data = await response.json()
              }
            } else {
              // Refresh failed - use fallback
              console.log('Token refresh failed, using owner fallback')
              response = await fetch('/api/playlist/export', {
                method: 'POST',
                headers: makeHeaders(accessToken),
                body: JSON.stringify(makeBody(true)),
              })
              data = await response.json()
            }
          }

          // Check final response
          if (!response.ok) {
            throw new Error(
              data.error || data.details || 'Failed to save playlist to Spotify'
            )
          }
        }

        // Show appropriate message based on whether fallback was used
        if (data.mode === 'owner') {
          const suffix = data.usedFallback
            ? ' Your session expired - please reconnect your Spotify.'
            : ' Connect Spotify to export to your own account.'
          setSaveSuccess(
            `Playlist "${playlistName}" saved to ArmyVerse Spotify account.${suffix}`
          )
        } else {
          setSaveSuccess(
            `Playlist "${playlistName}" saved to Spotify successfully!`
          )
        }
        setSavedPlaylistUrl(data.playlistUrl || null)
        if (data.playlistUrl) {
          setLastExportCount(tracks.length)
          setShowShareModal(true)
        }
        setTimeout(() => setSaveSuccess(null), 8000) // Longer timeout for fallback message
      } catch (error) {
        console.error('Error saving playlist:', error)
        setSaveError(
          error instanceof Error ? error.message : 'Failed to save playlist'
        )
      } finally {
        setIsSaving(false)
      }
    },
    [playlistName, playlistTracks, status, refreshStatus]
  )

  return (
    <div className="flex-grow w-full max-w-[1600px] mx-auto p-3 sm:p-4 lg:p-8 flex flex-col gap-4 sm:gap-6 font-display">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-1 sm:mb-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Create Playlist
            </h1>
            <p className="text-text-muted text-xs sm:text-sm md:text-base">
              Manually curate your perfect setlist or generate one with AI.
            </p>
          </div>
          <button
            onClick={() => setShowBYOGuide(true)}
            data-tour="spotify-guide-btn"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all border border-white/10 text-xs sm:text-sm font-medium"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>How to Connect Spotify</span>
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-4 w-full">
          {/* Mode Toggle */}
          <div data-tour="mode-toggle" className="flex h-10 sm:h-12 items-center bg-surface-light p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 h-full px-3 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${mode === 'manual'
                ? 'bg-background-dark text-white shadow-sm'
                : 'text-text-muted hover:text-white'
                }`}
            >
              <Edit3 className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
              <span className="text-xs sm:text-sm font-semibold">Manual</span>
            </button>
            <button
              onClick={() => setMode('streaming')}
              className={`flex-1 h-full px-3 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-colors ${mode === 'streaming'
                ? 'bg-background-dark text-white shadow-sm'
                : 'text-text-muted hover:text-white'
                }`}
            >
              <TrendingUp className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
              <span className="text-xs sm:text-sm font-medium">Streaming</span>
            </button>
          </div>
          {/* AI Button */}
          <Link
            href="/ai-playlist"
            data-tour="ai-generator-btn"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-purple-500 hover:from-primary-dark hover:to-purple-600 text-white px-4 sm:px-6 h-10 sm:h-12 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>AI Generator</span>
          </Link>
        </div>
      </div>

      {/* MANUAL MODE */}
      {mode === 'manual' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start relative">
          {/* LEFT PANEL: Track Selection */}
          <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3 sm:gap-4">
            {/* Quick Stats Widget */}
            <div data-tour="quick-stats" className="grid grid-cols-4 gap-1.5 sm:gap-3">
              <div className="bg-surface-light/50 border border-border-dark p-2 sm:p-3 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="text-[9px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Tracks
                </span>
                <span className="text-base sm:text-xl font-bold text-white">
                  {playlistStats.tracks}
                </span>
              </div>
              <div className="bg-surface-light/50 border border-border-dark p-2 sm:p-3 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="text-[9px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Duration
                </span>
                <span className="text-base sm:text-xl font-bold text-white text-xs sm:text-sm">
                  {playlistStats.duration}
                </span>
              </div>
              <div className="bg-surface-light/50 border border-border-dark p-2 sm:p-3 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="text-[9px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Appearances
                </span>
                <span className="text-base sm:text-xl font-bold text-white">
                  {playlistStats.appearances}
                </span>
              </div>
              <div className="bg-surface-light/50 border border-border-dark p-2 sm:p-3 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="text-[9px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Diversity
                </span>
                <span
                  className={`text-base sm:text-xl font-bold ${playlistStats.diversity === 'High'
                    ? 'text-emerald-400'
                    : playlistStats.diversity === 'Medium'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                    }`}
                >
                  {playlistStats.diversity}
                </span>
              </div>
            </div>

            {/* Main Glass Card */}
            <div className="bg-surface-dark/70 backdrop-blur-xl border border-glass-border rounded-2xl p-3 sm:p-5 flex flex-col gap-3 sm:gap-5 min-h-[400px] sm:min-h-[600px]">
              {/* Search & Header Section */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <div data-tour="search-box" className="flex gap-2 sm:gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-text-muted w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    <input
                      className="w-full bg-surface-light border border-border-dark rounded-xl pl-9 sm:pl-12 pr-3 sm:pr-4 h-9 sm:h-12 text-white placeholder-text-muted focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm"
                      placeholder="Search by song, album, or era..."
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Track List - Scrollable Area */}
              <div data-tour="track-list" className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[600px] custom-scrollbar">
                {searchQuery ? (
                  // Search results
                  <>
                    {filteredTracks.map(track => {
                      const isSelected = selectedTracks.find(
                        t => t.spotifyId === track.spotifyId
                      )
                      return (
                        <div
                          key={track.spotifyId}
                          className="group flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-xl bg-surface-light/30 hover:bg-surface-light hover:border-primary/20 border border-transparent transition-all cursor-default"
                        >
                          <div className="size-10 sm:size-14 rounded-xl bg-cover bg-center shrink-0 shadow-md relative overflow-hidden">
                            <Image
                              src={
                                track.thumbnails?.medium ||
                                track.thumbnails?.small ||
                                '/images/placeholder.jpg'
                              }
                              alt={track.name}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Music className="text-white w-4 sm:w-5 h-4 sm:h-5" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold truncate text-sm">
                              {track.name}
                            </h4>
                            <p className="text-text-muted text-xs sm:text-sm truncate">
                              {track.artist} • {track.album}
                            </p>
                          </div>
                          <button
                            onClick={() => addToSelected(track)}
                            disabled={!!isSelected}
                            className={`size-7 sm:size-9 rounded-full flex items-center justify-center transition-colors ${isSelected
                              ? 'bg-primary/20 text-primary cursor-not-allowed'
                              : 'hover:bg-primary/20 text-text-muted hover:text-primary'
                              }`}
                          >
                            {isSelected ? (
                              <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                            ) : (
                              <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
                            )}
                          </button>
                        </div>
                      )
                    })}
                    {filteredTracks.length === 0 && (
                      <div className="text-center py-8 sm:py-12 text-text-muted text-sm">
                        No songs found matching &quot;{searchQuery}&quot;
                      </div>
                    )}
                  </>
                ) : (
                  // Selected tracks with controls
                  <>
                    {selectedTracks.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-8 sm:py-12 border-2 border-dashed border-white/5 rounded-xl">
                        <Music className="w-10 sm:w-12 h-10 sm:h-12 text-gray-600 mb-3" />
                        <p className="text-text-muted text-sm">
                          No tracks selected
                        </p>
                        <p className="text-gray-600 text-xs sm:text-sm mt-1">
                          Search and add tracks above
                        </p>
                      </div>
                    ) : (
                      selectedTracks.map(track => (
                        <div
                          key={track.spotifyId}
                          className="group flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-xl bg-surface-light/30 hover:bg-surface-light hover:border-primary/20 border border-transparent transition-all cursor-default"
                        >
                          <div className="size-10 sm:size-14 rounded-xl bg-cover bg-center shrink-0 shadow-md relative overflow-hidden">
                            <Image
                              src={
                                track.thumbnails?.medium ||
                                track.thumbnails?.small ||
                                '/images/placeholder.jpg'
                              }
                              alt={track.name}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Music className="text-white w-4 sm:w-5 h-4 sm:h-5" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold truncate text-sm">
                              {track.name}
                            </h4>
                            <p className="text-text-muted text-xs sm:text-sm truncate">
                              {track.artist} • {track.album}
                            </p>
                          </div>

                          {/* Counter */}
                          <div className="flex items-center gap-1.5 sm:gap-3 bg-background-dark/50 p-1 sm:p-1.5 rounded-xl border border-white/5">
                            <button
                              onClick={() =>
                                updateAppearances(track.spotifyId, -1)
                              }
                              className="size-6 sm:size-8 rounded-md bg-surface-light hover:bg-white/10 text-white flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                            </button>
                            <span className="w-3 sm:w-4 text-center text-xs sm:text-sm font-bold text-white">
                              {track.appearances}
                            </span>
                            <button
                              onClick={() =>
                                updateAppearances(track.spotifyId, 1)
                              }
                              className="size-6 sm:size-8 rounded-md bg-primary hover:bg-primary-dark text-white flex items-center justify-center transition-colors shadow-lg shadow-primary/20"
                            >
                              <Plus className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                            </button>
                          </div>

                          {/* Remove Action */}
                          <button
                            onClick={() => removeFromSelected(track.spotifyId)}
                            className="size-7 sm:size-9 rounded-full hover:bg-red-500/20 text-text-muted hover:text-red-400 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div data-tour="generate-btn" className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                onClick={generatePlaylist}
                disabled={selectedTracks.length === 0}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 sm:py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <RotateCw className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                Update Preview
              </button>
              <button
                onClick={clearAll}
                className="px-4 sm:px-6 bg-surface-light hover:bg-surface-light/80 text-white font-medium py-2.5 sm:py-3.5 rounded-xl border border-border-dark transition-all text-sm"
              >
                Clear All
              </button>
            </div>
          </section>

          {/* RIGHT PANEL: Generated Playlist */}
          <aside data-tour="playlist-preview" className="lg:col-span-5 xl:col-span-4 sticky top-4 sm:top-6 self-start z-10">
            <div className="bg-surface-dark/70 backdrop-blur-xl border border-glass-border rounded-2xl p-3 sm:p-5 flex flex-col gap-3 sm:gap-5 h-[calc(100vh-4rem)] sm:h-[calc(100vh-6rem)] min-h-[400px] sm:min-h-[500px]">
              {/* Header with Stats */}
              <div className="flex flex-col gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-white/5">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-white font-bold text-base sm:text-lg">
                    Playlist Preview
                  </h3>
                  <span
                    className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${playlistTracks.length > 0
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                      }`}
                  >
                    {playlistTracks.length > 0 ? 'Ready' : 'Empty'}
                  </span>
                </div>
                <div className="flex gap-2 sm:gap-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-text-muted tracking-wider">
                      Shuffle Quality
                    </span>
                    <div className="w-full bg-surface-light rounded-full h-1.5 sm:h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${playlistQuality.shuffleQuality}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-white text-right">
                      {playlistQuality.shuffleQuality}%
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-text-muted tracking-wider">
                      Skip Risk
                    </span>
                    <div className="w-full bg-surface-light rounded-full h-1.5 sm:h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${playlistQuality.skipRisk === 'Low'
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 w-[15%]'
                          : playlistQuality.skipRisk === 'Medium'
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 w-[50%]'
                            : 'bg-gradient-to-r from-red-400 to-red-600 w-[85%]'
                          }`}
                      ></div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-white text-right">
                      {playlistQuality.skipRisk}
                    </span>
                  </div>
                </div>
              </div>

              {/* Playlist Name Input */}
              <div>
                <label className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 sm:mb-2 block">
                  Playlist Name
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-background-dark/50 border border-border-dark rounded-xl px-3 sm:px-4 h-9 sm:h-12 text-white text-sm sm:text-base font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    type="text"
                    value={playlistName}
                    onChange={e => handlePlaylistNameChange(e.target.value)}
                  />
                  <Edit3 className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-text-muted cursor-pointer hover:text-white w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </div>
              </div>

              {/* Draggable List - Scrollable */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 sm:space-y-2 custom-scrollbar">
                {playlistTracks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-8 sm:py-12">
                    <Music className="w-10 sm:w-12 h-10 sm:h-12 text-gray-600 mb-3 sm:mb-4" />
                    <p className="text-text-muted text-xs sm:text-sm">
                      No playlist generated yet
                    </p>
                    <p className="text-gray-600 text-[10px] sm:text-xs mt-1">
                      Add tracks and click Update Preview
                    </p>
                  </div>
                ) : (
                  playlistTracks.map((track, index) => (
                    <div
                      key={`${track.spotifyId}-${index}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={e => handleDragOver(e, index)}
                      onDrop={e => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`group flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 pr-2 sm:pr-3 rounded-xl transition-colors border cursor-move ${draggedIndex === index
                        ? 'opacity-50 bg-surface-light/50 border-primary/30'
                        : dragOverIndex === index
                          ? 'bg-primary/10 border-primary/30'
                          : 'border-transparent hover:border-white/5 hover:bg-surface-light/50'
                        }`}
                    >
                      <GripVertical className="text-text-muted group-hover:text-white w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                      <span className="text-text-muted text-[10px] sm:text-xs font-mono w-3 sm:w-4">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="size-8 sm:size-10 rounded bg-cover bg-center shrink-0 relative">
                        <Image
                          src={
                            track.thumbnails?.small || '/images/placeholder.jpg'
                          }
                          alt={track.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs sm:text-sm font-semibold truncate">
                          {track.name}
                        </p>
                        <p className="text-text-muted text-[10px] sm:text-xs truncate">
                          {track.artist}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromPlaylist(index)}
                        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-opacity"
                      >
                        <svg
                          className="w-[14px] sm:w-[18px] h-[14px] sm:h-[18px]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Export Section */}
              {playlistTracks.length > 0 && (
                <div data-tour="export-section" className="pt-3 sm:pt-4 mt-auto border-t border-white/5 flex flex-col gap-2 sm:gap-3">
                  {/* Error/Success Messages */}
                  {saveError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-2 sm:p-3 flex items-center gap-2 sm:gap-3 text-red-300 text-[10px] sm:text-xs">
                      <AlertCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                      <span>{saveError}</span>
                    </div>
                  )}

                  {saveSuccess && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-2 sm:p-3 flex items-center gap-2 sm:gap-3 text-green-300 text-[10px] sm:text-xs">
                      <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                      <span>{saveSuccess}</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleSaveToSpotify()}
                    disabled={isSaving}
                    className="w-full bg-[#1db954] hover:bg-[#1ed760] text-white font-bold py-2.5 sm:py-3.5 rounded-2xl shadow-lg shadow-[#1db954]/20 transition-all flex items-center justify-center gap-2 sm:gap-3 group disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <svg
                      className="w-5 sm:w-6 h-5 sm:h-6 fill-current"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                    <span>
                      {isSaving ? 'Creating...' : 'Export to Spotify'}
                    </span>
                  </button>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[10px] sm:text-xs text-text-muted">
                      Account:
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold text-white">
                      {status?.displayName || 'Not connected'}
                    </span>
                    {savedPlaylistUrl && (
                      <>
                        <button
                          onClick={() =>
                            window.open(savedPlaylistUrl, '_blank')
                          }
                          className="text-[10px] sm:text-xs text-primary hover:text-primary-dark ml-1 underline flex items-center gap-1"
                        >
                          Open{' '}
                          <ExternalLink className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                        </button>
                        <button
                          onClick={() => setShowShareModal(true)}
                          className="text-[10px] sm:text-xs text-primary hover:text-primary-dark ml-2 underline flex items-center gap-1"
                        >
                          Share <Share2 className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {mode === 'streaming' && (
        <StreamingFocusMode
          focusResult={focusResult}
          setFocusResult={setFocusResult}
          playlistName={playlistName}
          setPlaylistName={handlePlaylistNameChange}
          onFocusTrackChange={handleFocusTrackChange}
          focusDuration={focusDuration}
          isSaving={isSaving}
          saveError={saveError}
          saveSuccess={saveSuccess}
          savedPlaylistUrl={savedPlaylistUrl}
          onOpenShareModal={() => setShowShareModal(true)}
          handleSaveToSpotify={handleSaveToSpotify}
          removeFromFocusResult={removeFromFocusResult}
          focusDraggedIndex={focusDraggedIndex}
          focusDragOverIndex={focusDragOverIndex}
          handleFocusDragStart={handleFocusDragStart}
          handleFocusDragOver={handleFocusDragOver}
          handleFocusDrop={handleFocusDrop}
          handleFocusDragEnd={handleFocusDragEnd}
        />
      )}

      <SharePlaylistModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        playlistName={playlistName || 'Streaming Playlist'}
        spotifyUrl={savedPlaylistUrl}
        trackCount={
          lastExportCount ||
          (mode === 'streaming'
            ? focusResult?.length || 0
            : playlistTracks.length)
        }
      />

      <SpotifyBYOGuideModal
        isOpen={showBYOGuide}
        onClose={() => setShowBYOGuide(false)}
      />

      {/* Guided Tour - Shows appropriate tour based on current mode */}
      {mode === 'streaming' && (
        <GuidedTour
          tourId={CREATE_PLAYLIST_TOUR_ID}
          steps={streamingModeTourSteps}
          showOnFirstVisit={true}
        />
      )}
      {mode === 'manual' && (
        <GuidedTour
          tourId={`${CREATE_PLAYLIST_TOUR_ID}-manual`}
          steps={manualModeTourSteps}
          showOnFirstVisit={true}
        />
      )}

      {/* Floating Tour Restart Button - Mode aware */}
      <div className="fixed bottom-4 left-4 z-40">
        <RestartTourButton
          tourId={mode === 'streaming' ? CREATE_PLAYLIST_TOUR_ID : `${CREATE_PLAYLIST_TOUR_ID}-manual`}
          label={mode === 'streaming' ? 'Streaming Tour' : 'Manual Tour'}
          className="px-3 py-2 rounded-xl bg-surface-dark/80 backdrop-blur border border-white/10 hover:bg-surface-light transition-all shadow-lg"
        />
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #161022;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #36294b;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9054f8;
        }
      `}</style>
    </div>
  )
}
