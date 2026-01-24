'use client'
/* eslint-disable @typescript-eslint/no-unused-vars, react/no-unescaped-entities */

import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Music,
  LayoutDashboard,
  Lightbulb,
  Wand2,
  Users,
  ChevronDown,
  SlidersHorizontal,
  Plus,
  Mic2,
  Radio,
  RefreshCw,
  Dices,
  ArrowLeftRight,
  Save,
  PlayCircle,
  Play,
  Share2,
  Loader2,
  Download,
  Check,
  X,
  ExternalLink,
  HelpCircle,
} from 'lucide-react'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth'
import { useAuth } from '@/contexts/AuthContext'
import SeedTracksModal from '@/components/ai-playlist/SeedTracksModal'
import SharePlaylistModal from '@/components/ai-playlist/SharePlaylistModal'
import SpotifyBYOGuideModal from '@/components/playlist/SpotifyBYOGuideModal'
import dynamic from 'next/dynamic'

// Lazy load heavy components
const TemplateGallery = dynamic(
  () => import('@/components/ai-playlist/TemplateGallery'),
  { ssr: false }
)
const PersonalityQuiz = dynamic(
  () => import('@/components/ai-playlist/PersonalityQuiz'),
  { ssr: false }
)
const CompareView = dynamic(
  () => import('@/components/ai-playlist/CompareView'),
  { ssr: false }
)

interface Track {
  _id?: string
  title?: string
  name?: string
  artist: string
  album?: string
  spotifyId?: string
  spotifyUrl?: string
  albumArt?: string
  duration?: number
  popularity?: number
  bpm?: number
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

interface AudioFeatures {
  danceability: number
  valence: number
}

interface GeneratedPlaylist {
  playlist: Track[]
  playlistId?: string
  saved?: boolean
}

interface GenreMix {
  ballad: number
  hiphop: number
  edm: number
  rnb: number
  rock: number
  dancePop: number
}

interface PlaylistConfig {
  name: string
  prompt: string
  moods: string[]
  members: string[]
  era: string
  format: string
  length: number
  audioFeatures: AudioFeatures
  genreMix: GenreMix
  flowPattern: string
  context: string
  lyricalMatch: boolean
  seedTracks: Track[]
}

const MOOD_OPTIONS = [
  { id: 'energetic', label: 'Energetic', color: 'yellow' },
  { id: 'sentimental', label: 'Sentimental', color: 'purple' },
  { id: 'dark', label: 'Dark', color: 'pink' },
  { id: 'chill', label: 'Chill', color: 'blue' },
  { id: 'retro', label: 'Retro', color: 'green' },
  { id: 'acoustic', label: 'Acoustic', color: 'orange' },
]

const QUICK_STARTS = ['Study Session', 'Gym Hype', 'Healing']

const MEMBER_OPTIONS = [
  { name: 'BTS (OT7)', value: 'BTS', image: '/profile-icons/7.png' },
  { name: 'RM', value: 'RM', image: '/profile-icons/RM.png' },
  { name: 'Jin', value: 'Jin', image: '/profile-icons/JIN.png' },
  { name: 'SUGA', value: 'SUGA', image: '/profile-icons/SUGA.png' },
  { name: 'j-hope', value: 'j-hope', image: '/profile-icons/JHOPE.png' },
  { name: 'Jimin', value: 'Jimin', image: '/profile-icons/JIMIN.png' },
  { name: 'V', value: 'V', image: '/profile-icons/V.png' },
  {
    name: 'Jung Kook',
    value: 'Jung Kook',
    image: '/profile-icons/JUNGKOOK.png',
  },
]

const ERA_OPTIONS = [
  { value: 'all', label: 'All Eras (Debut - Present)' },
  { value: '2013-2014', label: 'School Trilogy (2013-2014)' },
  { value: '2015-2016', label: 'HYYH Era (2015-2016)' },
  { value: '2017-2018', label: 'Love Yourself (2017-2018)' },
  { value: '2019-2020', label: 'Map of the Soul (2019-2020)' },
  { value: '2022-2023', label: 'Chapter 2 (Solo Era)' },
]

const FORMAT_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'remix', label: 'Remix' },
  { value: 'instrumental', label: 'Instr.' },
]

const FLOW_PATTERNS = [
  {
    value: 'slow-build',
    label: 'Slow Build → Peak',
    description: 'Gradually increase energy',
  },
  {
    value: 'consistent',
    label: 'Consistent Energy',
    description: 'Maintain steady vibe',
  },
  {
    value: 'wave',
    label: 'Wave Pattern',
    description: 'Alternate high and low',
  },
  {
    value: 'cool-down',
    label: 'Peak → Cool Down',
    description: 'Start strong, end calm',
  },
  {
    value: 'random',
    label: 'Random Mix',
    description: 'Shuffled energy levels',
  },
]

const CONTEXT_OPTIONS = [
  { value: 'auto', label: 'Auto', icon: Radio },
  { value: 'workout', label: 'Workout', icon: Sparkles },
  { value: 'study', label: 'Study', icon: Music },
  { value: 'party', label: 'Party', icon: Users },
  { value: 'sleep', label: 'Sleep', icon: Music },
  { value: 'commute', label: 'Commute', icon: Music },
]

const GENRE_COLORS = {
  ballad: '#EC4899', // pink
  hiphop: '#8B5CF6', // purple
  edm: '#3B82F6', // blue
  rnb: '#F59E0B', // amber
  rock: '#EF4444', // red
  dancePop: '#10B981', // green
}

