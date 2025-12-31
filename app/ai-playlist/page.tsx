'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Music, Heart, Loader2, Info, Save, RefreshCw, X, Bookmark, Shuffle, Users, Clock, Zap, Crown, Star, Mic2, Flame, Sun, Palette, Sprout, Globe, User, History } from 'lucide-react'
import CompactPlaylistGrid from '@/components/playlist/CompactPlaylistGrid'
import MoodPills from '@/components/ui/MoodPills'
import InteractiveSlider from '@/components/ui/InteractiveSlider'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { SongDoc } from '@/hooks/useAllSongs'
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth'

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
  const { isAuthenticated, status, refreshStatus } = useSpotifyAuth()

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

    if (!isAuthenticated) {
      showToast('error', 'Please connect your Spotify account first!')
      return
    }

    let accessToken = status?.accessToken

    if (!accessToken) {
      const refreshed = await refreshStatus()
      accessToken = refreshed?.accessToken
    }

    if (!accessToken) {
      showToast('error', 'Unable to retrieve Spotify access token. Please reconnect your account.')
      return
    }

    showToast('info', 'Exporting to Spotify...')
    
    try {
      const response = await fetch('/api/playlist/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: playlistName || `AI Generated BTS Playlist - ${prompt}`,
          songs: playlist,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await refreshStatus()
          if (refreshed?.accessToken) {
            const retryResponse = await fetch('/api/playlist/export', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshed.accessToken}`,
              },
              body: JSON.stringify({
                name: playlistName || `AI Generated BTS Playlist - ${prompt}`,
                songs: playlist,
              }),
            })

            const retryData = await retryResponse.json()
            if (!retryResponse.ok) {
              throw new Error(retryData.error || 'Failed to export playlist')
            }

            window.open(retryData.playlistUrl, '_blank')
            showToast('success', 'Playlist exported to Spotify!')
            return
          }
        }

        throw new Error(data.error || 'Failed to export playlist')
      }

      window.open(data.playlistUrl, '_blank')
      showToast('success', 'Playlist exported to Spotify!')
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
    { name: 'RM', icon: Crown, color: 'text-yellow-400' },
    { name: 'Jin', icon: Star, color: 'text-blue-300' },
    { name: 'SUGA', icon: Mic2, color: 'text-gray-400' },
    { name: 'Agust D', icon: Flame, color: 'text-red-400' },
    { name: 'j-hope', icon: Sun, color: 'text-green-400' },
    { name: 'Jimin', icon: Heart, color: 'text-pink-300' },
    { name: 'V', icon: Palette, color: 'text-purple-300' },
    { name: 'Jung Kook', icon: Music, color: 'text-pink-400' }
  ]

  const eraOptions = [
    { value: '2013-2015', label: '2013-2015', icon: Sprout, color: 'text-green-300' },
    { value: '2016-2017', label: '2016-2017', icon: Flame, color: 'text-blue-300' },
    { value: '2018-2019', label: '2018-2019', icon: Heart, color: 'text-purple-300' },
    { value: '2020-2021', label: '2020-2021', icon: Globe, color: 'text-pink-300' },
    { value: '2022-2023', label: '2022-2023', icon: Users, color: 'text-indigo-300' },
    { value: '2024+', label: '2024+', icon: Sparkles, color: 'text-yellow-300' }
  ]

  const playlistTypeOptions = [
    { value: 'feel-based', label: 'Feel-based', icon: Heart, color: 'text-purple-300' },
    { value: 'era-based', label: 'Era-based', icon: History, color: 'text-blue-300' },
    { value: 'member-based', label: 'Member-based', icon: User, color: 'text-green-300' },
    { value: 'mixed', label: 'Mixed', icon: Shuffle, color: 'text-pink-300' }
  ]

  return (
    <div className="min-h-screen page-gradient relative overflow-hidden">
      {/* Subtle background glow - luxurious feel */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Minimalist Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            AI Playlist Generator
          </h1>
          <p className="text-gray-400 text-lg font-light max-w-2xl mx-auto">
            Craft your perfect BTS soundscape with AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column - Controls (8/12 width) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Core Configuration Card */}
            <div className="glass-effect rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Sparkles className="w-5 h-5 text-purple-300" />
                </div>
                <h2 className="text-xl font-semibold text-white tracking-wide">Vibe & Atmosphere</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5">
                   {/* Playlist Name */}
                   <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2 pl-1">Name</label>
                    <input
                      type="text"
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      placeholder="e.g., 'Midnight Seoul Drive'"
                      className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-purple-400/50 focus:bg-white/10 focus:outline-none text-white placeholder-gray-500 transition-all duration-300"
                    />
                  </div>

                  {/* Prompt */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2 pl-1">
                      Description <span className="text-purple-400">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the mood, activity, or feeling..."
                        className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-purple-400/50 focus:bg-white/10 focus:outline-none text-white placeholder-gray-500 transition-all duration-300 resize-none h-32"
                      />
                      <button
                        className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
                        onClick={() => setShowPreview(!showPreview)}
                        title="Show examples"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mood Selection - Integrated */}
                <div className="space-y-2">
                   <label className="block text-gray-300 text-sm font-medium pl-1">Moods</label>
                   <div className="bg-white/5 rounded-xl p-4 border border-white/5 h-full">
                      <MoodPills 
                        selectedMoods={selectedMoods}
                        onMoodChange={setSelectedMoods}
                      />
                   </div>
                </div>
              </div>
            </div>

            {/* Advanced Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Length & Type */}
              <div className="glass-effect rounded-3xl p-6 border border-white/10 bg-black/40 backdrop-blur-xl flex flex-col justify-between space-y-6">
                
                {/* Length */}
                <div>
                   <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <Clock className="w-4 h-4 text-pink-300" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Length</h3>
                  </div>
                  <InteractiveSlider
                    value={playlistLength}
                    onChange={setPlaylistLength}
                    min={5}
                    max={30}
                    step={1}
                    label=""
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium px-1">
                    <span>5 songs</span>
                    <span>30 songs</span>
                  </div>
                </div>

                <div className="h-px bg-white/5"></div>

                {/* Type */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <Zap className="w-4 h-4 text-blue-300" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Style</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {playlistTypeOptions.map((type) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.value}
                          onClick={() => setPlaylistType(type.value)}
                          className={`p-2.5 rounded-lg border text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                            playlistType === type.value
                              ? 'bg-white/10 border-purple-400/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                              : 'bg-transparent border-white/5 text-gray-400 hover:bg-white/5 hover:text-gray-200'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${playlistType === type.value ? 'text-white' : type.color}`} />
                          <span>{type.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Members & Eras - Tabbed or Compact */}
              <div className="glass-effect rounded-3xl p-6 border border-white/10 bg-black/40 backdrop-blur-xl space-y-6">
                 
                 {/* Members */}
                 <div>
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                          <Users className="w-4 h-4 text-green-300" />
                        </div>
                        <h3 className="text-lg font-medium text-white">Members</h3>
                      </div>
                      <button 
                        onClick={() => setArtistBias(artistBias.length === artistOptions.length ? [] : artistOptions.map(a => a.name))}
                        className="text-xs font-medium text-purple-300 hover:text-purple-200 transition-colors"
                      >
                        {artistBias.length === artistOptions.length ? 'Clear' : 'Select All'}
                      </button>
                   </div>
                   
                   <div className="grid grid-cols-4 gap-2">
                      {artistOptions.map((artist) => {
                        const Icon = artist.icon
                        const isSelected = artistBias.includes(artist.name)
                        return (
                          <button
                            key={artist.name}
                            onClick={() => {
                              if (artistBias.includes(artist.name)) {
                                setArtistBias(artistBias.filter(a => a !== artist.name))
                              } else {
                                setArtistBias([...artistBias, artist.name])
                              }
                            }}
                            className={`group relative p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2 ${
                              isSelected
                                ? 'bg-white/10 border-purple-400/50 text-white'
                                : 'bg-transparent border-white/5 text-gray-500 hover:bg-white/5 hover:text-gray-300'
                            }`}
                            title={artist.name}
                          >
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : artist.color} transition-all`} />
                            <span className="text-[10px] font-medium truncate w-full text-center">{artist.name}</span>
                          </button>
                        )
                      })}
                   </div>
                 </div>

                 <div className="h-px bg-white/5"></div>

                 {/* Eras */}
                 <div>
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <Clock className="w-4 h-4 text-yellow-300" />
                      </div>
                      <h3 className="text-lg font-medium text-white">Eras</h3>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {eraOptions.map((era) => {
                        const Icon = era.icon
                        const isSelected = yearEra.includes(era.value)
                        return (
                          <button
                            key={era.value}
                            onClick={() => {
                              if (yearEra.includes(era.value)) {
                                setYearEra(yearEra.filter(e => e !== era.value))
                              } else {
                                setYearEra([...yearEra, era.value])
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-white/10 border-purple-400/50 text-white'
                                : 'bg-transparent border-white/5 text-gray-500 hover:bg-white/5 hover:text-gray-300'
                            }`}
                          >
                            <Icon className={`w-3 h-3 ${isSelected ? 'text-white' : era.color}`} />
                            <span>{era.label}</span>
                          </button>
                        )
                      })}
                   </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview & Actions (4/12 width) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            {/* Action Card */}
            <div className="glass-effect rounded-3xl p-6 border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
               <button
                onClick={generatePlaylist}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-white text-black hover:bg-gray-100 font-bold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-white/10 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center group mb-3"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform text-purple-600" />
                    Generate Playlist
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                 <button
                  onClick={generateSurprisePlaylist}
                  className="bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-4 rounded-xl border border-white/10 transition-all duration-300 hover:border-white/20 flex items-center justify-center text-sm"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Surprise Me
                </button>
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-4 rounded-xl border border-white/10 transition-all duration-300 hover:border-white/20 flex items-center justify-center text-sm"
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save
                </button>
              </div>
            </div>

            {/* Live Preview Panel */}
            <div className="glass-effect rounded-3xl p-6 border border-white/10 bg-black/40 backdrop-blur-xl">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mr-3">
                  <Heart className="w-4 h-4 text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-white">Preview</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <h4 className="font-semibold text-white mb-1 truncate">
                    {playlistName || 'Untitled Playlist'}
                  </h4>
                  <p className="text-sm text-gray-400 line-clamp-2 min-h-[2.5rem]">
                    {prompt || 'Your description will appear here...'}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                   <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-gray-500 block mb-1">Length</span>
                      <span className="text-white font-medium">{playlistLength} songs</span>
                   </div>
                   <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-gray-500 block mb-1">Vibe</span>
                      <span className="text-white font-medium capitalize">{playlistType.split('-')[0]}</span>
                   </div>
                </div>

                {/* Tags */}
                <div className="space-y-3 pt-2">
                   {selectedMoods.length > 0 && (
                     <div className="flex flex-wrap gap-1.5">
                       {selectedMoods.slice(0, 5).map((mood) => (
                         <span key={mood} className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] rounded-md font-medium">
                           {mood}
                         </span>
                       ))}
                       {selectedMoods.length > 5 && (
                          <span className="px-2 py-1 bg-white/5 text-gray-400 text-[10px] rounded-md">+ {selectedMoods.length - 5}</span>
                       )}
                     </div>
                   )}
                   
                   {artistBias.length > 0 && (
                     <div className="flex flex-wrap gap-1.5">
                       {artistBias.slice(0, 5).map((m) => (
                         <span key={m} className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-300 text-[10px] rounded-md font-medium">
                           {m}
                         </span>
                       ))}
                        {artistBias.length > 5 && (
                          <span className="px-2 py-1 bg-white/5 text-gray-400 text-[10px] rounded-md">+ {artistBias.length - 5}</span>
                       )}
                     </div>
                   )}
                </div>
              </div>
            </div>

            {/* Saved Configs (Compact) */}
            {savedConfigs.length > 0 && (
              <div className="glass-effect rounded-3xl p-6 border border-white/10 bg-black/40 backdrop-blur-xl">
                <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider text-xs">Saved Presets</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {savedConfigs.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                      <button
                        onClick={() => loadConfig(config)}
                        className="flex-1 text-left"
                      >
                         <p className="text-sm font-medium text-white truncate">{config.name}</p>
                         <p className="text-xs text-gray-500 truncate">{config.prompt}</p>
                      </button>
                      <button
                        onClick={() => deleteConfig(config.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
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

        {/* Playlist Results - Full Width Below */}
        {playlist.length > 0 && (
          <div className="mt-12 glass-effect rounded-3xl p-6 sm:p-8 border border-white/10 bg-black/40 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Music className="w-64 h-64 text-purple-500" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                <div>
                   <h3 className="text-3xl font-bold text-white mb-2">Your Playlist</h3>
                   <p className="text-gray-400">Generated tailored for you</p>
                </div>
                <div className="flex items-center gap-3 mt-4 sm:mt-0">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-white/5 hover:bg-white/10 text-white font-medium py-2 px-4 rounded-xl border border-white/10 transition-all duration-300 flex items-center text-sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    New
                  </button>
                  <button 
                    onClick={exportToSpotify}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 flex items-center text-sm"
                  >
                    <Music className="w-4 h-4 mr-2" />
                    Spotify
                  </button>
                </div>
              </div>
              
              <CompactPlaylistGrid 
                songs={playlist.map(convertToSongDoc)} 
                primaryId={null} 
              />
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