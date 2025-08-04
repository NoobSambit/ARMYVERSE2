'use client'

import React, { useState } from 'react'
import { Search, Plus, Trash2, Music, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import StreamingFocusForm from '@/components/forms/StreamingFocusForm'
import CompactPlaylistGrid from '@/components/playlist/CompactPlaylistGrid'
import { SongDoc, useAllSongs } from '@/hooks/useAllSongs'

export default function CreatePlaylist() {
  const [searchQuery, setSearchQuery] = useState('')
  const [playlistName, setPlaylistName] = useState('My BTS Playlist')
  const [playlistTracks, setPlaylistTracks] = useState<SongDoc[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [mode, setMode] = useState<'normal' | 'focus'>('normal')
  const [focusResult, setFocusResult] = useState<SongDoc[] | null>(null)
  const { songs: allSongs, loading: songsLoading } = useAllSongs()

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
                <CompactPlaylistGrid songs={focusResult} primaryId={focusResult[0]?.spotifyId} />
              </div>
            )}
          </>
        )}

        {/* connection banner visible in both modes */}
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-white font-medium">
                Spotify Status: {isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <button
              onClick={() => setIsConnected(!isConnected)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isConnected
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
              }`}
            >
              {isConnected ? 'Disconnect' : 'Connect to Spotify'}
            </button>
          </div>
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
                <div className="mt-6 flex space-x-4">
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                    Save to Spotify
                  </button>
                  <button 
                    className="px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl hover:border-purple-400 transition-colors"
                    title="Open in Spotify"
                    aria-label="Open playlist in Spotify"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}