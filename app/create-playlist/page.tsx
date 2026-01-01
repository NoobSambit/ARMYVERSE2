'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Search, Plus, Trash2, Music, ExternalLink, CheckCircle, AlertCircle, Sparkles, AudioWaveform as Audio, ListMusic, GripVertical, RotateCw, Minus, Info, Clock } from 'lucide-react'
import Image from 'next/image'
import StreamingFocusForm from '@/components/forms/StreamingFocusForm'
import { SongDoc, useAllSongs } from '@/hooks/useAllSongs'
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth'
import Link from 'next/link'

// Track with appearance count for manual curator
interface TrackWithCount extends SongDoc {
  appearances: number
}

export default function CreatePlaylist() {
  const [searchQuery, setSearchQuery] = useState('')
  const [playlistName, setPlaylistName] = useState('My BTS Playlist')
  const [selectedTracks, setSelectedTracks] = useState<TrackWithCount[]>([])
  const [playlistTracks, setPlaylistTracks] = useState<SongDoc[]>([])
  const [mode, setMode] = useState<'normal' | 'focus'>('normal')
  const [focusResult, setFocusResult] = useState<SongDoc[] | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [savedPlaylistUrl, setSavedPlaylistUrl] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [focusDraggedIndex, setFocusDraggedIndex] = useState<number | null>(null)
  const [focusDragOverIndex, setFocusDragOverIndex] = useState<number | null>(null)
  const { songs: allSongs } = useAllSongs()
  const { status, refreshStatus } = useSpotifyAuth()

  const filteredTracks = allSongs.filter(track =>
    track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.album.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate total duration (assuming average 3.5 minutes per track appearance)
  const totalDuration = useMemo(() => {
    const totalMinutes = playlistTracks.length * 3.5
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round(totalMinutes % 60)
    return `${hours.toString().padStart(2, '0')}h${minutes.toString().padStart(2, '0')}m`
  }, [playlistTracks.length])

  // Calculate duration for focus result
  const focusDuration = useMemo(() => {
    if (!focusResult) return '00h00m'
    const totalMinutes = focusResult.length * 3.5
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.round(totalMinutes % 60)
    return `${hours.toString().padStart(2, '0')}h${minutes.toString().padStart(2, '0')}m`
  }, [focusResult])

  // Add track to selected tracks with appearance count
  const addToSelected = (track: SongDoc) => {
    const existing = selectedTracks.find(t => t.spotifyId === track.spotifyId)
    if (existing) {
      // Already exists, don't add again (could increase count if desired)
      return
    }
    setSelectedTracks([...selectedTracks, { ...track, appearances: 1 }])
    // Clear search to show the selected tracks list
    setSearchQuery('')
  }

  // Remove track from selected
  const removeFromSelected = (spotifyId: string) => {
    setSelectedTracks(selectedTracks.filter(t => t.spotifyId !== spotifyId))
  }

  // Adjust appearance count
  const updateAppearances = (spotifyId: string, delta: number) => {
    setSelectedTracks(selectedTracks.map(t => {
      if (t.spotifyId === spotifyId) {
        const newCount = Math.max(1, Math.min(50, t.appearances + delta))
        return { ...t, appearances: newCount }
      }
      return t
    }))
  }

  // Generate playlist from selected tracks with appearance counts
  const generatePlaylist = useCallback(() => {
    if (selectedTracks.length === 0) {
      setSaveError('Please add some tracks first')
      return
    }

    // Build playlist by repeating tracks according to their appearance count
    const generated: SongDoc[] = []
    selectedTracks.forEach(track => {
      for (let i = 0; i < track.appearances; i++) {
        generated.push(track)
      }
    })

    // Shuffle the generated playlist
    const shuffled = [...generated].sort(() => Math.random() - 0.5)
    setPlaylistTracks(shuffled)
    setSaveError(null)
  }, [selectedTracks])

  // Clear all selected tracks
  const clearAll = () => {
    setSelectedTracks([])
    setPlaylistTracks([])
  }

  // Remove track from final playlist
  const removeFromPlaylist = (index: number) => {
    setPlaylistTracks(playlistTracks.filter((_, i) => i !== index))
  }

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

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

  // Drag and drop handlers for focus result
  const handleFocusDragStart = (index: number) => {
    setFocusDraggedIndex(index)
  }

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

  // Remove track from focus result
  const removeFromFocusResult = (index: number) => {
    if (!focusResult) return
    setFocusResult(focusResult.filter((_, i) => i !== index))
  }

  const handleSaveToSpotify = useCallback(async (songsToSave?: SongDoc[]) => {
    const tracks = songsToSave || playlistTracks
    if (tracks.length === 0) {
      setSaveError('Please add some tracks to your playlist first')
      return
    }

    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(null)

    try {
      // Try to use user token if connected; otherwise fall back to owner mode
      let accessToken = status?.accessToken || null
      if (!accessToken) {
        const refreshed = await refreshStatus()
        accessToken = refreshed?.accessToken || null
      }

      const makeBody = () => ({
        name: playlistName,
        songs: tracks.map(track => ({
          title: track.name,
          artist: track.artist,
          spotifyId: track.spotifyId
        }))
      })

      const makeHeaders = (token?: string | null) => {
        const h: Record<string, string> = { 'Content-Type': 'application/json' }
        if (token) h['Authorization'] = `Bearer ${token}`
        return h
      }

      let response = await fetch('/api/playlist/export', {
        method: 'POST',
        headers: makeHeaders(accessToken),
        body: JSON.stringify(makeBody())
      })

      const data = await response.json()

      if (!response.ok) {
        // If we attempted with an invalid/expired user token, refresh and retry once
        if (response.status === 401 && accessToken) {
          const refreshed = await refreshStatus()
          if (refreshed?.accessToken) {
            response = await fetch('/api/playlist/export', {
              method: 'POST',
              headers: makeHeaders(refreshed.accessToken),
              body: JSON.stringify(makeBody())
            })
            const retryData = await response.json()
            if (!response.ok) {
              throw new Error(retryData.error || 'Failed to save playlist to Spotify')
            }
            setSaveSuccess(`Playlist "${playlistName}" saved to Spotify successfully!`)
            setSavedPlaylistUrl(retryData.playlistUrl)
            setTimeout(() => setSaveSuccess(null), 5000)
            return
          }
        }
        throw new Error(data.error || data.details || 'Failed to save playlist to Spotify')
      }

      setSaveSuccess(`Playlist "${playlistName}" saved to Spotify successfully!`)
      setSavedPlaylistUrl(data.playlistUrl)
      // Clear success message after 5 seconds
      setTimeout(() => setSaveSuccess(null), 5000)
    } catch (error) {
      console.error('Error saving playlist:', error)
      setSaveError(error instanceof Error ? error.message : 'Failed to save playlist')
    } finally {
      setIsSaving(false)
    }
  }, [playlistName, playlistTracks, status, refreshStatus])

  return (
    <div className="min-h-screen page-gradient relative overflow-hidden">
      {/* Subtle background glow - luxurious feel */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Create Playlist
          </h1>
          <p className="text-gray-400 text-lg font-light mb-8 max-w-2xl mx-auto">
            Curate your own collection or optimize for streaming
          </p>

          <div className="flex items-center justify-center gap-2 mb-8 text-sm">
             <span className="text-gray-500">Want AI assistance?</span>
             <Link href="/ai-playlist" className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 font-medium">
               <Sparkles className="w-3 h-3" />
               Try AI Generator
             </Link>
          </div>

          {/* Mode Toggle */}
          <div className="inline-flex p-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setMode('normal')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                mode === 'normal'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ListMusic className="w-4 h-4" />
              Manual Curator
            </button>
            <button
              onClick={() => setMode('focus')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                mode === 'focus'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Audio className="w-4 h-4" />
              Streaming Focus
            </button>
          </div>
        </div>

        {/* STREAMING FOCUS WORKFLOW */}
        {mode === 'focus' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* Left Panel - Form */}
            <div className="glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10 bg-black/40 backdrop-blur-xl h-full flex flex-col">
               <StreamingFocusForm onGenerated={(songs) => setFocusResult(songs)} />
            </div>

            {/* Right Panel - Generated Playlist */}
            <div className="glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10 bg-black/40 backdrop-blur-xl h-full flex flex-col lg:sticky lg:top-8">
              {focusResult ? (
                <>
                  <div className="mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-white">Generated Playlist</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Duration: {focusDuration}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                      <span className="text-yellow-400">💡</span>
                      <span>Drag to reorder • Click <Trash2 className="w-3 h-3 inline mx-0.5" /> to delete</span>
                    </p>
                  </div>

                  {/* Playlist Name Input */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-gray-400 text-xs font-medium mb-2 pl-1 uppercase tracking-wider">Playlist Name</label>
                    <input
                      type="text"
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      className="w-full p-2.5 sm:p-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-400/50 focus:bg-white/10 focus:outline-none text-white placeholder-gray-500 transition-all duration-300 text-sm"
                      placeholder="My Streaming Playlist"
                    />
                  </div>

                  {/* Draggable Playlist */}
                  <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[400px] sm:max-h-[500px] pr-1 sm:pr-2 custom-scrollbar mb-4 sm:mb-6 min-h-[200px] sm:min-h-[300px]">
                    {focusResult.map((track, index) => {
                      const isFocusTrack = focusResult[0] && track.spotifyId === focusResult[0].spotifyId
                      return (
                        <div
                          key={`${track.spotifyId}-${index}`}
                          draggable
                          onDragStart={() => handleFocusDragStart(index)}
                          onDragOver={(e) => handleFocusDragOver(e, index)}
                          onDrop={(e) => handleFocusDrop(e, index)}
                          onDragEnd={handleFocusDragEnd}
                          className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all duration-200 group cursor-move ${
                            focusDraggedIndex === index
                              ? 'opacity-50 bg-white/10 border-purple-500/30'
                              : focusDragOverIndex === index
                              ? 'bg-purple-500/10 border-purple-500/30'
                              : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
                          <div className="w-5 sm:w-6 text-center">
                            <span className="text-gray-500 text-xs font-medium">{index + 1}</span>
                          </div>
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 relative">
                            <Image
                              src={track.thumbnails?.small || '/images/placeholder.jpg'}
                              alt={track.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-white font-medium text-xs sm:text-sm truncate">{track.name}</h3>
                            <p className="text-gray-500 text-xs truncate hidden sm:block">{track.artist}</p>
                          </div>
                          {isFocusTrack && (
                            <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-500/20 border border-green-500/30 text-green-300 rounded-full font-medium flex-shrink-0">
                              🔥 Focus
                            </span>
                          )}
                          <button
                            onClick={() => removeFromFocusResult(index)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100"
                            title="Remove from playlist"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {/* Export to Spotify Section */}
                  <div className="pt-4 sm:pt-6 border-t border-white/5 space-y-3 sm:space-y-4 mt-auto">
                    {/* Error/Success Messages */}
                    {saveError && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 text-red-300 text-xs">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{saveError}</span>
                      </div>
                    )}

                    {saveSuccess && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 text-green-300 text-xs">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{saveSuccess}</span>
                      </div>
                    )}

                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={() => handleSaveToSpotify(focusResult)}
                        disabled={isSaving}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span className="hidden sm:inline">Creating...</span>
                            <span className="sm:hidden">Save</span>
                          </>
                        ) : (
                          <>
                            <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Create Spotify Playlist</span>
                            <span className="sm:hidden">Save to Spotify</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => savedPlaylistUrl && window.open(savedPlaylistUrl, '_blank')}
                        disabled={!savedPlaylistUrl}
                        className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-300 flex items-center justify-center ${
                          savedPlaylistUrl
                            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                            : 'bg-white/5 border-white/5 text-gray-500 cursor-not-allowed'
                        }`}
                        title="Open in Spotify"
                      >
                        <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-8 sm:py-12">
                  <Music className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mb-3 sm:mb-4" />
                  <p className="text-gray-500 text-sm">No playlist generated yet</p>
                  <p className="text-gray-600 text-xs mt-1">Fill out the form and click generate</p>
                </div>
              )}
            </div>
          </div>
        )}

          {/* MANUAL CREATOR WORKFLOW */}
          {mode === 'normal' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
              {/* Left Panel - Selected Tracks with Appearance Counts */}
              <div className="glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10 bg-black/40 backdrop-blur-xl h-full flex flex-col">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Selected Tracks ({selectedTracks.length})</h2>
                  <p className="text-gray-400 text-xs sm:text-sm">Choose tracks and set how many times they appear</p>
                </div>

                {/* Search Input */}
                <div className="relative mb-3 sm:mb-4">
                  <Search className="absolute left-3 sm:left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search for tracks or albums..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl focus:border-purple-400/50 focus:bg-white/10 focus:outline-none text-white placeholder-gray-500 transition-all duration-300 text-sm"
                  />
                </div>

                {/* Pro Tip */}
                <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg sm:rounded-xl flex items-start gap-2">
                  <Info className="w-4 h-4 text-purple-300 mt-0.5 flex-shrink-0" />
                  <p className="text-purple-200 text-[11px] sm:text-xs leading-relaxed">
                    <span className="font-semibold">Pro tip:</span> For focused tracks, set higher minimum appearances. Example: 25x Track A, 20x Track B, 15x Track C + fillers.
                  </p>
                </div>

                {/* Search Results or Selected Tracks */}
                <div className="space-y-1.5 sm:space-y-2 flex-1 overflow-y-auto max-h-[400px] sm:max-h-[500px] pr-1 sm:pr-2 custom-scrollbar mb-3 sm:mb-4">
                  {searchQuery ? (
                    // Show search results when searching
                    <>
                      {filteredTracks.map((track) => {
                        const isSelected = selectedTracks.find(t => t.spotifyId === track.spotifyId)
                        return (
                          <div
                            key={track.spotifyId}
                            className={`group flex items-center justify-between p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-all duration-200 ${
                              isSelected
                                ? 'bg-purple-500/10 border-purple-500/30'
                                : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-2 sm:gap-3 overflow-hidden flex-1">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 relative">
                                <Image
                                  src={track.thumbnails?.medium || track.thumbnails?.small || '/images/placeholder.jpg'}
                                  alt={track.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-white font-medium text-xs sm:text-sm truncate">{track.name}</h3>
                                <p className="text-gray-500 text-xs truncate hidden sm:block">{track.artist}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => addToSelected(track)}
                              disabled={!!isSelected}
                              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0 ${
                                isSelected
                                  ? 'bg-purple-500/20 text-purple-300 cursor-not-allowed'
                                  : 'bg-white/5 text-gray-400 hover:bg-purple-500 hover:text-white sm:opacity-0 sm:group-hover:opacity-100 sm:transform sm:translate-x-2 sm:group-hover:translate-x-0'
                              }`}
                              title={isSelected ? 'Already added' : 'Add to selection'}
                            >
                              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        )
                      })}
                      {filteredTracks.length === 0 && (
                        <div className="text-center py-12 text-gray-500 text-sm">
                          No songs found matching &quot;{searchQuery}&quot;
                        </div>
                      )}
                    </>
                  ) : (
                    // Show selected tracks with appearance controls when not searching
                    <>
                      {selectedTracks.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-8 sm:py-12 border-2 border-dashed border-white/5 rounded-lg sm:rounded-xl">
                          <Music className="w-9 h-9 sm:w-10 sm:h-10 text-gray-600 mb-2 sm:mb-3" />
                          <p className="text-gray-500 text-sm">No tracks selected</p>
                          <p className="text-gray-600 text-xs mt-1">Search and add tracks above</p>
                        </div>
                      ) : (
                        selectedTracks.map((track) => (
                          <div
                            key={track.spotifyId}
                            className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl border border-white/5 hover:border-white/10 transition-all duration-200"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 overflow-hidden flex-1 min-w-0">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 relative">
                                <Image
                                  src={track.thumbnails?.small || '/images/placeholder.jpg'}
                                  alt={track.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-white font-medium text-xs sm:text-sm truncate">{track.name}</h3>
                                <p className="text-gray-500 text-xs truncate hidden sm:block">{track.artist}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-2 ml-2">
                              {/* Appearances Counter */}
                              <div className="flex items-center gap-0.5 sm:gap-1 bg-white/5 rounded-lg border border-white/10 px-0.5 sm:px-1">
                                <button
                                  onClick={() => updateAppearances(track.spotifyId, -1)}
                                  className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                  title="Decrease appearances"
                                >
                                  <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </button>
                                <div className="min-w-[28px] sm:min-w-[32px] text-center">
                                  <span className="text-white text-xs sm:text-sm font-medium">{track.appearances}</span>
                                </div>
                                <button
                                  onClick={() => updateAppearances(track.spotifyId, 1)}
                                  className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                  title="Increase appearances"
                                >
                                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </button>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => removeFromSelected(track.spotifyId)}
                                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all duration-200"
                                title="Remove from selection"
                              >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-white/5">
                  <button
                    onClick={generatePlaylist}
                    disabled={selectedTracks.length === 0}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{playlistTracks.length > 0 ? 'Re-generate' : 'Generate Playlist'}</span>
                  </button>
                  <button
                    onClick={clearAll}
                    disabled={selectedTracks.length === 0}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 font-semibold rounded-lg sm:rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Right Panel - Final Playlist */}
              <div className="glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10 bg-black/40 backdrop-blur-xl h-full flex flex-col lg:sticky lg:top-8">
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Playlist</h2>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Duration: {totalDuration}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                    <span className="text-yellow-400">💡</span>
                    <span>Drag to reorder • Click <Trash2 className="w-3 h-3 inline mx-0.5" /> to delete</span>
                  </p>
                </div>

                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-400 text-xs font-medium mb-2 pl-1 uppercase tracking-wider">Playlist Name</label>
                  <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    className="w-full p-2.5 sm:p-3 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl focus:border-purple-400/50 focus:bg-white/10 focus:outline-none text-white placeholder-gray-500 transition-all duration-300 text-sm"
                    placeholder="My Awesome Mix"
                  />
                </div>

                <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[400px] sm:max-h-[500px] pr-1 sm:pr-2 custom-scrollbar min-h-[200px] sm:min-h-[300px] mb-4 sm:mb-6">
                  {playlistTracks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-8 sm:py-12 border-2 border-dashed border-white/5 rounded-lg sm:rounded-xl">
                       <Music className="w-9 h-9 sm:w-10 sm:h-10 text-gray-600 mb-2 sm:mb-3" />
                       <p className="text-gray-500 text-sm">Your playlist is empty</p>
                       <p className="text-gray-600 text-xs mt-1">Add tracks and click Re-generate</p>
                    </div>
                  ) : (
                    playlistTracks.map((track, index) => (
                      <div
                        key={`${track.spotifyId}-${index}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all duration-200 group cursor-move ${
                          draggedIndex === index
                            ? 'opacity-50 bg-white/10 border-purple-500/30'
                            : dragOverIndex === index
                            ? 'bg-purple-500/10 border-purple-500/30'
                            : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
                        <div className="w-5 sm:w-6 text-center">
                          <span className="text-gray-500 text-xs font-medium">{index + 1}</span>
                        </div>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 relative">
                          <Image
                            src={track.thumbnails?.small || '/images/placeholder.jpg'}
                            alt={track.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-medium text-xs sm:text-sm truncate">{track.name}</h3>
                          <p className="text-gray-500 text-xs truncate hidden sm:block">{track.artist}</p>
                        </div>
                        <button
                          onClick={() => removeFromPlaylist(index)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100"
                          title="Remove from playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {playlistTracks.length > 0 && (
                  <div className="pt-4 sm:pt-6 border-t border-white/5 space-y-3 sm:space-y-4 mt-auto">
                    {/* Error/Success Messages */}
                    {saveError && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 text-red-300 text-xs">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{saveError}</span>
                      </div>
                    )}

                    {saveSuccess && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 text-green-300 text-xs">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{saveSuccess}</span>
                      </div>
                    )}

                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={() => handleSaveToSpotify()}
                        disabled={isSaving}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span className="hidden sm:inline">Creating...</span>
                            <span className="sm:hidden">Save</span>
                          </>
                        ) : (
                          <>
                            <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Create Spotify Playlist</span>
                            <span className="sm:hidden">Save to Spotify</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => savedPlaylistUrl && window.open(savedPlaylistUrl, '_blank')}
                        disabled={!savedPlaylistUrl}
                        className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-300 flex items-center justify-center ${
                          savedPlaylistUrl
                            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                            : 'bg-white/5 border-white/5 text-gray-500 cursor-not-allowed'
                        }`}
                        title="Open in Spotify"
                      >
                        <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
