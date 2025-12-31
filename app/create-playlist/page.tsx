'use client'

import React, { useState, useCallback } from 'react'
import { Search, Plus, Trash2, Music, ExternalLink, CheckCircle, AlertCircle, Sparkles, AudioWaveform as Audio, ListMusic } from 'lucide-react'
import Image from 'next/image'
import StreamingFocusForm from '@/components/forms/StreamingFocusForm'
import CompactPlaylistGrid from '@/components/playlist/CompactPlaylistGrid'
import { SongDoc, useAllSongs } from '@/hooks/useAllSongs'
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth'
import Link from 'next/link'

export default function CreatePlaylist() {
  const [searchQuery, setSearchQuery] = useState('')
  const [playlistName, setPlaylistName] = useState('My BTS Playlist')
  const [playlistTracks, setPlaylistTracks] = useState<SongDoc[]>([])
  const [mode, setMode] = useState<'normal' | 'focus'>('normal')
  const [focusResult, setFocusResult] = useState<SongDoc[] | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [savedPlaylistUrl, setSavedPlaylistUrl] = useState<string | null>(null)
  const { songs: allSongs } = useAllSongs()
  const { status, refreshStatus } = useSpotifyAuth()

  const filteredTracks = allSongs.filter(track =>
    track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.album.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addToPlaylist = (track: SongDoc) => {
    if (!playlistTracks.find(t => t.spotifyId === track.spotifyId)) {
      setPlaylistTracks([...playlistTracks, track])
    }
  }

  const removeFromPlaylist = (spotifyId: string) => {
    setPlaylistTracks(playlistTracks.filter(t => t.spotifyId !== spotifyId))
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
  }, [playlistName, playlistTracks, status, refreshStatus, setSaveError, setSaveSuccess])

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
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="glass-effect rounded-3xl p-6 sm:p-8 border border-white/10 bg-black/40 backdrop-blur-xl">
               <StreamingFocusForm onGenerated={(songs) => setFocusResult(songs)} />
            </div>
            
            {focusResult && (
              <div className="glass-effect rounded-3xl p-6 sm:p-8 border border-white/10 bg-black/40 backdrop-blur-xl">
                <h3 className="text-2xl font-bold text-white mb-6">Generated Playlist</h3>
                
                {/* Playlist Name Input */}
                <div className="mb-6">
                  <label className="block text-gray-400 text-sm font-medium mb-2 pl-1">Name</label>
                  <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-purple-400/50 focus:bg-white/10 focus:outline-none text-white placeholder-gray-500 transition-all duration-300"
                    placeholder="Enter playlist name"
                  />
                </div>

                <CompactPlaylistGrid songs={focusResult} primaryId={focusResult[0]?.spotifyId} />

                {/* Export to Spotify Section */}
                <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                  {/* Error/Success Messages */}
                  {saveError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-300 text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{saveError}</span>
                    </div>
                  )}
                  
                  {saveSuccess && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 text-green-300 text-sm">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{saveSuccess}</span>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleSaveToSpotify(focusResult)}
                      disabled={isSaving}
                      className="flex-1 bg-white text-black hover:bg-gray-100 font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                           <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                           <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Music className="w-5 h-5" />
                          <span>Save to Spotify</span>
                        </>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => savedPlaylistUrl && window.open(savedPlaylistUrl, '_blank')}
                      disabled={!savedPlaylistUrl}
                      className={`px-5 py-3.5 rounded-xl border transition-all duration-300 flex items-center justify-center ${
                        savedPlaylistUrl
                          ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                          : 'bg-white/5 border-white/5 text-gray-500 cursor-not-allowed'
                      }`}
                      title="Open in Spotify"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

          {/* MANUAL CREATOR WORKFLOW */}
          {mode === 'normal' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Search Panel */}
              <div className="glass-effect rounded-3xl p-6 sm:p-8 border border-white/10 bg-black/40 backdrop-blur-xl h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <Search className="w-5 h-5 text-purple-300" />
                   </div>
                   <h2 className="text-xl font-bold text-white">Find Songs</h2>
                </div>

                <div className="relative mb-6">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by title or album..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-400/50 focus:bg-white/10 focus:outline-none text-white placeholder-gray-500 transition-all duration-300 text-sm"
                  />
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                  {filteredTracks.map((track) => (
                    <div
                      key={track.spotifyId}
                      className="group flex items-center justify-between p-3 bg-white/5 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/10 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 relative">
                          <Image
                            src={track.thumbnails?.medium || track.thumbnails?.small || '/images/placeholder.jpg'}
                            alt={track.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-white font-medium text-sm truncate">{track.name}</h3>
                          <p className="text-gray-500 text-xs truncate">{track.artist}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => addToPlaylist(track)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:bg-purple-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                        title="Add to playlist"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {filteredTracks.length === 0 && (
                    <div className="text-center py-12 text-gray-500 text-sm">
                      No songs found matching &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              </div>

              {/* Playlist Panel */}
              <div className="glass-effect rounded-3xl p-6 sm:p-8 border border-white/10 bg-black/40 backdrop-blur-xl h-full flex flex-col sticky top-8">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <ListMusic className="w-5 h-5 text-pink-300" />
                   </div>
                   <h2 className="text-xl font-bold text-white">Your Mix</h2>
                   <span className="ml-auto text-xs font-medium px-2 py-1 bg-white/5 rounded-md text-gray-400">
                     {playlistTracks.length} songs
                   </span>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-400 text-xs font-medium mb-2 pl-1 uppercase tracking-wider">Playlist Name</label>
                  <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-400/50 focus:bg-white/10 focus:outline-none text-white placeholder-gray-500 transition-all duration-300 text-sm"
                    placeholder="My Awesome Mix"
                  />
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar min-h-[200px] mb-6">
                  {playlistTracks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12 border-2 border-dashed border-white/5 rounded-xl">
                       <Music className="w-10 h-10 text-gray-600 mb-3" />
                       <p className="text-gray-500 text-sm">Your playlist is empty</p>
                       <p className="text-gray-600 text-xs mt-1">Add songs from the search panel</p>
                    </div>
                  ) : (
                    playlistTracks.map((track) => (
                      <div
                        key={track.spotifyId}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 relative">
                            <Image
                              src={track.thumbnails?.small || '/images/placeholder.jpg'}
                              alt={track.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-white font-medium text-sm truncate">{track.name}</h3>
                            <p className="text-gray-500 text-xs truncate">{track.artist}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromPlaylist(track.spotifyId)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Remove from playlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {playlistTracks.length > 0 && (
                  <div className="pt-6 border-t border-white/5 space-y-4 mt-auto">
                    {/* Error/Success Messages */}
                    {saveError && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3 text-red-300 text-xs">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{saveError}</span>
                      </div>
                    )}
                    
                    {saveSuccess && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3 text-green-300 text-xs">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{saveSuccess}</span>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleSaveToSpotify()}
                        disabled={isSaving}
                        className="flex-1 bg-white text-black hover:bg-gray-100 font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Music className="w-4 h-4" />
                            <span>Save to Spotify</span>
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => savedPlaylistUrl && window.open(savedPlaylistUrl, '_blank')}
                        disabled={!savedPlaylistUrl}
                        className={`px-4 py-3 rounded-xl border transition-all duration-300 flex items-center justify-center ${
                          savedPlaylistUrl
                            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                            : 'bg-white/5 border-white/5 text-gray-500 cursor-not-allowed'
                        }`}
                        title="Open in Spotify"
                      >
                        <ExternalLink className="w-4 h-4" />
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