'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Music, Heart, ArrowRight, Loader2, Info, Save, RefreshCw, X, Bookmark, Shuffle, Users, Clock, Zap } from 'lucide-react'
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
      showToast('error', 'Please connect your Spotify account first!')
      return
    }

    showToast('info', 'Exporting to Spotify...')
    
    try {
      const response = await fetch('/api/playlist/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: playlistName || `AI Generated BTS Playlist - ${prompt}`,
          songs: playlist,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        window.open(data.playlistUrl, '_blank')
        showToast('success', 'Playlist exported to Spotify!')
      } else {
        throw new Error(data.error || 'Failed to export playlist')
      }
    } catch (error) {
      console.error('Error exporting to Spotify:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to export to Spotify. Please try again.')
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
      {/* Enhanced Radial glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/15 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mr-3 animate-pulse" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient">
              AI Playlist Generator
            </h1>
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 ml-3 animate-pulse" />
          </div>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Create personalized BTS playlists powered by artificial intelligence
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Playlist Inputs (2/3 width on xl screens) */}
          <div className="xl:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="glass-effect rounded-2xl p-6 shadow-xl border-2 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 group">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
                  <Music className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">🎵 Playlist Details</h3>
              </div>
              
              <div className="space-y-4">
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
                    className="w-full p-3 bg-black/40 border-2 border-white/20 rounded-xl focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white placeholder-gray-400 transition-all duration-200 backdrop-blur-sm hover:border-purple-300/30"
                  />
                  <p className="text-xs text-gray-400 mt-1">Give your playlist a memorable name</p>
                </div>

                {/* Prompt Input */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Describe your playlist
                    <span className="text-red-400 text-sm ml-2">*Required</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., 'Energetic songs for working out' or 'Chill vibes for studying'"
                      className="w-full p-3 bg-black/40 border-2 border-white/20 rounded-xl focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white placeholder-gray-400 transition-all duration-200 backdrop-blur-sm resize-none hover:border-purple-300/30"
                      rows={4}
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                        onClick={() => setShowPreview(!showPreview)}
                        title="Show examples"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Describe the vibe or theme of your playlist</p>
                  
                  {showPreview && (
                    <div className="mt-3 p-4 bg-black/50 rounded-lg text-sm text-gray-300 backdrop-blur-sm border border-white/10">
                      <p className="font-medium mb-2 text-purple-300">Example descriptions:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• &ldquo;Songs for a rainy day drive&rdquo;</li>
                        <li>• &ldquo;High-energy workout mix&rdquo;</li>
                        <li>• &ldquo;Chill vibes for studying&rdquo;</li>
                        <li>• &ldquo;Romantic evening playlist&rdquo;</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mood Selection Card */}
            <div className="glass-effect rounded-2xl p-6 shadow-xl border-2 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mr-3">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">🎭 Mood Selection</h3>
              </div>
              <MoodPills 
                selectedMoods={selectedMoods}
                onMoodChange={setSelectedMoods}
              />
            </div>

            {/* Playlist Length Card */}
            <div className="glass-effect rounded-2xl p-6 shadow-xl border-2 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-3">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">⏱️ Playlist Length</h3>
              </div>
              <InteractiveSlider
                value={playlistLength}
                onChange={setPlaylistLength}
                min={5}
                max={30}
                step={1}
                label=""
              />
            </div>

            {/* Member Focus Card */}
            <div className="glass-effect rounded-2xl p-6 shadow-xl border-2 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mr-3">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">👑 Focus on Members</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
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
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 group ${
                    artistBias.length === artistOptions.length
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-black/30 border-white/20 text-gray-300 hover:border-purple-400/50 hover:bg-black/50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <span className="text-xl mr-3">💜</span>
                    <span className="font-semibold">Select All OT7</span>
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-3">
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
                      className={`p-3 rounded-xl border-2 transition-all duration-300 flex items-center space-x-3 group ${
                        artistBias.includes(artist.name)
                          ? `bg-gradient-to-r ${artist.color} border-white text-white shadow-lg shadow-purple-500/25 ring-2 ring-purple-400/30`
                          : 'bg-black/30 border-white/20 text-gray-300 hover:border-purple-400/50 hover:bg-black/50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-lg">{artist.emoji}</span>
                      </div>
                      <span className="text-sm font-medium">{artist.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Era Focus Card */}
            <div className="glass-effect rounded-2xl p-6 shadow-xl border-2 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-3">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">🕰️ Era Focus</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
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
                
                <div className="grid grid-cols-2 gap-3">
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
                      className={`p-3 rounded-xl border-2 transition-all duration-300 flex items-center space-x-2 ${
                        yearEra.includes(era.value)
                          ? `bg-gradient-to-r ${era.color} border-white text-white shadow-lg shadow-purple-500/25`
                          : 'bg-black/30 border-white/20 text-gray-300 hover:border-purple-400/50 hover:bg-black/50'
                      }`}
                    >
                      <span className="text-lg">{era.emoji}</span>
                      <span className="text-sm font-medium">{era.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Playlist Type Card */}
            <div className="glass-effect rounded-2xl p-6 shadow-xl border-2 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mr-3">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">🎨 Playlist Type</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {playlistTypeOptions.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setPlaylistType(type.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-3 ${
                      playlistType === type.value
                        ? `bg-gradient-to-r ${type.color} border-white text-white shadow-lg shadow-purple-500/25`
                        : 'bg-black/30 border-white/20 text-gray-300 hover:border-purple-400/50 hover:bg-black/50'
                    }`}
                  >
                    <span className="text-xl">{type.emoji}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Preview Panel (1/3 width on xl screens) */}
          <div className="xl:col-span-1 space-y-6">
            {/* Live Preview Panel */}
            <div className="glass-effect rounded-2xl p-6 shadow-xl border-2 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 sticky top-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">✨ Live Preview</h3>
              </div>
              
              <div className="space-y-4">
                {/* Playlist Title Preview */}
                <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30">
                  <h4 className="font-semibold text-white mb-1">
                    {playlistName || 'Untitled Playlist'}
                  </h4>
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {prompt || 'No description yet...'}
                  </p>
                </div>

                {/* Selected Moods */}
                {selectedMoods.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Moods:</h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedMoods.slice(0, 3).map((mood) => (
                        <span key={mood} className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs rounded-full">
                          {mood}
                        </span>
                      ))}
                      {selectedMoods.length > 3 && (
                        <span className="px-2 py-1 bg-gray-500/30 text-gray-300 text-xs rounded-full">
                          +{selectedMoods.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Selected Members */}
                {artistBias.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Members:</h5>
                    <div className="flex flex-wrap gap-1">
                      {artistBias.slice(0, 4).map((member) => (
                        <span key={member} className="px-2 py-1 bg-pink-500/30 text-pink-200 text-xs rounded-full">
                          {member}
                        </span>
                      ))}
                      {artistBias.length > 4 && (
                        <span className="px-2 py-1 bg-gray-500/30 text-gray-300 text-xs rounded-full">
                          +{artistBias.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Selected Eras */}
                {yearEra.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Eras:</h5>
                    <div className="flex flex-wrap gap-1">
                      {yearEra.map((era) => (
                        <span key={era} className="px-2 py-1 bg-indigo-500/30 text-indigo-200 text-xs rounded-full">
                          {era}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Playlist Stats */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Length:</span>
                    <span className="text-purple-300 font-medium">{playlistLength} songs</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-purple-300 font-medium capitalize">{playlistType.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Saved Configurations */}
            {savedConfigs.length > 0 && (
              <div className="glass-effect rounded-2xl p-6 shadow-xl border-2 border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Bookmark className="w-5 h-5 mr-2 text-purple-400" />
                  Saved Configs
                </h3>
                <div className="space-y-2">
                  {savedConfigs.slice(-3).map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-2 bg-black/30 rounded-lg">
                      <button
                        onClick={() => loadConfig(config)}
                        className="flex-1 text-left text-sm text-white hover:text-purple-300 transition-colors truncate"
                      >
                        {config.name}
                      </button>
                      <button
                        onClick={() => deleteConfig(config.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors ml-2"
                        title="Delete configuration"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Sticky on Mobile */}
        <div className="mt-8 sticky bottom-4 z-20">
          <div className="glass-effect rounded-2xl p-4 shadow-xl border-2 border-purple-500/20">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setShowSaveModal(true)}
                className="w-full sm:w-auto bg-black/50 hover:bg-black/70 text-white font-medium py-3 px-6 rounded-full border-2 border-white/20 hover:border-purple-400/50 transition-all duration-300 backdrop-blur-sm flex items-center justify-center group"
              >
                <Bookmark className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Save Configuration
              </button>
              
              <button
                onClick={generateSurprisePlaylist}
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center group"
              >
                <Shuffle className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Surprise Me
              </button>
              
              <button
                onClick={generatePlaylist}
                disabled={isGenerating || !prompt.trim()}
                className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center group"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Generate AI Playlist
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Playlist Results */}
        {playlist.length > 0 && (
          <div className="mt-8 glass-effect rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-purple-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white mb-4 sm:mb-0">Your AI-Generated Playlist</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">{playlist.length} songs</span>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-black/50 hover:bg-black/70 text-white font-medium py-2 px-4 rounded-lg border-2 border-white/20 hover:border-purple-400/50 transition-all duration-300 backdrop-blur-sm flex items-center"
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
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center"
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