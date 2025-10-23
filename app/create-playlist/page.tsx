'use client'

import React, { useState } from 'react'
import { Search, Plus, Trash2, Music, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import StreamingFocusForm from '@/components/forms/StreamingFocusForm'
import CompactPlaylistGrid from '@/components/playlist/CompactPlaylistGrid'
import { SongDoc, useAllSongs } from '@/hooks/useAllSongs'
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth'

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
  const { isAuthenticated, isLoading, disconnect } = useSpotifyAuth()

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

  const handleSaveToSpotify = async (songsToSave?: SongDoc[]) => {
    if (!isAuthenticated) {
      setSaveError('Please connect your Spotify account first')
      return
    }

    const tracks = songsToSave || playlistTracks
    if (tracks.length === 0) {
      setSaveError('Please add some tracks to your playlist first')
      return
    }

    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(null)

    try {
      // Get Spotify token from localStorage
      const spotifyTokenData = localStorage.getItem('spotify_token')
      let token = null
      
      if (spotifyTokenData) {
        try {
          const tokenObj = JSON.parse(spotifyTokenData)
          token = tokenObj.access_token
        } catch (error) {
          console.error('Error parsing Spotify token:', error)
        }
      }

      if (!token) {
        throw new Error('Spotify access token not found. Please reconnect your account.')
      }

      const response = await fetch('/api/playlist/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: playlistName,
          songs: tracks.map(track => ({
            title: track.name,
            artist: track.artist,
            spotifyId: track.spotifyId
          }))
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save playlist to Spotify')
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
  }



  return (
    <div className="min-h-screen page-gradient relative overflow-hidden">
      {/* Aurora Background Effects */}
      <div className="aurora-container absolute inset-0 pointer-events-none">
        <div className="aurora-glow aurora-glow-1" />
        <div className="aurora-glow aurora-glow-2" />
        <div className="aurora-glow aurora-glow-3" />
      </div>

      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* header + tabs */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#FF9AD5] via-[#C084FC] to-[#A274FF] bg-clip-text text-transparent">Create Playlist</span>
            </h1>
            <p className="text-gray-300 mb-6 text-lg">Prefer AI-assisted playlists? <a className="text-[#C084FC] hover:text-[#A274FF] underline decoration-[#C084FC]/60 hover:decoration-[#A274FF] transition-colors font-medium" href="/ai-playlist">Try AI Playlist</a></p>
            
            {/* Segmented Control */}
            <div className="segmented">
              <div 
                className="segmented-thumb" 
                style={{
                  width: '50%',
                  left: mode === 'normal' ? '0.25rem' : '50%',
                  transform: mode === 'normal' ? 'translateX(0)' : 'translateX(-0.25rem)'
                }}
              />
              <button
                onClick={() => setMode('normal')}
                aria-selected={mode === 'normal'}
                className="segmented-item px-8"
              >
                Normal
              </button>
              <button
                onClick={() => setMode('focus')}
                aria-selected={mode === 'focus'}
                className="segmented-item px-8"
              >
                Streaming Focus
              </button>
            </div>
          </div>

        {/* STREAMING FOCUS WORKFLOW */}
        {mode === 'focus' && (
          <>
            <StreamingFocusForm onGenerated={(songs) => setFocusResult(songs)} />
            {focusResult && (
              <div className="mb-10">
                <h3 className="text-white text-2xl font-bold mb-4">Generated Playlist</h3>
                
                {/* Playlist Name Input */}
                <div className="mb-6">
                  <label className="block text-white font-medium mb-2">Playlist Name</label>
                  <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    className="input-glass"
                    placeholder="Enter playlist name"
                    aria-label="Playlist name"
                  />
                </div>

                <CompactPlaylistGrid songs={focusResult} primaryId={focusResult[0]?.spotifyId} />

                {/* Export to Spotify Section */}
                <div className="mt-6 space-y-4">
                  {/* Error/Success Messages */}
                  {saveError && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-300">{saveError}</span>
                    </div>
                  )}
                  
                  {saveSuccess && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-300">{saveSuccess}</span>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button 
                      onClick={() => handleSaveToSpotify(focusResult)}
                      disabled={!isAuthenticated || isSaving}
                      className={`flex-1 ${
                        !isAuthenticated
                          ? 'btn-glass-secondary opacity-50 cursor-not-allowed'
                          : 'btn-glass-primary'
                      }`}
                    >
                      {isSaving ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        'Save to Spotify'
                      )}
                    </button>
                    <button 
                      onClick={() => savedPlaylistUrl && window.open(savedPlaylistUrl, '_blank')}
                      disabled={!savedPlaylistUrl}
                      className={`px-4 py-3 rounded-xl transition-colors ${
                        savedPlaylistUrl
                          ? 'bg-black/50 border border-gray-700 text-white hover:border-purple-400'
                          : 'bg-gray-600 border border-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                      title="Open in Spotify"
                      aria-label="Open playlist in Spotify"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

          {/* Spotify Connection Banner */}
          <div className="container-glass rounded-2xl p-6 mb-10">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[#C084FC] border-t-transparent rounded-full animate-spin mr-3"></div>
                <span className="text-white font-medium">Checking Spotify connection...</span>
              </div>
            ) : isAuthenticated ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3 bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.6)]"></div>
                  <span className="text-white font-medium text-lg">
                    Spotify Connected
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="btn-glass-secondary text-red-400 hover:text-red-300"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3 bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.6)]"></div>
                  <span className="text-white font-medium text-lg">
                    Spotify Not Connected
                  </span>
                </div>
                <button
                  onClick={() => {
                    window.location.href = '/stats'
                  }}
                  className="btn-glass-primary"
                >
                  Connect to Spotify
                </button>
              </div>
            )}
          </div>

          {/* MANUAL CREATOR WORKFLOW */}
          {mode === 'normal' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* search */}
              <div className="container-glass rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Search className="w-6 h-6 mr-3 text-purple-400" />
                Search BTS Songs
              </h2>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for BTS songs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-glass pl-10"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
                {filteredTracks.map((track) => (
                  <div
                    key={track.spotifyId}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-[#C084FC]/50 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={track.thumbnails?.large || track.thumbnails?.medium || track.thumbnails?.small || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=40&h=40&fit=crop'}
                          alt={track.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{track.name}</h3>
                        <p className="text-gray-400 text-sm">{track.artist}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => addToPlaylist(track)}
                      className="btn-toolbar is-active"
                      title="Add to playlist"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

              {/* playlist */}
              <div className="container-glass rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Music className="w-6 h-6 mr-3 text-purple-400" />
                Your Playlist
              </h2>

              <div className="mb-6">
                <label className="block text-white font-medium mb-2">Playlist Name</label>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="input-glass"
                  placeholder="Enter playlist name"
                  aria-label="Playlist name"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
                {playlistTracks.map((track) => (
                  <div
                    key={track.spotifyId}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={track.thumbnails?.large || track.thumbnails?.medium || track.thumbnails?.small || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=40&h=40&fit=crop'}
                          alt={track.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{track.name}</h3>
                        <p className="text-gray-400 text-sm">{track.artist}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromPlaylist(track.spotifyId)}
                      className="btn-toolbar hover:text-red-400"
                      title="Remove from playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {playlistTracks.length > 0 && (
                <div className="mt-6 space-y-4">
                  {/* Error/Success Messages */}
                  {saveError && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-300">{saveError}</span>
                    </div>
                  )}
                  
                  {saveSuccess && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-300">{saveSuccess}</span>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button 
                      onClick={() => handleSaveToSpotify()}
                      disabled={!isAuthenticated || isSaving}
                      className={`flex-1 ${
                        !isAuthenticated
                          ? 'btn-glass-secondary opacity-50 cursor-not-allowed'
                          : 'btn-glass-primary'
                      }`}
                    >
                      {isSaving ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        'Save to Spotify'
                      )}
                    </button>
                    <button 
                      onClick={() => savedPlaylistUrl && window.open(savedPlaylistUrl, '_blank')}
                      disabled={!savedPlaylistUrl}
                      className={savedPlaylistUrl ? 'btn-glass-secondary' : 'btn-glass-secondary opacity-50 cursor-not-allowed'}+
                      title="Open in Spotify"
                      aria-label="Open playlist in Spotify"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}