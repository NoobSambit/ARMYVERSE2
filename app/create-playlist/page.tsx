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
    <div className="min-h-screen py-8 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* header + tabs */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
            Create Playlist
          </h1>
          <div className="inline-flex bg-black/50 rounded-xl overflow-hidden border border-purple-500/40">
            <button
              onClick={() => setMode('normal')}
              className={`px-5 py-2 font-medium ${mode === 'normal' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >Normal</button>
            <button
              onClick={() => setMode('focus')}
              className={`px-5 py-2 font-medium ${mode === 'focus' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >Streaming Focus</button>
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
                    className="w-full px-4 py-3 bg-black/80 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
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
                      className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-colors ${
                        !isAuthenticated
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : isSaving
                          ? 'bg-purple-600 text-white cursor-wait'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
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

        {/* connection banner visible in both modes */}
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-green-500/20">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-white font-medium">Checking Spotify connection...</span>
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-3 bg-green-400"></div>
                <span className="text-white font-medium">
                  Spotify Status: Connected
                </span>
              </div>
              <button
                onClick={disconnect}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-3 bg-red-400"></div>
                <span className="text-white font-medium">
                  Spotify Status: Not Connected
                </span>
              </div>
              <button
                onClick={() => {
                  // Redirect to Spotify auth
                  window.location.href = '/stats'
                }}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
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
            <div className="bg-black/50 backdrop-blur-lg rounded-3xl p-8 border border-purple-500/20">
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
                  className="w-full pl-10 pr-4 py-3 bg-black/80 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredTracks.map((track) => (
                  <div
                    key={track.spotifyId}
                    className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-gray-700 hover:border-purple-400 transition-colors"
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
                      className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                      title="Add to playlist"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* playlist */}
            <div className="bg-black/50 backdrop-blur-lg rounded-3xl p-8 border border-purple-500/20">
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
                    className="w-full px-4 py-3 bg-black/80 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                    placeholder="Enter playlist name"
                    aria-label="Playlist name"
                  />
                </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {playlistTracks.map((track) => (
                  <div
                    key={track.spotifyId}
                    className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-gray-700"
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
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
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
                      className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-colors ${
                        !isAuthenticated
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : isSaving
                          ? 'bg-purple-600 text-white cursor-wait'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}