'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Music, Heart, ArrowRight, Loader2, Info, Save, RefreshCw, X, Bookmark, Shuffle } from 'lucide-react'
import CompactPlaylistGrid from '@/components/playlist/CompactPlaylistGrid'
import MoodPills from '@/components/ui/MoodPills'
import InteractiveSlider from '@/components/ui/InteractiveSlider'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { SongDoc } from '@/hooks/useAllSongs'

interface Track {
  title: string
  artist: string
  album?: string
  spotifyId?: string
  spotifyUrl?: string
  albumArt?: string
  duration?: string
}

function AIPlaylistContent() {
  const { showToast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [prompt, setPrompt] = useState('')
  const [playlistName, setPlaylistName] = useState('')
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [playlistLength, setPlaylistLength] = useState(10)
  const [artistBias, setArtistBias] = useState<string[]>([])
  const [yearEra, setYearEra] = useState<string[]>([])
  const [playlistType, setPlaylistType] = useState('feel-based')
  const [showPreview, setShowPreview] = useState(false)
  const [savedConfigs, setSavedConfigs] = useState<Array<{
    id: number
    name: string
    prompt: string
    playlistName: string
    selectedMoods: string[]
    playlistLength: number
    artistBias: string[]
    yearEra: string[]
    playlistType: string
  }>>([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [configName, setConfigName] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Load saved configurations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai-playlist-configs')
    if (saved) {
      setSavedConfigs(JSON.parse(saved))
    }
  }, [])

  const saveCurrentConfig = () => {
    if (!configName.trim()) {
      showToast('error', 'Please enter a name for your configuration')
      return
    }

    const config = {
      id: Date.now(),
      name: configName.trim(),
      prompt,
      playlistName,
      selectedMoods,
      playlistLength,
      artistBias,
      yearEra,
      playlistType
    }
    
    const updated = [...savedConfigs, config]
    setSavedConfigs(updated)
    localStorage.setItem('ai-playlist-configs', JSON.stringify(updated))
    showToast('success', 'Configuration saved!')
    setShowSaveModal(false)
    setConfigName('')
  }

  const loadConfig = (config: {
    prompt: string
    playlistName: string
    selectedMoods: string[]
    playlistLength: number
    artistBias: string[]
    yearEra: string[]
    playlistType: string
  }) => {
    setPrompt(config.prompt)
    setPlaylistName(config.playlistName || '')
    setSelectedMoods(config.selectedMoods)
    setPlaylistLength(config.playlistLength)
    setArtistBias(config.artistBias)
    setYearEra(config.yearEra)
    setPlaylistType(config.playlistType)
    showToast('info', 'Configuration loaded!')
  }

  const deleteConfig = (configId: number) => {
    const updated = savedConfigs.filter(config => config.id !== configId)
    setSavedConfigs(updated)
    localStorage.setItem('ai-playlist-configs', JSON.stringify(updated))
    showToast('success', 'Configuration deleted!')
  }

  const generateSurprisePlaylist = () => {
    const surprisePrompts = [
      "Energetic songs for working out",
      "Chill vibes for studying",
      "Romantic evening playlist",
      "Songs for a rainy day drive",
      "High-energy party mix",
      "Peaceful meditation music",
      "Confident workout playlist",
      "Nostalgic throwback vibes"
    ]
    const randomPrompt = surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)]
    setPrompt(randomPrompt)
    setPlaylistName(`Surprise Playlist - ${new Date().toLocaleDateString()}`)
    showToast('info', 'Surprise playlist generated!')
  }

  const generatePlaylist = async () => {
    if (!prompt.trim()) {
      showToast('error', 'Please describe your playlist first!')
      return
    }
    
    setIsGenerating(true)
    setPlaylist([])
    showToast('info', 'Generating your personalized playlist...')

    try {
      const response = await fetch('/api/playlist/ai-playlist-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          mood: selectedMoods.join(', '),
          artistBias,
          playlistLength,
          yearEra,
          playlistType
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate playlist')
      }

      const data = await response.json()
      setPlaylist(data)
      showToast('success', `Generated ${data.length} songs for your playlist!`)
    } catch (error) {
      console.error('Error generating playlist:', error)
      showToast('error', 'Failed to generate playlist. Please try again.')
      
      // Fallback to basic generation
      try {
        const fallbackResponse = await fetch('/api/playlist/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        })

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          setPlaylist(fallbackData)
          showToast('warning', 'Used fallback generation method.')
        }
      } catch (fallbackError) {
        console.error('Fallback generation failed:', fallbackError)
        showToast('error', 'All generation methods failed. Please try again later.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToSpotify = async () => {
    if (playlist.length === 0) {
      showToast('error', 'No playlist to export!')
      return
    }

    showToast('info', 'Exporting to Spotify...')
    
    try {
      const response = await fetch('/api/playlist/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_SPOTIFY_TOKEN', // This would come from auth
        },
        body: JSON.stringify({
          name: playlistName || `AI Generated BTS Playlist - ${prompt}`,
          songs: playlist,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        window.open(data.playlistUrl, '_blank')
        showToast('success', 'Playlist exported to Spotify!')
      }
    } catch (error) {
      console.error('Error exporting to Spotify:', error)
      showToast('error', 'Failed to export to Spotify. Please try again.')
    }
  }

  // Convert Track interface to SongDoc for CompactPlaylistGrid
  const convertToSongDoc = (track: Track): SongDoc => ({
    spotifyId: track.spotifyId || '',
    name: track.title,
    artist: track.artist,
    album: track.album || '',
    thumbnails: {
      small: track.albumArt || '',
      medium: track.albumArt || '',
      large: track.albumArt || ''
    }
  })

  const artistOptions = [
    { name: 'RM', emoji: '👑', color: 'from-yellow-500 to-orange-500' },
    { name: 'Jin', emoji: '🌙', color: 'from-blue-500 to-indigo-500' },
    { name: 'SUGA', emoji: '🐱', color: 'from-gray-500 to-gray-600' },
    { name: 'Agust D', emoji: '🔥', color: 'from-red-500 to-orange-500' },
    { name: 'j-hope', emoji: '☀️', color: 'from-green-500 to-yellow-500' },
    { name: 'Jimin', emoji: '🌸', color: 'from-pink-500 to-rose-500' },
    { name: 'V', emoji: '🍇', color: 'from-purple-500 to-indigo-500' },
    { name: 'Jung Kook', emoji: '🐰', color: 'from-pink-500 to-red-500' }
  ]

  const eraOptions = [
    { value: '2013-2015', label: '2013-2015', emoji: '🌱', color: 'from-green-500 to-emerald-500' },
    { value: '2016-2017', label: '2016-2017', emoji: '🌟', color: 'from-blue-500 to-indigo-500' },
    { value: '2018-2019', label: '2018-2019', emoji: '💜', color: 'from-purple-500 to-pink-500' },
    { value: '2020-2021', label: '2020-2021', emoji: '🌈', color: 'from-pink-500 to-purple-500' },
    { value: '2022-2023', label: '2022-2023', emoji: '🎭', color: 'from-indigo-500 to-purple-500' },
    { value: '2024+', label: '2024+', emoji: '✨', color: 'from-yellow-500 to-orange-500' }
  ]

  const playlistTypeOptions = [
    { value: 'feel-based', label: 'Feel-based', emoji: '💫', color: 'from-purple-500 to-pink-500' },
    { value: 'era-based', label: 'Era-based', emoji: '🕰️', color: 'from-blue-500 to-indigo-500' },
    { value: 'member-based', label: 'Member-based', emoji: '👥', color: 'from-green-500 to-emerald-500' },
    { value: 'mixed', label: 'Mixed', emoji: '🎨', color: 'from-pink-500 to-purple-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a082a] to-[#3a1d5c] relative overflow-hidden">
      {/* Radial glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-purple-400 mr-3 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
              AI Playlist Generator
            </h1>
            <Sparkles className="w-8 h-8 text-purple-400 ml-3 animate-pulse" />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Create personalized BTS playlists powered by artificial intelligence
          </p>
        </div>

        {/* Generator Section - Black Card */}
        <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-800/80 p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Settings */}
            <div className="space-y-6">
              {/* Playlist Name */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Name your playlist
                  <span className="text-gray-400 text-sm ml-2">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="e.g., 'Workout Mix', 'Study Vibes'"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:border-purple-400 focus:outline-none text-white placeholder-gray-400 transition-all duration-200 backdrop-blur-sm"
                />
              </div>

              {/* Prompt Input */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Describe your playlist
                  <span className="text-gray-400 text-sm ml-2">(Required)</span>
                </label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'Energetic songs for working out' or 'Chill vibes for studying'"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:border-purple-400 focus:outline-none text-white placeholder-gray-400 transition-all duration-200 backdrop-blur-sm resize-none"
                    rows={4}
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      className="text-gray-400 hover:text-white transition-colors"
                      onClick={() => setShowPreview(!showPreview)}
                      title="Show examples"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {showPreview && (
                  <div className="mt-2 p-3 bg-black/30 rounded-lg text-sm text-gray-300 backdrop-blur-sm">
                    <p className="font-medium mb-2">Example descriptions:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• &ldquo;Songs for a rainy day drive&rdquo;</li>
                      <li>• &ldquo;High-energy workout mix&rdquo;</li>
                      <li>• &ldquo;Chill vibes for studying&rdquo;</li>
                      <li>• &ldquo;Romantic evening playlist&rdquo;</li>
                    </ul>
                  </div>
                )}
              </div>

              <MoodPills 
                selectedMoods={selectedMoods}
                onMoodChange={setSelectedMoods}
              />

              <InteractiveSlider
                value={playlistLength}
                onChange={setPlaylistLength}
                min={5}
                max={30}
                step={1}
                label="Playlist Length"
              />
            </div>

            {/* Right Column - Advanced Settings */}
            <div className="space-y-6">
              {/* Mobile Filters Toggle */}
              <div className="lg:hidden">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full px-6 py-3 shadow-md transition-transform hover:scale-105 flex items-center justify-center"
                >
                  <span className="mr-2">🎛️</span>
                  Advanced Filters
                  <ArrowRight className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {/* Filters Section */}
              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Member Selection */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Focus on Members
                    <span className="text-gray-400 text-sm ml-2">(Optional)</span>
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        {artistBias.length} selected
                      </span>
                      <button
                        onClick={() => setArtistBias([])}
                        className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                    
                    {/* Select All OT7 Button */}
                    <button
                      onClick={() => setArtistBias(artistOptions.map(a => a.name))}
                      className={`w-full p-3 rounded-xl border-2 transition-all duration-200 ${
                        artistBias.length === artistOptions.length
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400 text-white shadow-lg'
                          : 'bg-white/10 border-white/20 text-gray-300 hover:border-purple-400/50'
                      }`}
                    >
                      <span className="mr-2">💜</span>
                      Select All OT7
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      {artistOptions.map((artist) => (
                        <button
                          key={artist.name}
                          onClick={() => {
                            if (artistBias.includes(artist.name)) {
                              setArtistBias(artistBias.filter(a => a !== artist.name))
                            } else {
                              setArtistBias([...artistBias, artist.name])
                            }
                          }}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center space-x-2 ${
                            artistBias.includes(artist.name)
                              ? `bg-gradient-to-r ${artist.color} border-white text-white shadow-lg ring-2 ring-purple-400`
                              : 'bg-white/10 border-white/20 text-gray-300 hover:border-purple-400/50'
                          }`}
                        >
                          <span className="text-lg">{artist.emoji}</span>
                          <span className="text-sm font-medium">{artist.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Era Selection */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Era Focus
                    <span className="text-gray-400 text-sm ml-2">(Optional)</span>
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        {yearEra.length} selected
                      </span>
                      <button
                        onClick={() => setYearEra([])}
                        className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {eraOptions.map((era) => (
                        <button
                          key={era.value}
                          onClick={() => {
                            if (yearEra.includes(era.value)) {
                              setYearEra(yearEra.filter(e => e !== era.value))
                            } else {
                              setYearEra([...yearEra, era.value])
                            }
                          }}
                          className={`p-2 rounded-xl border-2 transition-all duration-200 flex items-center space-x-2 ${
                            yearEra.includes(era.value)
                              ? `bg-gradient-to-r ${era.color} border-white text-white shadow-lg`
                              : 'bg-white/10 border-white/20 text-gray-300 hover:border-purple-400/50'
                          }`}
                        >
                          <span className="text-sm">{era.emoji}</span>
                          <span className="text-xs font-medium">{era.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Playlist Type */}
                <div>
                  <label className="block text-white font-medium mb-2">Playlist Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {playlistTypeOptions.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setPlaylistType(type.value)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center space-x-2 ${
                          playlistType === type.value
                            ? `bg-gradient-to-r ${type.color} border-white text-white shadow-lg`
                            : 'bg-white/10 border-white/20 text-gray-300 hover:border-purple-400/50'
                        }`}
                      >
                        <span className="text-lg">{type.emoji}</span>
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
            <button
              onClick={() => setShowSaveModal(true)}
              className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-full border border-white/20 hover:border-purple-400/50 transition-all duration-200 backdrop-blur-sm flex items-center"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Save Configuration
            </button>
            
            <button
              onClick={generateSurprisePlaylist}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 px-6 rounded-full shadow-md transition-transform hover:scale-105 flex items-center"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Surprise Me
            </button>
            
            <button
              onClick={generatePlaylist}
              disabled={isGenerating || !prompt.trim()}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-3 px-6 rounded-full shadow-md transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate AI Playlist
                </>
              )}
            </button>
          </div>

          {/* Saved Configurations */}
          {savedConfigs.length > 0 && (
            <div className="mt-6 p-4 bg-black/30 rounded-lg border border-white/20 backdrop-blur-sm">
              <h3 className="text-white font-medium mb-3 flex items-center">
                <Bookmark className="w-4 h-4 mr-2 text-purple-400" />
                Saved Configurations
              </h3>
              <div className="flex flex-wrap gap-2">
                {savedConfigs.slice(-5).map((config) => (
                  <div key={config.id} className="flex items-center space-x-2">
                    <button
                      onClick={() => loadConfig(config)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-full transition-colors border border-white/20 hover:border-purple-500"
                    >
                      {config.name}
                    </button>
                    <button
                      onClick={() => deleteConfig(config.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete configuration"
                      aria-label={`Delete configuration ${config.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Playlist Results */}
        {playlist.length > 0 && (
          <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-800/80 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Your AI-Generated Playlist</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">{playlist.length} songs</span>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg border border-white/20 hover:border-purple-400/50 transition-all duration-200 backdrop-blur-sm flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate New
                </button>
              </div>
            </div>
            
            <CompactPlaylistGrid 
              songs={playlist.map(convertToSongDoc)} 
              primaryId={null} 
            />

            <div className="mt-8 flex justify-center">
              <button 
                onClick={exportToSpotify}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-6 rounded-full shadow-md transition-transform hover:scale-105 flex items-center"
              >
                <Music className="w-4 h-4 mr-2" />
                Export to Spotify
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Configuration Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/95 rounded-2xl p-6 w-full max-w-md mx-4 border border-white/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Bookmark className="w-5 h-5 mr-2 text-purple-400" />
                Save Configuration
              </h3>
              <button
                onClick={() => {
                  setShowSaveModal(false)
                  setConfigName('')
                }}
                className="text-gray-400 hover:text-white transition-colors"
                title="Close modal"
                aria-label="Close save configuration modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Configuration Name
                  <span className="text-gray-400 text-sm ml-2">(Required)</span>
                </label>
                <input
                  type="text"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  placeholder="e.g., 'Workout Mix', 'Study Vibes'"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:border-purple-400 focus:outline-none text-white placeholder-gray-400 transition-all duration-200 backdrop-blur-sm"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      saveCurrentConfig()
                    }
                  }}
                />
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => {
                    setShowSaveModal(false)
                    setConfigName('')
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg border border-white/20 hover:border-purple-400/50 transition-all duration-200 backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCurrentConfig}
                  disabled={!configName.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}

export default function AIPlaylistPage() {
  return (
    <ToastProvider>
      <AIPlaylistContent />
    </ToastProvider>
  )
} 