function AIPlaylistContent() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const { isAuthenticated, status, refreshStatus } = useSpotifyAuth()

  // State
  const [isGenerating, setIsGenerating] = useState(false)
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [playlistName, setPlaylistName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [playlistLength, setPlaylistLength] = useState(20)
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['BTS'])
  const [selectedEra, setSelectedEra] = useState('all')
  const [format, setFormat] = useState('standard')
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures>({
    danceability: 50,
    valence: 50,
  })

  // New state for new features
  const [seedTracks, setSeedTracks] = useState<Track[]>([])
  const [showSeedModal, setShowSeedModal] = useState(false)
  const [genreMix, setGenreMix] = useState<GenreMix>({
    ballad: 16.67,
    hiphop: 16.67,
    edm: 16.67,
    rnb: 16.67,
    rock: 16.67,
    dancePop: 16.66,
  })
  const [flowPattern, setFlowPattern] = useState('slow-build')
  const [showFlowDropdown, setShowFlowDropdown] = useState(false)
  const [context, setContext] = useState('auto')
  const [lyricalMatch, setLyricalMatch] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [playlistHistory, setPlaylistHistory] = useState<any[]>([])
  const [showFilters, setShowFilters] = useState(true)

  // Modal states
  const [showTemplateGallery, setShowTemplateGallery] = useState(false)
  const [showPersonalityQuiz, setShowPersonalityQuiz] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [comparePlaylists, setComparePlaylists] = useState<GeneratedPlaylist[]>(
    []
  )
  const [showEvolveModal, setShowEvolveModal] = useState(false)
  const [evolveInstruction, setEvolveInstruction] = useState('')
  const [isEvolving, setIsEvolving] = useState(false)
  const [showGenreMixModal, setShowGenreMixModal] = useState(false)
  const [showBYOGuide, setShowBYOGuide] = useState(false)

  // Share modal and Spotify export state
  const [showShareModal, setShowShareModal] = useState(false)
  const [currentSpotifyUrl, setCurrentSpotifyUrl] = useState<string | null>(
    null
  )
  const [currentPlaylistDbId, setCurrentPlaylistDbId] = useState<string | null>(
    null
  )
  const [historyTab, setHistoryTab] = useState<'recent' | 'saved'>('recent')
  const [isExporting, setIsExporting] = useState(false)

  // Ref for auto-scrolling to playlist result
  const playlistResultRef = useRef<HTMLDivElement>(null)

  // Config presets
  const [savedConfigs, setSavedConfigs] = useState<PlaylistConfig[]>([])
  const [showSaveConfigModal, setShowSaveConfigModal] = useState(false)
  const [showLoadConfigDropdown, setShowLoadConfigDropdown] = useState(false)
  const [configName, setConfigName] = useState('')

  // Fetch playlist history
  useEffect(() => {
    if (user?.uid) {
      fetchPlaylistHistory()
      fetchSavedConfigs()
    }
  }, [user])

  const fetchPlaylistHistory = async () => {
    if (!user?.uid) return

    try {
      const response = await fetch(
        `/api/playlist/history?firebaseUid=${user.uid}&limit=10`
      )
      if (response.ok) {
        const data = await response.json()
        setPlaylistHistory(data.playlists || [])
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
    }
  }

  const fetchSavedConfigs = async () => {
    if (!user?.uid) return

    try {
      const response = await fetch(
        `/api/playlist/configs?firebaseUid=${user.uid}`
      )
      if (response.ok) {
        const data = await response.json()
        setSavedConfigs(data.configs || [])
      }
    } catch (error) {
      console.error('Failed to fetch configs:', error)
    }
  }

  // Load a playlist from history
  const loadPlaylistFromHistory = (historyItem: any) => {
    if (!historyItem.tracks || historyItem.tracks.length === 0) {
      showToast('error', 'This playlist has no tracks to restore')
      return
    }

    // Map tracks to the expected format
    const restoredTracks = historyItem.tracks.map((track: any) => ({
      title: track.name || track.title,
      name: track.name || track.title,
      artist: track.artist,
      album: track.album,
      spotifyId: track.spotifyId,
      albumArt: track.albumArt,
      duration: track.duration,
      popularity: track.popularity,
      bpm: track.bpm,
    }))

    // Set playlist state
    setPlaylist(restoredTracks)
    setPlaylistName(historyItem.name)
    setPrompt(historyItem.prompt || '')
    setCurrentPlaylistDbId(historyItem.id)

    // If this playlist was exported to Spotify, restore that URL too
    if (historyItem.spotifyPlaylistUrl) {
      setCurrentSpotifyUrl(historyItem.spotifyPlaylistUrl)
    } else {
      setCurrentSpotifyUrl(null)
    }

    showToast(
      'success',
      `Restored "${historyItem.name}" with ${restoredTracks.length} tracks`
    )

    // Scroll to the playlist section
    setTimeout(() => {
      playlistResultRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 100)
  }

  const toggleMood = (moodId: string) => {
    setSelectedMoods(prev =>
      prev.includes(moodId) ? prev.filter(m => m !== moodId) : [...prev, moodId]
    )
  }

  const toggleMember = (memberValue: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberValue)
        ? prev.filter(m => m !== memberValue)
        : [...prev, memberValue]
    )
  }

  const applyQuickStart = (quickStart: string) => {
    const prompts: Record<string, string> = {
      'Study Session': 'Calm and focused songs perfect for studying',
      'Gym Hype': 'High-energy workout songs to get pumped',
      Healing: 'Soothing and comforting songs for healing',
    }
    setPrompt(prompts[quickStart] || '')
    showToast('info', `Applied ${quickStart} preset`)
  }

  // AI Inspiration
  const getAIInspiration = async () => {
    showToast('info', 'Getting AI inspiration...')

    try {
      const response = await fetch('/api/playlist/ai-inspiration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moods: selectedMoods,
          members: selectedMembers.filter(m => m !== 'BTS'),
          era: selectedEra,
          context,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPrompt(data.suggestion)
        showToast('success', 'AI inspiration applied!')
      }
    } catch (error) {
      showToast('error', 'Failed to get inspiration')
    }
  }

  // Surprise Me
  const surpriseMe = () => {
    // Random moods (1-3)
    const numMoods = Math.floor(Math.random() * 3) + 1
    const shuffledMoods = [...MOOD_OPTIONS].sort(() => 0.5 - Math.random())
    setSelectedMoods(shuffledMoods.slice(0, numMoods).map(m => m.id))

    // Random members (1-3)
    const numMembers = Math.floor(Math.random() * 3) + 1
    const shuffledMembers = [...MEMBER_OPTIONS]
      .filter(m => m.value !== 'BTS')
      .sort(() => 0.5 - Math.random())
    setSelectedMembers([
      'BTS',
      ...shuffledMembers.slice(0, numMembers).map(m => m.value),
    ])

    // Random era
    const randomEra =
      ERA_OPTIONS[Math.floor(Math.random() * ERA_OPTIONS.length)]
    setSelectedEra(randomEra.value)

    // Random audio features
    setAudioFeatures({
      danceability: Math.floor(Math.random() * 100),
      valence: Math.floor(Math.random() * 100),
    })

    // Random length
    setPlaylistLength(Math.floor(Math.random() * 30) + 10)

    showToast('success', 'Surprise! Parameters randomized!')
  }

  // Save Configuration
  const saveConfiguration = async () => {
    if (!user?.uid) {
      showToast('error', 'Please sign in to save configurations')
      return
    }

    if (!configName.trim()) {
      showToast('error', 'Please enter a configuration name')
      return
    }

    const config: PlaylistConfig = {
      name: configName,
      prompt,
      moods: selectedMoods,
      members: selectedMembers,
      era: selectedEra,
      format,
      length: playlistLength,
      audioFeatures,
      genreMix,
      flowPattern,
      context,
      lyricalMatch,
      seedTracks,
    }

    try {
      const response = await fetch('/api/playlist/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user.uid,
          config,
        }),
      })

      if (response.ok) {
        showToast('success', 'Configuration saved!')
        setShowSaveConfigModal(false)
        setConfigName('')
        fetchSavedConfigs()
      }
    } catch (error) {
      showToast('error', 'Failed to save configuration')
    }
  }

  // Load Configuration
  const loadConfiguration = (config: PlaylistConfig) => {
    setPrompt(config.prompt)
    setPlaylistName(config.name)
    setSelectedMoods(config.moods)
    setSelectedMembers(config.members)
    setSelectedEra(config.era)
    setFormat(config.format)
    setPlaylistLength(config.length)
    setAudioFeatures(config.audioFeatures)
    setGenreMix(config.genreMix)
    setFlowPattern(config.flowPattern)
    setContext(config.context)
    setLyricalMatch(config.lyricalMatch)
    setSeedTracks(config.seedTracks || [])

    showToast('success', `Loaded "${config.name}" configuration`)
    setShowLoadConfigDropdown(false)
  }

  const generatePlaylist = async () => {
    if (!prompt.trim()) {
      showToast('error', 'Please describe your playlist first!')
      return
    }

    setIsGenerating(true)
    setPlaylist([])
    setCurrentSpotifyUrl(null) // Reset Spotify URL for new playlist
    setCurrentPlaylistDbId(null)
    showToast('info', 'Generating your personalized playlist...')

    try {
      const response = await fetch('/api/playlist/generate-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          playlistName:
            playlistName || `AI Playlist - ${new Date().toLocaleDateString()}`,
          moods: selectedMoods,
          artistBias: selectedMembers.filter(m => m !== 'BTS'),
          playlistLength,
          yearEra: selectedEra !== 'all' ? [selectedEra] : [],
          playlistType: 'feel-based',
          audioFeatures,
          format,
          seedTracks: seedTracks.map(t => ({
            name: t.name || t.title,
            artist: t.artist,
            spotifyId: t.spotifyId,
          })),
          genreMix,
          flowPattern,
          context,
          lyricalMatch,
          userId: user?.uid,
          firebaseUid: user?.uid,
          saveToDb: !!user?.uid,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate playlist')
      }

      const data: GeneratedPlaylist = await response.json()
      setPlaylist(data.playlist)

      // Capture the playlist database ID for later use
      if (data.playlistId) {
        setCurrentPlaylistDbId(data.playlistId)
      }

      showToast(
        'success',
        `Generated ${data.playlist.length} songs for your playlist!`
      )

      if (data.saved) {
        await fetchPlaylistHistory()
      }

      // Auto-scroll to the playlist result section after a short delay
      setTimeout(() => {
        playlistResultRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 100)
    } catch (error) {
      console.error('Error generating playlist:', error)
      showToast('error', 'Failed to generate playlist. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToSpotify = async () => {
    if (playlist.length === 0) {
      showToast('error', 'No playlist to export!')
      return
    }

    // If already exported, show the share modal instead of exporting again
    if (currentSpotifyUrl) {
      setShowShareModal(true)
      return
    }

    let accessToken = status?.accessToken

    if (!accessToken) {
      const refreshed = await refreshStatus()
      accessToken = refreshed?.accessToken
    }

    setIsExporting(true)
    showToast(
      'info',
      accessToken ? 'Exporting to Spotify...' : 'Exporting to Armyverse...'
    )

    // Helper to make export request
    const makeExportRequest = async (
      token?: string | null,
      useFallback: boolean = false
    ) => {
      return fetch('/api/playlist/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: playlistName || `AI Generated BTS Playlist - ${prompt}`,
          songs: playlist,
          fallbackToOwner: useFallback,
        }),
      })
    }

    try {
      let response: Response
      let data: any

      if (accessToken) {
        response = await makeExportRequest(accessToken, false)
        data = await response.json()

        if (!response.ok) {
          if (response.status === 401) {
            // Try to refresh the token
            const refreshed = await refreshStatus()
            if (refreshed?.accessToken) {
              response = await makeExportRequest(refreshed.accessToken, false)
              data = await response.json()

              // If still failing with 401, try fallback
              if (!response.ok && response.status === 401 && data.canFallback) {
                console.log(
                  'Token refresh succeeded but still invalid, using fallback'
                )
                response = await makeExportRequest(refreshed.accessToken, true)
                data = await response.json()
              }
            } else {
              // Refresh failed - use fallback
              console.log('Token refresh failed, using owner fallback')
              response = await makeExportRequest(accessToken, true)
              data = await response.json()
            }
          }

          // Check final response
          if (!response.ok) {
            throw new Error(data.error || 'Failed to export playlist')
          }
        }
      } else {
        response = await makeExportRequest(null, false)
        data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to export playlist')
        }
      }

      // Extract Spotify playlist ID from URL (format: https://open.spotify.com/playlist/PLAYLIST_ID)
      const spotifyPlaylistId =
        data.playlistUrl?.split('/playlist/')?.[1]?.split('?')?.[0] || null

      // Save the Spotify URL to the database if we have a playlist ID
      if (currentPlaylistDbId && user?.uid && data.playlistUrl) {
        try {
          await fetch('/api/playlist/history', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playlistId: currentPlaylistDbId,
              firebaseUid: user.uid,
              spotifyPlaylistId,
              spotifyPlaylistUrl: data.playlistUrl,
            }),
          })
          // Refresh history to show updated data
          await fetchPlaylistHistory()
        } catch (err) {
          console.error('Failed to save Spotify URL to database:', err)
        }
      }

      // Store the URL for the share modal
      setCurrentSpotifyUrl(data.playlistUrl)

      // Show appropriate message based on whether fallback was used
      if (data.usedFallback || data.mode === 'owner') {
        showToast(
          'warning',
          data.fallbackReason ||
            'Playlist created in the Armyverse Spotify account. Connect Spotify to export to your own account.'
        )
      } else {
        showToast('success', 'Playlist exported to Spotify!')
      }

      // Show the share modal instead of automatically opening Spotify
      setShowShareModal(true)
    } catch (error) {
      console.error('Error exporting to Spotify:', error)
      showToast(
        'error',
        error instanceof Error ? error.message : 'Failed to export to Spotify.'
      )
    } finally {
      setIsExporting(false)
    }
  }

  const addToCompare = () => {
    if (playlist.length === 0) return

    setComparePlaylists(prev => [
      ...prev,
      {
        playlist,
        playlistId: Date.now().toString(),
      },
    ])
    showToast('success', 'Playlist added to comparison!')
  }

  const evolvePlaylist = async () => {
    if (!evolveInstruction.trim()) {
      showToast('error', 'Please describe how to evolve the playlist')
      return
    }

    setIsEvolving(true)
    showToast('info', 'Evolving your playlist...')

    try {
      const response = await fetch('/api/playlist/evolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPlaylist: playlist,
          instruction: evolveInstruction,
          originalPrompt: prompt,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to evolve playlist')
      }

      const data = await response.json()
      setPlaylist(data.playlist)
      showToast('success', data.changes || 'Playlist evolved successfully!')
      setShowEvolveModal(false)
      setEvolveInstruction('')
    } catch (error) {
      console.error('Error evolving playlist:', error)
      showToast('error', 'Failed to evolve playlist')
    } finally {
      setIsEvolving(false)
    }
  }

  const estimatedDuration = () => {
    const avgTrackLength = 3.5 // minutes
    const totalMinutes = Math.floor(playlistLength * avgTrackLength)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return hours > 0 ? `~${hours}hr ${minutes}m` : `~${totalMinutes}m`
  }

  return (
    <div
      className="min-h-screen relative overflow-x-hidden selection:bg-purple-500 selection:text-white text-white"
      style={{ backgroundColor: '#050505' }}
    >
      <div className="noise-bg"></div>
      {/* Aurora blobs */}
      <div className="aurora-blob bg-purple-900 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] top-[-100px] left-[-100px]"></div>
      <div className="aurora-blob bg-blue-900 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bottom-[-100px] right-[-100px] animation-delay-2000"></div>
      <div className="aurora-blob bg-pink-900 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] top-[40%] left-[50%] transform -translate-x-1/2 opacity-20"></div>

      {/* Main Content */}
      <main className="relative z-10 pt-16 sm:pt-20 sm:pt-24 pb-12 sm:pb-16 pb-20 px-3 sm:px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto">
        <header className="mb-4 sm:mb-6 md:mb-8 flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-1 sm:mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-gray-400">
              AI Playlist Architect
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm md:text-base max-w-2xl">
              Craft the perfect soundscape. Mix eras, moods, and members for
              your ultimate ARMY experience.
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => setShowPersonalityQuiz(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl glass-panel text-xs sm:text-sm font-medium text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 sm:gap-2"
            >
              <Lightbulb className="text-base sm:text-lg w-4 sm:w-5 h-4 sm:h-5" />
              Take Personality Quiz
            </button>
            <button
              onClick={() => setShowBYOGuide(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl glass-panel text-xs sm:text-sm font-medium text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 sm:gap-2"
            >
              <HelpCircle className="text-base sm:text-lg w-4 sm:w-5 h-4 sm:h-5" />
              How to Connect Spotify
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 items-start">
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-6 auto-rows-min gap-2 sm:gap-4">
            {/* Core Vibe & Atmosphere */}
            <div className="bento-cell md:col-span-6 glass-panel rounded-3xl p-3 sm:p-4 md:p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="text-purple-500 w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32" />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <label className="text-[10px] sm:text-xs font-bold tracking-widest text-purple-300 uppercase">
                    Core Vibe & Atmosphere
                  </label>
                  <button
                    onClick={getAIInspiration}
                    className="text-[10px] sm:text-xs flex items-center gap-1 text-purple-400 hover:text-white transition-colors"
                  >
                    <Lightbulb className="w-3 sm:w-4 h-3 sm:h-4" /> AI
                    Inspiration
                  </button>
                </div>
                <div className="space-y-2 sm:space-y-4">
                  <input
                    className="glass-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-2xl text-base sm:text-lg font-medium placeholder-gray-500 text-white text-sm"
                    placeholder="Playlist Name (e.g., Late Night Seoul Drive)"
                    type="text"
                    value={playlistName}
                    onChange={e => setPlaylistName(e.target.value)}
                  />
                  <div className="relative">
                    <textarea
                      className="glass-input w-full px-3 sm:px-4 py-2 sm:py-3 rounded-2xl resize-none text-xs sm:text-sm placeholder-gray-500 text-white"
                      placeholder="Describe the vibe... 'Comforting songs for a rainy day with a focus on vocal line ballads...'"
                      rows={2}
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                    ></textarea>
                    <button
                      onClick={getAIInspiration}
                      className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 p-1 sm:p-1.5 bg-purple-600 rounded-xl hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/50"
                    >
                      <Wand2 className="text-xs sm:text-sm text-white w-3 sm:w-4 h-3 sm:h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <span className="text-[10px] sm:text-xs text-gray-500 py-1">
                      Quick Starts:
                    </span>
                    {QUICK_STARTS.map(qs => (
                      <button
                        key={qs}
                        onClick={() => applyQuickStart(qs)}
                        className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-xl border border-white/10 text-[10px] sm:text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-colors hover:border-purple-400"
                      >
                        {qs}
                      </button>
                    ))}
                  </div>
                  <div className="pt-1.5 sm:pt-2">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1 sm:gap-2">
                      {MOOD_OPTIONS.map(mood => {
                        const isSelected = selectedMoods.includes(mood.id)
                        const colorMap: Record<string, string> = {
                          yellow: 'bg-yellow-400',
                          purple: 'bg-purple-400',
                          pink: 'bg-pink-400',
                          blue: 'bg-blue-400',
                          green: 'bg-green-400',
                          orange: 'bg-orange-400',
                        }

                        return (
                          <button
                            key={mood.id}
                            onClick={() => toggleMood(mood.id)}
                            className={`h-8 sm:h-10 rounded-xl bg-white/5 border border-white/5 hover:bg-${mood.color}-600/20 hover:border-${mood.color}-500 text-[10px] sm:text-xs font-medium transition-all flex items-center justify-center gap-0.5 sm:gap-1 group/pill ${
                              isSelected
                                ? `bg-${mood.color}-900/40 border-${mood.color}-500/50 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]`
                                : 'text-gray-300 hover:text-white'
                            }`}
                          >
                            <span
                              className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${colorMap[mood.color]} group-hover/pill:animate-pulse`}
                            ></span>{' '}
                            {mood.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Members & Eras */}
            <div className="bento-cell md:col-span-3 glass-panel rounded-3xl p-3 sm:p-5 flex flex-col gap-2 sm:gap-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-400 uppercase">
                  Members & Eras
                </label>
                <Users className="text-gray-600 text-base sm:text-lg w-4 sm:w-5 h-4 sm:h-5" />
              </div>
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {MEMBER_OPTIONS.map(member => {
                  const isSelected = selectedMembers.includes(member.value)
                  return (
                    <button
                      key={member.value}
                      onClick={() => toggleMember(member.value)}
                      className={`flex-shrink-0 flex flex-col items-center gap-0.5 sm:gap-1 group ${!isSelected && member.value !== 'BTS' ? 'opacity-50 hover:opacity-100 transition-opacity' : ''}`}
                    >
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full p-[1.5px] sm:p-[2px] ${isSelected ? 'bg-gradient-to-tr from-purple-500 to-white' : 'bg-white/10'}`}
                      >
                        <img
                          alt={member.name}
                          className="rounded-full w-full h-full object-cover border-2 border-black"
                          src={member.image}
                        />
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] ${isSelected ? 'text-purple-400' : 'text-gray-500'} group-hover:text-purple-400`}
                      >
                        {member.name === 'BTS (OT7)' ? 'OT7' : member.name}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="relative">
                <select
                  className="era-select w-full bg-black/30 border border-white/5 rounded-lg sm:rounded-2xl px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm text-gray-300 focus:ring-0 focus:border-white/10 outline-none appearance-none cursor-pointer transition-all"
                  value={selectedEra}
                  onChange={e => setSelectedEra(e.target.value)}
                >
                  {ERA_OPTIONS.map(era => (
                    <option
                      key={era.value}
                      value={era.value}
                      className="bg-[#141419] text-gray-300"
                    >
                      {era.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 sm:right-3 top-1.5 sm:top-2.5 text-gray-500 text-base sm:text-lg pointer-events-none w-3.5 sm:w-4 h-3.5 sm:h-4" />
              </div>
            </div>

            {/* Format */}
            <div className="bento-cell md:col-span-3 glass-panel rounded-3xl p-3 sm:p-5 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <label className="text-[10px] sm:text-xs font-bold tracking-widest text-gray-400 uppercase">
                  Format
                </label>
                <span className="text-[10px] sm:text-xs text-purple-400 font-mono">
                  {estimatedDuration()}
                </span>
              </div>
              <div className="mb-2 sm:mb-4">
                <input
                  className="w-full h-1 bg-white/10 rounded-full appearance-none"
                  max="50"
                  min="10"
                  type="range"
                  value={playlistLength}
                  onChange={e => setPlaylistLength(parseInt(e.target.value))}
                />
                <div className="flex justify-between text-[9px] sm:text-[10px] text-gray-500 mt-1">
                  <span>10</span>
                  <span>Length</span>
                  <span>50</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {FORMAT_OPTIONS.map(fmt => (
                  <button
                    key={fmt.value}
                    onClick={() => setFormat(fmt.value)}
                    className={`py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-medium border transition-all ${
                      format === fmt.value
                        ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/20'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-transparent'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Mix - Updated with BTS genres */}
            <div className="bento-cell md:col-span-2 glass-panel rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none"></div>
              <label className="absolute top-4 left-4 text-xs font-bold tracking-widest text-gray-400 uppercase z-10">
                Genre Mix
              </label>
              <div
                onClick={() => setShowGenreMixModal(true)}
                className="w-24 h-24 rounded-full p-1 relative shadow-2xl shadow-purple-900/30 group cursor-pointer mt-4 hover:scale-105 transition-transform"
                style={{
                  background: `conic-gradient(
                    ${GENRE_COLORS.ballad} 0deg ${genreMix.ballad * 3.6}deg,
                    ${GENRE_COLORS.hiphop} ${genreMix.ballad * 3.6}deg ${(genreMix.ballad + genreMix.hiphop) * 3.6}deg,
                    ${GENRE_COLORS.edm} ${(genreMix.ballad + genreMix.hiphop) * 3.6}deg ${(genreMix.ballad + genreMix.hiphop + genreMix.edm) * 3.6}deg,
                    ${GENRE_COLORS.rnb} ${(genreMix.ballad + genreMix.hiphop + genreMix.edm) * 3.6}deg ${(genreMix.ballad + genreMix.hiphop + genreMix.edm + genreMix.rnb) * 3.6}deg,
                    ${GENRE_COLORS.rock} ${(genreMix.ballad + genreMix.hiphop + genreMix.edm + genreMix.rnb) * 3.6}deg ${(genreMix.ballad + genreMix.hiphop + genreMix.edm + genreMix.rnb + genreMix.rock) * 3.6}deg,
                    ${GENRE_COLORS.dancePop} ${(genreMix.ballad + genreMix.hiphop + genreMix.edm + genreMix.rnb + genreMix.rock) * 3.6}deg 360deg
                  )`,
                }}
              >
                <div className="w-full h-full bg-[#121212] rounded-full flex items-center justify-center relative z-10">
                  <SlidersHorizontal className="text-white/50 group-hover:text-white transition-colors w-6 h-6" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"></div>
              </div>
              <div className="grid grid-cols-2 gap-1 w-full mt-4 px-1 text-[9px] text-gray-400 font-mono z-10">
                <span className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: GENRE_COLORS.ballad }}
                  ></span>
                  Ballad
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: GENRE_COLORS.hiphop }}
                  ></span>
                  Hip-Hop
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: GENRE_COLORS.edm }}
                  ></span>
                  EDM
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: GENRE_COLORS.rnb }}
                  ></span>
                  R&B
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: GENRE_COLORS.rock }}
                  ></span>
                  Rock
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: GENRE_COLORS.dancePop }}
                  ></span>
                  Dance-Pop
                </span>
              </div>
            </div>

            {/* Seed Tracks */}
            <div className="bento-cell md:col-span-4 glass-panel rounded-3xl p-5 relative">
              <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                Seed Tracks
              </label>
              <div
                onClick={() => setShowSeedModal(true)}
                className="mt-3 w-full h-24 border-2 border-dashed border-white/10 rounded-2xl bg-black/20 flex items-center justify-center gap-4 transition-colors hover:border-purple-500/50 hover:bg-purple-900/10 cursor-pointer"
              >
                {seedTracks.length > 0 ? (
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {seedTracks.slice(0, 3).map((track, idx) => (
                        <img
                          key={idx}
                          className="w-10 h-10 rounded-xl border-2 border-[#121212]"
                          src={
                            track.thumbnails?.medium ||
                            track.thumbnails?.small ||
                            track.albumArt
                          }
                          alt={track.name || track.title}
                        />
                      ))}
                      {seedTracks.length > 3 && (
                        <div className="w-10 h-10 rounded-full border-2 border-[#121212] bg-gray-800 flex items-center justify-center text-xs">
                          +{seedTracks.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-300">
                        {seedTracks.length} seed
                        {seedTracks.length !== 1 ? 's' : ''} selected
                      </p>
                      <p className="text-xs text-gray-500">Click to change</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex -space-x-3">
                      <div className="w-10 h-10 rounded-xl border-2 border-[#121212] bg-gray-800 flex items-center justify-center">
                        <Plus className="text-sm w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-300">
                        Click to select songs
                      </p>
                      <p className="text-xs text-gray-500">
                        AI will match this energy
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Smart Filters */}
            <div className="bento-cell md:col-span-3 glass-panel rounded-3xl p-5">
              <div
                className="flex justify-between items-center mb-4 cursor-pointer"
                onClick={() => setShowFilters(!showFilters)}
              >
                <label className="text-xs font-bold tracking-widest text-purple-300 uppercase flex items-center gap-2">
                  <SlidersHorizontal className="text-base w-4 h-4" /> Smart
                  Filters
                </label>
                <ChevronDown
                  className={`text-gray-500 text-sm transform transition-transform w-4 h-4 ${showFilters ? 'rotate-180' : ''}`}
                />
              </div>
              {showFilters && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                      <span>Calm</span>
                      <span>Danceability</span>
                      <span>Hype</span>
                    </div>
                    <input
                      className="w-full h-1 bg-white/10 rounded-full appearance-none accent-purple-500"
                      type="range"
                      value={audioFeatures.danceability}
                      onChange={e =>
                        setAudioFeatures({
                          ...audioFeatures,
                          danceability: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                      <span>Sad</span>
                      <span>Valence</span>
                      <span>Happy</span>
                    </div>
                    <input
                      className="w-full h-1 bg-white/10 rounded-full appearance-none accent-pink-500"
                      type="range"
                      value={audioFeatures.valence}
                      onChange={e =>
                        setAudioFeatures({
                          ...audioFeatures,
                          valence: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Flow */}
            <div className="bento-cell md:col-span-3 grid grid-rows-2 gap-4">
              <div className="glass-panel rounded-3xl p-4 flex items-center justify-between relative">
                <div className="flex flex-col flex-1">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Flow
                  </label>
                  <button
                    onClick={() => setShowFlowDropdown(!showFlowDropdown)}
                    className="text-xs text-white mt-1 text-left hover:text-purple-400 transition-colors flex items-center gap-1"
                  >
                    {FLOW_PATTERNS.find(p => p.value === flowPattern)?.label}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                <div className="w-20 h-8 flex items-end justify-between gap-0.5">
                  {flowPattern === 'slow-build' && (
                    <>
                      <div className="w-1 bg-purple-500/30 h-[30%] rounded-t-sm"></div>
                      <div className="w-1 bg-purple-500/40 h-[40%] rounded-t-sm"></div>
                      <div className="w-1 bg-purple-500/50 h-[60%] rounded-t-sm"></div>
                      <div className="w-1 bg-purple-500/70 h-[80%] rounded-t-sm"></div>
                      <div className="w-1 bg-purple-500 h-[100%] rounded-t-sm"></div>
                      <div className="w-1 bg-purple-500/60 h-[50%] rounded-t-sm"></div>
                    </>
                  )}
                  {flowPattern === 'consistent' &&
                    Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-purple-500 h-[70%] rounded-t-sm"
                      ></div>
                    ))}
                  {flowPattern === 'wave' && (
                    <>
                      <div className="w-1 bg-purple-500 h-[100%] rounded-t-sm"></div>
                      <div className="w-1 bg-purple-500/40 h-[40%] rounded-t-sm"></div>
                      <div className="w-1 bg-purple-500 h-[100%] rounded-t-sm"></div>
                      <div className="w-1 bg-purple-500/40 h-[40%] rounded-t-sm"></div>
                      <div className="w-1 bg-purple-500 h-[100%] rounded-t-sm"></div>
                      <div className="w-1 bg-purple-500/40 h-[40%] rounded-t-sm"></div>
                    </>
                  )}
                  {flowPattern === 'cool-down' && (
                    <>
                      <div className="w-1 bg-purple-500 h-[100%] rounded-t-sm"></div>
                      <div className="w-1 bg-purple-500/80 h-[80%] rounded-t-sm"></div>
                      <div className="w-1 bg-purple-500/60 h-[60%] rounded-t-sm"></div>
                      <div className="w-1 bg-purple-500/50 h-[50%] rounded-t-sm"></div>
                      <div className="w-1 bg-purple-500/40 h-[40%] rounded-t-sm"></div>
                      <div className="w-1 bg-purple-500/30 h-[30%] rounded-t-sm"></div>
                    </>
                  )}
                </div>

                {showFlowDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl border border-white/10 overflow-hidden z-20 shadow-xl">
                    {FLOW_PATTERNS.map(pattern => (
                      <button
                        key={pattern.value}
                        onClick={() => {
                          setFlowPattern(pattern.value)
                          setShowFlowDropdown(false)
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex flex-col gap-1"
                      >
                        <span className="text-xs font-medium text-white">
                          {pattern.label}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {pattern.description}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setLyricalMatch(!lyricalMatch)}
                  className={`glass-panel rounded-3xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    lyricalMatch
                      ? 'bg-purple-600/20 border border-purple-500/50'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <Mic2
                    className={`text-xl w-5 h-5 ${lyricalMatch ? 'text-purple-400' : 'text-gray-400'}`}
                  />
                  <span
                    className={`text-[10px] ${lyricalMatch ? 'text-purple-300' : 'text-gray-400'}`}
                  >
                    Lyrical Match
                  </span>
                  {lyricalMatch && (
                    <Check className="w-3 h-3 text-purple-400 absolute top-2 right-2" />
                  )}
                </button>
                <div className="glass-panel rounded-3xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-white/5 relative group">
                  <Radio className="text-blue-400 text-xl w-5 h-5" />
                  <span className="text-[10px] text-gray-400">
                    Context:{' '}
                    {context === 'auto'
                      ? 'Auto'
                      : context.charAt(0).toUpperCase() + context.slice(1)}
                  </span>

                  <div className="absolute bottom-full left-0 right-0 mb-2 glass-panel rounded-xl border border-white/10 overflow-hidden z-20 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    {CONTEXT_OPTIONS.map(ctx => (
                      <button
                        key={ctx.value}
                        onClick={() => setContext(ctx.value)}
                        className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors ${
                          context === ctx.value
                            ? 'bg-purple-600/20 text-purple-300'
                            : 'text-gray-300'
                        }`}
                      >
                        <span className="text-xs font-medium">{ctx.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6 sticky top-16 sm:top-24 h-fit">
            <div className="glass-panel rounded-3xl p-3 sm:p-4 md:p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-6 sm:-mt-10 -mr-6 sm:-mr-10 w-20 sm:w-32 h-20 sm:h-32 bg-purple-500 blur-[40px sm:blur-[60px]] opacity-30"></div>
              <button
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-base sm:text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 group disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                onClick={generatePlaylist}
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin w-4 sm:w-5 h-4 sm:h-5" />{' '}
                    GENERATING...
                  </>
                ) : (
                  <>
                    <RefreshCw className="group-hover:rotate-180 transition-transform duration-500 w-4 sm:w-5 h-4 sm:h-5" />
                    GENERATE PLAYLIST
                  </>
                )}
              </button>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                <button
                  onClick={surpriseMe}
                  className="py-2 sm:py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] sm:text-xs font-medium border border-white/10 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-gray-300 hover:text-white"
                >
                  <Dices className="text-xs sm:text-sm w-3 sm:w-4 h-3 sm:h-4" />{' '}
                  Surprise Me
                </button>
                <button
                  onClick={() => setShowCompare(!showCompare)}
                  disabled={playlist.length === 0}
                  className="py-2 sm:py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] sm:text-xs font-medium border border-white/10 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-gray-300 hover:text-white disabled:opacity-50"
                >
                  <ArrowLeftRight className="text-xs sm:text-sm w-3 sm:w-4 h-3 sm:h-4" />{' '}
                  Compare
                </button>
              </div>
              <div className="flex justify-between items-center pt-1.5 sm:pt-2 border-t border-white/5">
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowLoadConfigDropdown(!showLoadConfigDropdown)
                    }
                    className="text-[10px] sm:text-xs text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <Download className="text-xs sm:text-sm w-3 sm:w-4 h-3 sm:h-4" />{' '}
                    Load Config
                  </button>

                  {showLoadConfigDropdown && savedConfigs.length > 0 && (
                    <div className="absolute bottom-full left-0 mb-2 glass-panel rounded-lg sm:rounded-2xl border border-white/10 overflow-hidden z-20 shadow-xl min-w-[160px] sm:min-w-[200px]">
                      {savedConfigs.map((config, idx) => (
                        <button
                          key={idx}
                          onClick={() => loadConfiguration(config)}
                          className="w-full px-2 sm:px-4 py-1.5 sm:py-2 text-left hover:bg-white/10 transition-colors text-[10px] sm:text-xs text-gray-300 hover:text-white"
                        >
                          {config.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowSaveConfigModal(true)}
                  className="text-[10px] sm:text-xs text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <Save className="text-xs sm:text-sm w-3 sm:w-4 h-3 sm:h-4" />{' '}
                  Save Config
                </button>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-0.5 sm:p-1 backdrop-blur-2xl border-white/10">
              <div className="rounded-2xl bg-black/40 p-3 sm:p-4 md:p-5">
                <div className="flex justify-between items-start mb-2 sm:mb-4">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                    Live Preview
                  </span>
                  <div className="flex gap-0.5 sm:gap-1">
                    <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-red-500"></span>
                    <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-yellow-500"></span>
                    <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-green-500"></span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gray-800 relative overflow-hidden group cursor-pointer">
                    <img
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBQABqtwB07IaA_TTtCVTQGwZ7kSsLfKKpqiEVp1Dud_CjbbV5iBkN89bbdOURJMiT02Nvo2YzYYc_yyJ3hOVopZYRNvpfm-KNJeW3POIgFqM37pU1AFAcovoiJvLIgAFTtmtmDTGHL3896vqLtWZUS4-WRDmZGehzRBM4jlyfuEZdfLfFu5nr02mNX4rNqV6TgElIXtkSrAq4_ZeoJWhw08j2GR8waNP6J7xeMKJONLx8lMgAdpyvbKQcPH-DRKgrDk4DodqiVTM"
                    />
                    <PlayCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 group-hover:opacity-100 transition-opacity text-base sm:text-xl w-4 sm:w-6 h-4 sm:h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="h-1.5 sm:h-2 w-2/3 bg-white/10 rounded-full mb-1.5 sm:mb-2 overflow-hidden">
                      <div className="h-full w-0 bg-purple-500 animate-[pulse_2s_infinite]"></div>
                    </div>
                    <div className="h-1.5 sm:h-2 w-1/2 bg-white/10 rounded-full"></div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {selectedMoods.slice(0, 3).map(moodId => {
                    const mood = MOOD_OPTIONS.find(m => m.id === moodId)
                    return mood ? (
                      <span
                        key={moodId}
                        className={`px-2 py-1 rounded text-[10px] bg-${mood.color}-500/20 text-${mood.color}-300 border border-${mood.color}-500/30`}
                      >
                        #{mood.label}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-5 max-h-64 overflow-y-auto">
              <div className="flex gap-4 mb-4 border-b border-white/10 pb-2">
                <button
                  onClick={() => setHistoryTab('recent')}
                  className={`text-sm font-medium transition-colors ${historyTab === 'recent' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  Recent
                </button>
                <button
                  onClick={() => setHistoryTab('saved')}
                  className={`text-sm font-medium transition-colors ${historyTab === 'saved' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  Saved to Spotify
                </button>
              </div>
              <div className="space-y-3">
                {historyTab === 'recent' ? (
                  // Recent tab - shows all playlists
                  playlistHistory.length > 0 ? (
                    playlistHistory.slice(0, 5).map(hist => (
                      <div
                        key={hist.id}
                        onClick={() => loadPlaylistFromHistory(hist)}
                        className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold ${
                              hist.spotifyPlaylistUrl
                                ? 'bg-gradient-to-br from-green-500 to-green-600'
                                : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                            }`}
                          >
                            {hist.spotifyPlaylistUrl
                              ? '✓'
                              : hist.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-200">
                              {hist.name}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {hist.trackCount} tracks
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {hist.spotifyPlaylistUrl && (
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                window.open(hist.spotifyPlaylistUrl, '_blank')
                              }}
                              className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center hover:bg-green-500 transition-all"
                              title="Open in Spotify"
                            >
                              <ExternalLink className="text-green-400 hover:text-white w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              loadPlaylistFromHistory(hist)
                            }}
                            className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-purple-500 transition-all"
                            title="Restore this playlist"
                          >
                            <RefreshCw className="text-[14px] w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-xs">
                      No playlists generated yet
                    </div>
                  )
                ) : (
                  // Saved tab - shows only exported playlists
                  (() => {
                    const savedPlaylists = playlistHistory.filter(
                      p => p.spotifyPlaylistUrl
                    )
                    return savedPlaylists.length > 0 ? (
                      savedPlaylists.map(hist => (
                        <div
                          key={hist.id}
                          onClick={() => loadPlaylistFromHistory(hist)}
                          className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                              <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png"
                                alt="Spotify"
                                className="w-4 h-4"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-200">
                                {hist.name}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {hist.trackCount} tracks • Exported
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                window.open(hist.spotifyPlaylistUrl, '_blank')
                              }}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-[10px] font-medium hover:bg-green-500 hover:text-white transition-all"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Open
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                loadPlaylistFromHistory(hist)
                              }}
                              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-purple-500 transition-all"
                              title="Restore this playlist"
                            >
                              <RefreshCw className="text-[14px] w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <Share2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">
                          No playlists exported to Spotify yet
                        </p>
                        <p className="text-[10px] mt-1">
                          Export a playlist to see it here
                        </p>
                      </div>
                    )
                  })()
                )}
              </div>
            </div>
          </div>

          {/* Result Section (Full Width below) */}
          {playlist.length > 0 && (
            <div ref={playlistResultRef} className="lg:col-span-12 mt-8">
              <div className="glass-panel rounded-3xl p-1 relative overflow-hidden group border-purple-500/30">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
                <div className="bg-black/40 rounded-2xl p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1 block">
                        {currentSpotifyUrl
                          ? 'Exported to Spotify'
                          : 'Successfully Generated'}
                      </span>
                      <h2 className="text-3xl font-bold text-white">
                        Your Playlist:{' '}
                        {playlistName || 'Late Night Seoul Drive'}
                      </h2>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={exportToSpotify}
                        disabled={isExporting}
                        className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                          currentSpotifyUrl
                            ? 'bg-[#1DB954] text-white hover:bg-[#1ed760]'
                            : 'bg-white text-black hover:scale-105'
                        } ${isExporting ? 'opacity-70 cursor-wait' : ''}`}
                      >
                        {isExporting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Exporting...
                          </>
                        ) : currentSpotifyUrl ? (
                          <>
                            <img
                              alt="Spotify"
                              className="w-5 h-5"
                              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png"
                            />
                            View on Spotify
                          </>
                        ) : (
                          <>
                            <img
                              alt="Spotify"
                              className="w-5 h-5"
                              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png"
                            />
                            Export to Spotify
                          </>
                        )}
                      </button>
                      <button
                        onClick={addToCompare}
                        className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowShareModal(true)}
                        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
                          currentSpotifyUrl
                            ? 'border-green-500/50 bg-green-500/10 hover:bg-green-500/20'
                            : 'border-white/20 hover:bg-white/10'
                        }`}
                        title={
                          currentSpotifyUrl
                            ? 'Share playlist link'
                            : 'Export first to share'
                        }
                      >
                        <Share2
                          className={`w-4 h-4 ${currentSpotifyUrl ? 'text-green-400' : ''}`}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {playlist.map((track, i) => {
                      const spotifyUrl = track.spotifyId
                        ? `https://open.spotify.com/track/${track.spotifyId}`
                        : null
                      return (
                        <div
                          key={i}
                          onClick={() =>
                            spotifyUrl && window.open(spotifyUrl, '_blank')
                          }
                          className={`flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group/track border border-transparent hover:border-purple-500/30 ${spotifyUrl ? 'cursor-pointer' : ''}`}
                        >
                          <div className="w-12 h-12 rounded-xl bg-gray-700 relative overflow-hidden">
                            <img
                              className="object-cover w-full h-full"
                              src={
                                track.albumArt ||
                                'https://lh3.googleusercontent.com/aida-public/AB6AXuA07zQuSmrleW6jiu0hrlj-oab5DKsTafMbikd4Wksqs87u5LHtkNcQArsBXSCchif79IjkGVaR5wHqZOL3zD9sOoei0MKSyWYdkdn867f9lvCl61fCmFPUyj9BatZpBrIBxcRdKn8pGYqYyAwxG64QIVZ4UnDW0l7ssvblrVkSAKVoxp9ZoDyo74tyZbXb_NPgNSYqF1nJJuhPMUNItEfWPYZ0UVkm3DW-KsgPqqfnPok-Uyy_vGDwZLvAR0NtfVzMaCR6DT8krmk'
                              }
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/track:opacity-100 transition-opacity">
                              {spotifyUrl ? (
                                <img
                                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png"
                                  alt="Open in Spotify"
                                  className="w-5 h-5"
                                />
                              ) : (
                                <Play className="text-white text-lg w-5 h-5" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-gray-200 truncate group-hover/track:text-purple-300">
                              {track.title}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                              {track.artist}
                            </p>
                          </div>
                          <div className="text-[10px] text-gray-600 font-mono">
                            {track.bpm || '118'} BPM
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-6 flex justify-center">
                    <button className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                      Show all {playlist.length} tracks{' '}
                      <ChevronDown className="text-sm w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Evolve Button - Only show when playlist exists */}
      {playlist.length > 0 && (
        <button
          onClick={() => setShowEvolveModal(true)}
          className="fixed bottom-6 right-6 z-40 bg-purple-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(138,43,226,0.6)] hover:scale-110 transition-transform flex items-center gap-2 group"
        >
          <Wand2 className="w-5 h-5" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-bold">
            Evolve
          </span>
        </button>
      )}

      {/* Modals */}
      <SeedTracksModal
        isOpen={showSeedModal}
        onClose={() => setShowSeedModal(false)}
        selectedTracks={seedTracks}
        onTracksSelected={setSeedTracks}
      />

      <SharePlaylistModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        playlistName={playlistName || 'AI Generated Playlist'}
        spotifyUrl={currentSpotifyUrl}
        trackCount={playlist.length}
      />

      <SpotifyBYOGuideModal
        isOpen={showBYOGuide}
        onClose={() => setShowBYOGuide(false)}
      />

      {showTemplateGallery && (
        <TemplateGallery
          onClose={() => setShowTemplateGallery(false)}
          onApplyTemplate={config => {
            loadConfiguration(config)
            setShowTemplateGallery(false)
          }}
        />
      )}

      {showPersonalityQuiz && (
        <PersonalityQuiz
          onClose={() => setShowPersonalityQuiz(false)}
          onComplete={config => {
            loadConfiguration(config)
            setShowPersonalityQuiz(false)
          }}
        />
      )}

      {showCompare && comparePlaylists.length > 0 && (
        <CompareView
          playlists={comparePlaylists}
          onClose={() => setShowCompare(false)}
          onSelect={playlist => {
            setPlaylist(playlist.playlist)
            setShowCompare(false)
          }}
        />
      )}

      {/* Save Config Modal */}
      {showSaveConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel rounded-3xl w-full max-w-md p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">
              Save Configuration
            </h3>
            <input
              type="text"
              placeholder="Configuration name..."
              value={configName}
              onChange={e => setConfigName(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-2xl text-white placeholder-gray-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveConfigModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveConfiguration}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold transition-all hover:shadow-lg hover:shadow-purple-900/50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evolve Modal */}
      {showEvolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel rounded-3xl w-full max-w-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Wand2 className="w-6 h-6 text-purple-400" />
                Evolve Playlist
              </h3>
              <button
                onClick={() => setShowEvolveModal(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Tell me how you'd like to refine your current playlist
            </p>
            <textarea
              placeholder="e.g., 'Make it more energetic', 'Add more variety', 'Focus on vocal line', 'Remove similar songs'"
              value={evolveInstruction}
              onChange={e => setEvolveInstruction(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-2xl text-white placeholder-gray-500 resize-none mb-4"
              rows={3}
            />
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-xs text-gray-500">Quick suggestions:</span>
              {[
                'Make it more energetic',
                'Add more variety',
                'Focus on vocals',
                'More rap heavy',
                'Remove similar songs',
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setEvolveInstruction(suggestion)}
                  className="px-3 py-1 rounded-xl border border-white/10 text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-colors hover:border-purple-400"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEvolveModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={evolvePlaylist}
                disabled={isEvolving || !evolveInstruction.trim()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold transition-all hover:shadow-lg hover:shadow-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isEvolving ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    Evolving...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Evolve Playlist
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Genre Mix Modal */}
      {showGenreMixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel rounded-3xl w-full max-w-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-6 h-6 text-purple-400" />
                Adjust Genre Mix
              </h3>
              <button
                onClick={() => setShowGenreMixModal(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Adjust the percentage of each genre in your playlist (total must
              be 100%)
            </p>

            <div className="space-y-5 mb-6">
              {Object.entries(GENRE_COLORS).map(([genre, color]) => {
                const genreKey = genre as keyof GenreMix
                const genreLabels: Record<string, string> = {
                  ballad: 'Ballad',
                  hiphop: 'Hip-Hop',
                  edm: 'EDM',
                  rnb: 'R&B',
                  rock: 'Rock',
                  dancePop: 'Dance-Pop',
                }

                return (
                  <div key={genre}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        ></span>
                        <span className="text-sm font-medium text-white">
                          {genreLabels[genre]}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-purple-400">
                        {Math.round(genreMix[genreKey])}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={genreMix[genreKey]}
                      onChange={e => {
                        const newValue = parseInt(e.target.value)
                        const currentTotal = Object.values(genreMix).reduce(
                          (sum, val) => sum + val,
                          0
                        )
                        const diff = newValue - genreMix[genreKey]

                        // Distribute the difference across other genres
                        const otherGenres = Object.keys(genreMix).filter(
                          g => g !== genreKey
                        ) as (keyof GenreMix)[]
                        const adjustmentPerGenre = -diff / otherGenres.length

                        const newMix: GenreMix = {
                          ...genreMix,
                          [genreKey]: newValue,
                        }
                        otherGenres.forEach(g => {
                          newMix[g] = Math.max(
                            0,
                            newMix[g] + adjustmentPerGenre
                          )
                        })

                        // Normalize to ensure total is 100%
                        const total = Object.values(newMix).reduce(
                          (sum, val) => sum + val,
                          0
                        )
                        Object.keys(newMix).forEach(g => {
                          newMix[g as keyof GenreMix] =
                            (newMix[g as keyof GenreMix] / total) * 100
                        })

                        setGenreMix(newMix)
                      }}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${color} 0%, ${color} ${genreMix[genreKey]}%, rgba(255,255,255,0.1) ${genreMix[genreKey]}%, rgba(255,255,255,0.1) 100%)`,
                      }}
                    />
                  </div>
                )
              })}
            </div>

            <div className="mb-6">
              <div className="flex gap-2 mb-3">
                <span className="text-xs text-gray-500">Quick presets:</span>
                <button
                  onClick={() =>
                    setGenreMix({
                      ballad: 16.67,
                      hiphop: 16.67,
                      edm: 16.67,
                      rnb: 16.67,
                      rock: 16.67,
                      dancePop: 16.66,
                    })
                  }
                  className="px-2 py-1 rounded-xl text-xs bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                >
                  Balanced
                </button>
                <button
                  onClick={() =>
                    setGenreMix({
                      ballad: 50,
                      hiphop: 10,
                      edm: 5,
                      rnb: 20,
                      rock: 5,
                      dancePop: 10,
                    })
                  }
                  className="px-2 py-1 rounded-xl text-xs bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                >
                  Ballad Focus
                </button>
                <button
                  onClick={() =>
                    setGenreMix({
                      ballad: 10,
                      hiphop: 60,
                      edm: 10,
                      rnb: 10,
                      rock: 5,
                      dancePop: 5,
                    })
                  }
                  className="px-2 py-1 rounded-xl text-xs bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                >
                  Hip-Hop Focus
                </button>
                <button
                  onClick={() =>
                    setGenreMix({
                      ballad: 10,
                      hiphop: 10,
                      edm: 50,
                      rnb: 10,
                      rock: 10,
                      dancePop: 10,
                    })
                  }
                  className="px-2 py-1 rounded-xl text-xs bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                >
                  EDM Focus
                </button>
              </div>

              {/* Visual Preview */}
              <div className="flex items-center justify-center gap-4">
                <div
                  className="w-24 h-24 rounded-full"
                  style={{
                    background: `conic-gradient(
                      ${GENRE_COLORS.ballad} 0deg ${genreMix.ballad * 3.6}deg,
                      ${GENRE_COLORS.hiphop} ${genreMix.ballad * 3.6}deg ${(genreMix.ballad + genreMix.hiphop) * 3.6}deg,
                      ${GENRE_COLORS.edm} ${(genreMix.ballad + genreMix.hiphop) * 3.6}deg ${(genreMix.ballad + genreMix.hiphop + genreMix.edm) * 3.6}deg,
                      ${GENRE_COLORS.rnb} ${(genreMix.ballad + genreMix.hiphop + genreMix.edm) * 3.6}deg ${(genreMix.ballad + genreMix.hiphop + genreMix.edm + genreMix.rnb) * 3.6}deg,
                      ${GENRE_COLORS.rock} ${(genreMix.ballad + genreMix.hiphop + genreMix.edm + genreMix.rnb) * 3.6}deg ${(genreMix.ballad + genreMix.hiphop + genreMix.edm + genreMix.rnb + genreMix.rock) * 3.6}deg,
                      ${GENRE_COLORS.dancePop} ${(genreMix.ballad + genreMix.hiphop + genreMix.edm + genreMix.rnb + genreMix.rock) * 3.6}deg 360deg
                    )`,
                  }}
                />
                <div className="text-xs text-gray-400">
                  <p>
                    Total:{' '}
                    {Math.round(
                      Object.values(genreMix).reduce((sum, val) => sum + val, 0)
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowGenreMixModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowGenreMixModal(false)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold transition-all hover:shadow-lg hover:shadow-purple-900/50"
              >
                Apply Genre Mix
              </button>
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
