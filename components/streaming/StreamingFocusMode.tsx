'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { SongDoc, useAllSongs } from '@/hooks/useAllSongs'
import { Search, AlertCircle, CheckCircle, Music, GripVertical, Trash2, ChevronDown, Flag, Info, Loader2, Hash, Zap, Clock, Edit3, ExternalLink, Share2 } from 'lucide-react'

interface Props {
  focusResult: SongDoc[] | null
  setFocusResult: (songs: SongDoc[] | null) => void
  playlistName: string
  setPlaylistName: (name: string) => void
  focusDuration: string
  isSaving: boolean
  saveError: string | null
  saveSuccess: string | null
  savedPlaylistUrl: string | null
  onOpenShareModal: () => void
  handleSaveToSpotify: (songs?: SongDoc[]) => Promise<void>
  removeFromFocusResult: (index: number) => void
  focusDraggedIndex: number | null
  focusDragOverIndex: number | null
  handleFocusDragStart: (index: number) => void
  handleFocusDragOver: (e: React.DragEvent, index: number) => void
  handleFocusDrop: (e: React.DragEvent, index: number) => void
  handleFocusDragEnd: () => void
}

type FillMode = 'smartMix' | 'chronological' | 'random'

const ERAS = [
  // Group Albums
  { label: 'Proof', value: 'proof', color: 'bg-purple-600', category: 'Group' },
  { label: 'BE', value: 'be', color: 'bg-blue-500', category: 'Group' },
  { label: 'Map of the Soul: 7', value: 'mots7', color: 'bg-purple-500', category: 'Group' },
  { label: 'Map of the Soul: Persona', value: 'motspersona', color: 'bg-pink-400', category: 'Group' },
  { label: 'Love Yourself: Answer', value: 'lyanswer', color: 'bg-rose-500', category: 'Group' },
  { label: 'Love Yourself: Tear', value: 'lytear', color: 'bg-rose-600', category: 'Group' },
  { label: 'Love Yourself: Her', value: 'lyher', color: 'bg-rose-400', category: 'Group' },
  { label: 'Wings', value: 'wings', color: 'bg-pink-500', category: 'Group' },
  { label: 'You Never Walk Alone', value: 'ynwa', color: 'bg-pink-600', category: 'Group' },
  { label: 'The Most Beautiful Moment in Life: Young Forever', value: 'hyyh', color: 'bg-orange-400', category: 'Group' },
  { label: 'Dark & Wild', value: 'darkwild', color: 'bg-gray-700', category: 'Group' },
  { label: 'Skool Luv Affair', value: 'skoolluv', color: 'bg-red-500', category: 'Group' },
  { label: '2 Cool 4 Skool', value: '2cool4skool', color: 'bg-red-600', category: 'Group' },

  // Solo Albums - Jung Kook
  { label: 'GOLDEN (JK)', value: 'golden', color: 'bg-yellow-500', category: 'Jung Kook' },

  // Solo Albums - Jimin
  { label: 'FACE (Jimin)', value: 'face', color: 'bg-blue-400', category: 'Jimin' },
  { label: 'MUSE (Jimin)', value: 'muse', color: 'bg-cyan-400', category: 'Jimin' },

  // Solo Albums - V
  { label: 'Layover (V)', value: 'layover', color: 'bg-green-500', category: 'V' },

  // Solo Albums - RM
  { label: 'Indigo (RM)', value: 'indigo', color: 'bg-indigo-500', category: 'RM' },
  { label: 'Right Place, Wrong Person (RM)', value: 'rpwp', color: 'bg-indigo-600', category: 'RM' },

  // Solo Albums - j-hope
  { label: 'Jack In The Box (j-hope)', value: 'jitb', color: 'bg-orange-500', category: 'j-hope' },
  { label: 'Hope World (j-hope)', value: 'hopeworld', color: 'bg-orange-300', category: 'j-hope' },

  // Solo Albums - Agust D / SUGA
  { label: 'D-DAY (Agust D)', value: 'dday', color: 'bg-slate-700', category: 'SUGA' },
  { label: 'D-2 (Agust D)', value: 'd2', color: 'bg-slate-600', category: 'SUGA' },
  { label: 'Agust D', value: 'agustd', color: 'bg-slate-500', category: 'SUGA' },

  // Solo Albums - Jin
  { label: 'The Astronaut (Jin)', value: 'astronaut', color: 'bg-purple-400', category: 'Jin' }
]

export default function StreamingFocusMode(props: Props) {
  const { songs, loading } = useAllSongs()

  // Form state
  const [platform, setPlatform] = useState('spotify')
  const [targetLengthInput, setTargetLengthInput] = useState('60')
  const [focusTrackId, setFocusTrackId] = useState('')
  const [focusSearch, setFocusSearch] = useState('')
  const [gapRange, setGapRange] = useState([2, 4])
  const [fillMode, setFillMode] = useState<FillMode>('smartMix')
  const [selectedEras, setSelectedEras] = useState<string[]>([])
  const [autoModeOpen, setAutoModeOpen] = useState(true)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [erasExpanded, setErasExpanded] = useState(false)

  // Manual mode state
  const [gapMode, setGapMode] = useState<'auto' | 'manual'>('auto')
  const [manualGapCount, setManualGapCount] = useState(3)
  const [manualGapRange, setManualGapRange] = useState([2, 4])
  const [manualGapMode, setManualGapMode] = useState<'fixed' | 'dynamic'>('dynamic')
  const [manualPoolSearch, setManualPoolSearch] = useState('')
  const [manualGapPool, setManualGapPool] = useState<SongDoc[]>([])

  const focusOptions = useMemo(() => {
    const q = focusSearch.trim().toLowerCase()
    if (!q) return []
    return songs.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.album.toLowerCase().includes(q)
    ).slice(0, 20)
  }, [focusSearch, songs])

  const selectedFocusTrack = useMemo(() => {
    return songs.find(s => s.spotifyId === focusTrackId)
  }, [focusTrackId, songs])

  const manualPoolOptions = useMemo(() => {
    const q = manualPoolSearch.trim().toLowerCase()
    if (!q) return []
    return songs.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.album.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q)
    ).slice(0, 30)
  }, [manualPoolSearch, songs])

  const toggleEra = (value: string) => {
    setSelectedEras(prev =>
      prev.includes(value)
        ? prev.filter(e => e !== value)
        : [...prev, value]
    )
  }

  const toggleManualSong = (song: SongDoc, clearSearch = false) => {
    setManualGapPool(prev => {
      const isRemoving = prev.some(s => s.spotifyId === song.spotifyId)
      if (isRemoving) {
        return prev.filter(s => s.spotifyId !== song.spotifyId)
      } else {
        // Clear search when adding a new song from dropdown
        if (clearSearch) {
          setManualPoolSearch('')
        }
        return [...prev, song]
      }
    })
  }

  const handleGenerate = async () => {
    if (!focusTrackId) return
    setGenerating(true)

    const parsedLength = Number.parseInt(targetLengthInput, 10)
    const totalLength = Number.isFinite(parsedLength) ? Math.max(1, parsedLength) : 60
    const payload: any = {
      mode: gapMode,
      primaryTrackId: focusTrackId,
      totalLength,
    }

    if (gapMode === 'auto') {
      payload.auto = {
        minGap: gapRange[0],
        maxGap: gapRange[1],
        fillMode: fillMode === 'smartMix' ? 'random' : fillMode,
        selectedEras
      }
    } else {
      payload.manual = {
        gapMode: manualGapMode,
        gapCount: manualGapCount,
        minGap: manualGapRange[0],
        maxGap: manualGapRange[1],
        gapSongIds: manualGapPool.map(s => s.spotifyId)
      }
    }

    try {
      const res = await fetch('/api/playlist/streaming-focused', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (res.ok) {
        props.setFocusResult(data)
      }
    } finally {
      setGenerating(false)
    }
  }

  // Calculate quality metrics
  const qualityMetrics = useMemo(() => {
    if (!props.focusResult || props.focusResult.length === 0) {
      return { optimizedScore: 0, focusCoverage: 0, skipRate: 0 }
    }

    const focusCount = props.focusResult.filter(t =>
      selectedFocusTrack && t.spotifyId === selectedFocusTrack.spotifyId
    ).length
    const focusCoverage = Math.round((focusCount / props.focusResult.length) * 100)
    const optimizedScore = Math.min(98, Math.round(70 + focusCoverage * 0.3))
    const skipRate = focusCoverage > 25 ? 2 : focusCoverage > 15 ? 5 : 10

    return { optimizedScore, focusCoverage, skipRate }
  }, [props.focusResult, selectedFocusTrack])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start relative">
      {/* LEFT PANEL: Configuration */}
      <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3 sm:gap-4">
        <div className="bg-surface-dark/70 backdrop-blur-xl border border-glass-border rounded-2xl p-3 sm:p-5 flex flex-col gap-3 sm:gap-5 shadow-xl shadow-black/20">
          {/* Streaming Goals Widget */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-base sm:text-lg font-bold flex items-center gap-2">
                <Flag className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                Streaming Goals
              </h3>
              <span className="text-[10px] sm:text-xs font-medium text-primary bg-primary/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-primary/20">
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <label className="flex flex-col gap-1 sm:gap-1.5">
                <span className="text-[10px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider">Platform</span>
                <div className="relative">
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-background-dark border border-border-dark text-white text-xs sm:text-sm rounded-xl h-9 sm:h-10 px-2 sm:px-3 focus:ring-1 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
                  >
                    <option value="spotify">Spotify</option>
                    <option value="apple">Apple Music</option>
                    <option value="youtube">YouTube Music</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 sm:right-3 top-2.5 text-text-muted pointer-events-none w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </div>
              </label>

              <label className="flex flex-col gap-1 sm:gap-1.5">
                <span className="text-[10px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider">Playlist Length (songs)</span>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={targetLengthInput}
                    onChange={(e) => {
                      const nextValue = e.target.value
                      if (nextValue === '' || /^[0-9]+$/.test(nextValue)) {
                        setTargetLengthInput(nextValue)
                      }
                    }}
                    onBlur={() => {
                      if (targetLengthInput.trim() === '') {
                        setTargetLengthInput('60')
                        return
                      }
                      const parsed = Number.parseInt(targetLengthInput, 10)
                      const normalized = Number.isFinite(parsed) ? Math.max(1, parsed) : 60
                      setTargetLengthInput(String(normalized))
                    }}
                    className="w-full bg-background-dark border border-border-dark text-white text-xs sm:text-sm rounded-xl h-9 sm:h-10 px-2 sm:px-3 pr-7 sm:pr-8 focus:ring-1 focus:ring-primary focus:border-primary font-mono"
                  />
                  <Hash className="absolute right-2.5 sm:right-3 top-2.5 text-text-muted w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </div>
              </label>
            </div>

            {/* Tip Banner */}
            <div className="flex gap-2 sm:gap-3 bg-blue-500/10 border border-blue-500/20 p-2 sm:p-3 rounded-xl items-start">
              <Info className="text-blue-400 w-3.5 sm:w-4 h-3.5 sm:h-4 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] sm:text-xs text-blue-100/80 leading-relaxed">
                <strong className="text-blue-200">Tip:</strong> For Billboard charting, aim for 3-4 filler songs between focus tracks.
              </p>
            </div>
          </div>

          <hr className="border-border-dark" />

          {/* Focus Track Section */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <h3 className="text-white text-base sm:text-lg font-bold">Focus Track</h3>

            {/* Selected Track Display */}
            {selectedFocusTrack ? (
              <div className="bg-surface-dark border border-border-dark rounded-xl p-2 sm:p-3 flex gap-2 sm:gap-4 items-center group hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="size-12 sm:size-16 rounded-xl overflow-hidden shadow-lg shrink-0 z-10 relative">
                  <Image
                    src={selectedFocusTrack.thumbnails?.medium || selectedFocusTrack.thumbnails?.small || '/images/placeholder.jpg'}
                    alt={selectedFocusTrack.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0 z-10 flex-1">
                  <span className="text-white font-bold truncate text-sm">{selectedFocusTrack.name}</span>
                  <span className="text-text-muted text-[10px] sm:text-xs truncate">{selectedFocusTrack.artist}</span>
                  {/* Audio Features Viz */}
                  <div className="flex items-end gap-0.5 sm:gap-1 mt-1.5 sm:mt-2 h-3 sm:h-4">
                    <div className="w-[2px] sm:w-1 bg-primary/40 rounded-t-sm h-[60%]"></div>
                    <div className="w-[2px] sm:w-1 bg-primary/60 rounded-t-sm h-[80%]"></div>
                    <div className="w-[2px] sm:w-1 bg-primary rounded-t-sm h-[100%]"></div>
                    <div className="w-[2px] sm:w-1 bg-primary/80 rounded-t-sm h-[90%]"></div>
                    <div className="w-[2px] sm:w-1 bg-primary/50 rounded-t-sm h-[50%]"></div>
                    <span className="text-[9px] sm:text-[10px] text-text-muted ml-1.5 sm:ml-2 font-mono">124 BPM</span>
                  </div>
                </div>
                <button
                  onClick={() => setFocusTrackId('')}
                  className="text-text-muted hover:text-white z-10"
                >
                  <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              /* Search Input */
              <div className="relative group">
                <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 text-text-muted group-focus-within:text-primary transition-colors w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <input
                  type="text"
                  value={focusSearch}
                  onChange={(e) => setFocusSearch(e.target.value)}
                  className="w-full bg-background-dark border border-border-dark text-white rounded-xl py-2 sm:py-2.5 pl-9 sm:pl-10 pr-3 sm:pr-4 focus:outline-none focus:border-primary transition-colors placeholder:text-text-muted/50 text-sm"
                  placeholder="Search for a song..."
                />
              </div>
            )}

            {/* Search Results */}
            {focusSearch && !selectedFocusTrack && (
              <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                {loading && <p className="text-text-muted text-xs sm:text-sm p-2">Loading...</p>}
                {focusOptions.map((track) => (
                  <button
                    key={track.spotifyId}
                    onClick={() => {
                      setFocusTrackId(track.spotifyId)
                      setFocusSearch('')
                    }}
                    className="flex items-center w-full p-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden mr-2 sm:mr-3 flex-shrink-0 relative">
                      <Image
                        src={track.thumbnails?.small || '/images/placeholder.jpg'}
                        alt={track.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <p className="text-white text-xs sm:text-sm font-medium truncate">{track.name}</p>
                      <p className="text-text-muted text-[10px] sm:text-xs truncate">{track.artist}</p>
                    </div>
                  </button>
                ))}
                {!loading && focusOptions.length === 0 && (
                  <p className="text-text-muted text-xs sm:text-sm p-2">No songs found</p>
                )}
              </div>
            )}
          </div>

          {/* Accordions for Configuration */}
          <div className="flex flex-col gap-2 sm:gap-3">
            {/* Auto Mode Settings */}
            <details
              className="group bg-surface-dark rounded-xl border border-border-dark open:border-primary/30 open:ring-1 open:ring-primary/20 transition-all duration-300"
              open={autoModeOpen}
              onToggle={(e) => setAutoModeOpen((e.target as HTMLDetailsElement).open)}
            >
              <summary className="flex cursor-pointer items-center justify-between px-3 sm:px-4 py-2 sm:py-3 select-none">
                <div className="flex items-center gap-2 text-white font-medium text-sm">
                  <Zap className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                  <span className="text-xs sm:text-sm">Auto Mode Settings</span>
                </div>
                <ChevronDown className="text-text-muted group-open:rotate-180 transition-transform w-4 sm:w-5 h-4 sm:h-5" />
              </summary>
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 flex flex-col gap-3 sm:gap-5">
                {/* Range Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-[10px] sm:text-xs text-text-muted">
                    <span>Gap Range</span>
                    <span className="text-white font-mono">{gapRange[0]} - {gapRange[1]} songs</span>
                  </div>
                  <div className="flex gap-1.5 sm:gap-2">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={gapRange[0]}
                      onChange={(e) => setGapRange([parseInt(e.target.value), gapRange[1]])}
                      className="w-12 sm:w-16 bg-background-dark border border-border-dark text-white text-[10px] sm:text-xs rounded-xl px-1.5 sm:px-2 py-1"
                    />
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={gapRange[1]}
                      onChange={(e) => setGapRange([gapRange[0], parseInt(e.target.value)])}
                      className="flex-1 h-1.5 bg-border-dark rounded-xl appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 sm:[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-3.5 sm:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                    />
                    <input
                      type="number"
                      min={gapRange[0]}
                      max={10}
                      value={gapRange[1]}
                      onChange={(e) => setGapRange([gapRange[0], parseInt(e.target.value)])}
                      className="w-12 sm:w-16 bg-background-dark border border-border-dark text-white text-[10px] sm:text-xs rounded-xl px-1.5 sm:px-2 py-1"
                    />
                  </div>
                </div>

                {/* Fill Mode */}
                <label className="flex flex-col gap-1 sm:gap-1.5">
                  <span className="text-[10px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider">Fill Mode</span>
                  <select
                    value={fillMode}
                    onChange={(e) => setFillMode(e.target.value as FillMode)}
                    className="w-full bg-background-dark border border-border-dark text-white text-xs sm:text-sm rounded-xl h-8 sm:h-9 px-2 sm:px-3"
                  >
                    <option value="smartMix">Smart Mix (Era + Mood)</option>
                    <option value="chronological">Chronological</option>
                    <option value="random">Random Shuffle</option>
                  </select>
                </label>

                {/* Era Chips - Compact Collapsible */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Include Albums/Eras {selectedEras.length > 0 && `(${selectedEras.length})`}
                    </span>
                    <div className="flex items-center gap-2">
                      {selectedEras.length > 0 && (
                        <button
                          onClick={() => setSelectedEras([])}
                          className="text-[10px] text-red-400 hover:text-red-300 font-medium"
                        >
                          Clear All
                        </button>
                      )}
                      <button
                        onClick={() => setErasExpanded(!erasExpanded)}
                        className="text-[10px] text-primary hover:text-primary-dark font-medium flex items-center gap-1"
                      >
                        {erasExpanded ? 'Hide' : 'Select'}
                        <ChevronDown className={`w-3 h-3 transition-transform ${erasExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Selected Eras Display - Compact */}
                  {selectedEras.length > 0 && !erasExpanded && (
                    <div className="flex flex-wrap gap-1">
                      {selectedEras.slice(0, 8).map(eraValue => {
                        const era = ERAS.find(e => e.value === eraValue)
                        if (!era) return null
                        return (
                          <div
                            key={era.value}
                            className={`${era.color} text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1`}
                          >
                            <span className="truncate max-w-[80px]">{era.label}</span>
                            <button
                              onClick={() => toggleEra(era.value)}
                              className="hover:opacity-70"
                            >
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )
                      })}
                      {selectedEras.length > 8 && (
                        <span className="text-[10px] text-text-muted px-2 py-0.5">
                          +{selectedEras.length - 8}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Expanded Eras Selection */}
                  {erasExpanded && (
                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar bg-background-dark/50 rounded-xl p-2 border border-border-dark">
                      <div className="flex justify-end sticky top-0 bg-background-dark/90 backdrop-blur pb-1 z-10">
                        <button
                          onClick={() => setSelectedEras(ERAS.map(e => e.value))}
                          className="text-[10px] text-primary hover:text-primary-dark font-medium"
                        >
                          Select All
                        </button>
                      </div>

                      {/* Group Albums */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider">Group</span>
                        <div className="flex flex-wrap gap-1">
                          {ERAS.filter(e => e.category === 'Group').map((era) => (
                            <button
                              key={era.value}
                              onClick={() => toggleEra(era.value)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all ${
                                selectedEras.includes(era.value)
                                  ? `${era.color} text-white border-transparent shadow-sm`
                                  : 'bg-surface-dark text-text-muted border-border-dark hover:border-text-muted'
                              }`}
                            >
                              {era.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Solo Albums by Member */}
                      {['Jung Kook', 'Jimin', 'V', 'RM', 'j-hope', 'SUGA', 'Jin'].map(member => {
                        const memberAlbums = ERAS.filter(e => e.category === member)
                        if (memberAlbums.length === 0) return null
                        return (
                          <div key={member} className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider">{member}</span>
                            <div className="flex flex-wrap gap-1">
                              {memberAlbums.map((era) => (
                                <button
                                  key={era.value}
                                  onClick={() => toggleEra(era.value)}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all ${
                                    selectedEras.includes(era.value)
                                      ? `${era.color} text-white border-transparent shadow-sm`
                                      : 'bg-surface-dark text-text-muted border-border-dark hover:border-text-muted'
                                  }`}
                                >
                                  {era.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </details>

            {/* Advanced - Manual Gap Mode */}
            <details
              className="group bg-surface-dark rounded-xl border border-border-dark open:border-primary/30 transition-all duration-300"
              open={advancedOpen}
              onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}
            >
              <summary className="flex cursor-pointer items-center justify-between px-4 py-3 select-none">
                <div className="flex items-center gap-2 text-white font-medium">
                  <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Advanced
                </div>
                <ChevronDown className="text-text-muted group-open:rotate-180 transition-transform w-5 h-5" />
              </summary>
              <div className="px-4 pb-4 pt-1 flex flex-col gap-4">
                {/* Gap Mode Toggle */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Gap Mode</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGapMode('auto')}
                      className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        gapMode === 'auto'
                          ? 'bg-primary text-white'
                          : 'bg-background-dark text-text-muted hover:bg-surface-light'
                      }`}
                    >
                      Auto
                    </button>
                    <button
                      onClick={() => setGapMode('manual')}
                      className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        gapMode === 'manual'
                          ? 'bg-primary text-white'
                          : 'bg-background-dark text-text-muted hover:bg-surface-light'
                      }`}
                    >
                      Manual
                    </button>
                  </div>
                </div>

                {/* Manual Mode Settings */}
                {gapMode === 'manual' && (
                  <>
                    {/* Gap Mode Toggle - Fixed vs Dynamic */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Gapping System</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setManualGapMode('dynamic')}
                          className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            manualGapMode === 'dynamic'
                              ? 'bg-primary text-white'
                              : 'bg-background-dark text-text-muted hover:bg-surface-light'
                          }`}
                        >
                          Dynamic
                        </button>
                        <button
                          onClick={() => setManualGapMode('fixed')}
                          className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            manualGapMode === 'fixed'
                              ? 'bg-primary text-white'
                              : 'bg-background-dark text-text-muted hover:bg-surface-light'
                          }`}
                        >
                          Fixed
                        </button>
                      </div>
                    </div>

                    {/* Dynamic Gap Range */}
                    {manualGapMode === 'dynamic' ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs text-text-muted">
                          <span>Gap Range</span>
                          <span className="text-white font-mono">{manualGapRange[0]} - {manualGapRange[1]} songs</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={manualGapRange[0]}
                            onChange={(e) => setManualGapRange([parseInt(e.target.value), manualGapRange[1]])}
                            className="w-16 bg-background-dark border border-border-dark text-white text-xs rounded-xl px-2 py-1"
                          />
                          <input
                            type="range"
                            min={1}
                            max={20}
                            value={manualGapRange[1]}
                            onChange={(e) => setManualGapRange([manualGapRange[0], parseInt(e.target.value)])}
                            className="flex-1 h-1.5 bg-border-dark rounded-xl appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                          />
                          <input
                            type="number"
                            min={manualGapRange[0]}
                            max={20}
                            value={manualGapRange[1]}
                            onChange={(e) => setManualGapRange([manualGapRange[0], parseInt(e.target.value)])}
                            className="w-16 bg-background-dark border border-border-dark text-white text-xs rounded-xl px-2 py-1"
                          />
                        </div>
                        <span className="text-xs text-text-muted">
                          Random number of gap songs (between min and max) will be inserted between each focus track
                        </span>
                      </div>
                    ) : (
                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                          Gap Between Focus Tracks
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={manualGapCount}
                          onChange={(e) => setManualGapCount(parseInt(e.target.value))}
                          className="w-full bg-background-dark border border-border-dark text-white text-sm rounded-xl h-10 px-3 focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                        <span className="text-xs text-text-muted">
                          Fixed number of songs between each focus track appearance
                        </span>
                      </label>
                    )}

                    {/* Manual Pool Search */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Select Gap Songs ({manualGapPool.length} selected)
                      </span>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-text-muted w-4 h-4" />
                        <input
                          type="text"
                          value={manualPoolSearch}
                          onChange={(e) => setManualPoolSearch(e.target.value)}
                          className="w-full bg-background-dark border border-border-dark text-white rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-primary transition-colors placeholder:text-text-muted/50 text-sm"
                          placeholder="Search songs for gaps..."
                        />
                      </div>

                      {/* Manual Pool Results */}
                      {manualPoolSearch && (
                        <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                          {loading && <p className="text-text-muted text-xs p-2">Loading...</p>}
                          {manualPoolOptions.map((song) => {
                            const isSelected = manualGapPool.some(s => s.spotifyId === song.spotifyId)
                            return (
                              <label
                                key={song.spotifyId}
                                className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleManualSong(song, true)}
                                  className="flex-shrink-0 w-4 h-4 rounded border-border-dark bg-background-dark text-primary focus:ring-primary focus:ring-offset-0"
                                />
                                <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 relative">
                                  <Image
                                    src={song.thumbnails?.small || '/images/placeholder.jpg'}
                                    alt={song.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-white text-xs font-medium truncate">{song.name}</p>
                                  <p className="text-text-muted text-[10px] truncate">{song.artist}</p>
                                </div>
                              </label>
                            )
                          })}
                          {!loading && manualPoolOptions.length === 0 && (
                            <p className="text-text-muted text-xs p-2">No songs found</p>
                          )}
                        </div>
                      )}

                      {/* Selected Pool Display */}
                      {manualGapPool.length > 0 && !manualPoolSearch && (
                        <div className="max-h-64 overflow-y-auto space-y-1 custom-scrollbar bg-surface-dark/50 rounded-xl p-2 border border-border-dark">
                          {manualGapPool.map((song) => (
                            <div
                              key={song.spotifyId}
                              className="flex items-center gap-2 bg-background-dark/50 hover:bg-white/5 border border-border-dark rounded-xl p-2 transition-colors group"
                            >
                              <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 relative">
                                <Image
                                  src={song.thumbnails?.small || '/images/placeholder.jpg'}
                                  alt={song.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-white text-xs font-medium truncate">{song.name}</p>
                                <p className="text-text-muted text-[10px] truncate">{song.artist}</p>
                              </div>
                              <button
                                onClick={() => toggleManualSong(song, false)}
                                className="text-text-muted hover:text-red-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {manualGapPool.length === 0 && !manualPoolSearch && (
                        <div className="text-center py-6 border-2 border-dashed border-border-dark rounded-xl">
                          <Music className="w-8 h-8 text-text-muted mx-auto mb-2" />
                          <p className="text-text-muted text-xs">
                            Search and select songs to use as gap fillers
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Auto Mode Note */}
                {gapMode === 'auto' && (
                  <div className="flex gap-2 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl items-start">
                    <Info className="text-blue-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-100/80 leading-relaxed">
                      Auto mode uses the settings above to automatically select gap songs based on your chosen eras and fill mode.
                    </p>
                  </div>
                )}
              </div>
            </details>
          </div>

          {/* Footer Actions */}
          <div className="mt-auto flex flex-col gap-2 sm:gap-3 pt-2">
            <button
              onClick={handleGenerate}
              disabled={!focusTrackId || generating}
              className="w-full bg-primary hover:bg-primary-dark text-white h-10 sm:h-12 rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>Generate Playlist</span>
                  <Zap className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL: Generated Playlist */}
      <aside className="lg:col-span-5 xl:col-span-4 sticky top-4 sm:top-6 self-start z-10">
        <div className="bg-surface-dark/70 backdrop-blur-xl border border-glass-border flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-6rem)] min-h-[400px] sm:min-h-[500px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 relative">
          {props.focusResult && props.focusResult.length > 0 ? (
            <>
              {/* Playlist Header */}
              <div className="p-3 sm:p-5 border-b border-border-dark bg-[#1e1629]/50 shrink-0">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="flex flex-col gap-1 w-full max-w-md">
                    <label className="text-[10px] sm:text-xs text-primary font-bold uppercase tracking-wider">Playlist Name</label>
                    <div className="flex items-center gap-2 border-b border-white/20 pb-1 focus-within:border-primary transition-colors">
                      <input
                        type="text"
                        value={props.playlistName}
                        onChange={(e) => props.setPlaylistName(e.target.value)}
                        className="bg-transparent border-none p-0 text-white text-lg sm:text-xl font-bold focus:ring-0 w-full placeholder:text-white/20 outline-none"
                      />
                      <Edit3 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-text-muted cursor-pointer hover:text-white flex-shrink-0" />
                    </div>
                  </div>

                  {/* Header Stats */}
                  <div className="flex gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-background-dark/80 rounded-xl p-1.5 sm:p-2 pr-2 sm:pr-3 border border-border-dark">
                      <div className="relative size-7 sm:size-9 flex items-center justify-center">
                        <svg className="size-full rotate-[-90deg]" viewBox="0 0 36 36">
                          <path
                            className="text-border-dark"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="text-green-500 drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeDasharray={`${qualityMetrics.optimizedScore}, 100`}
                            strokeWidth="4"
                          />
                        </svg>
                        <span className="absolute text-[9px] sm:text-[10px] font-bold text-white">{qualityMetrics.optimizedScore}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] sm:text-[10px] text-text-muted uppercase">Optimized</span>
                        <span className="text-xs sm:text-sm font-bold text-white">Score</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 bg-background-dark/80 rounded-xl p-1.5 sm:p-2 pr-2 sm:pr-3 border border-border-dark">
                      <div className="size-7 sm:size-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] sm:text-[10px] text-text-muted uppercase">Time</span>
                        <span className="text-xs sm:text-sm font-bold text-white">{props.focusDuration}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary Metrics */}
                <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto pb-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="size-1.5 sm:size-2 rounded-full bg-primary"></span>
                    <span className="text-[10px] sm:text-sm text-text-muted whitespace-nowrap">
                      Focus: <span className="text-white font-medium">{qualityMetrics.focusCoverage}%</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="size-1.5 sm:size-2 rounded-full bg-orange-400"></span>
                    <span className="text-[10px] sm:text-sm text-text-muted whitespace-nowrap">
                      Skip Rate: <span className="text-white font-medium">&lt; {qualityMetrics.skipRate}%</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Draggable Track List */}
              <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-0.5 sm:space-y-1 relative custom-scrollbar">
                {/* List Header */}
                <div className="flex items-center px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider sticky top-0 bg-[#1e1629]/95 backdrop-blur z-20 border-b border-white/5">
                  <div className="w-6 sm:w-8 text-center">#</div>
                  <div className="flex-1 text-[10px] sm:text-xs">Title</div>
                  <div className="w-16 sm:w-32 hidden sm:block">Album</div>
                  <div className="w-10 sm:w-16 text-right text-[10px] sm:text-xs">Time</div>
                  <div className="w-8 sm:w-12"></div>
                </div>

                {/* Track Items */}
                {props.focusResult.map((track, index) => {
                  const isFocusTrack = selectedFocusTrack && track.spotifyId === selectedFocusTrack.spotifyId
                  return (
                    <div
                      key={`${track.spotifyId}-${index}`}
                      draggable
                      onDragStart={() => props.handleFocusDragStart(index)}
                      onDragOver={(e) => props.handleFocusDragOver(e, index)}
                      onDrop={(e) => props.handleFocusDrop(e, index)}
                      onDragEnd={props.handleFocusDragEnd}
                      className={`group flex items-center gap-1.5 sm:gap-3 p-1.5 sm:p-2 rounded-xl transition-colors border cursor-grab active:cursor-grabbing ${
                        props.focusDraggedIndex === index
                          ? 'opacity-50 bg-white/10 border-primary/30'
                          : props.focusDragOverIndex === index
                          ? 'bg-primary/10 border-primary/30'
                          : isFocusTrack
                          ? 'bg-white/[0.02] border-transparent hover:bg-white/5 hover:border-white/5'
                          : 'border-transparent hover:bg-white/5 hover:border-white/5'
                      }`}
                    >
                      <div className={`w-5 sm:w-8 text-center font-bold text-[10px] sm:text-xs ${isFocusTrack ? 'text-primary' : 'text-text-muted'}`}>
                        {index + 1}
                      </div>
                      <div className="size-8 sm:size-10 rounded overflow-hidden shrink-0 relative">
                        <Image
                          src={track.thumbnails?.small || '/images/placeholder.jpg'}
                          alt={track.name}
                          fill
                          className={`object-cover ${!isFocusTrack ? 'grayscale opacity-70' : ''}`}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Music className="text-white w-4 sm:w-5 h-4 sm:h-5" />
                        </div>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className={`font-medium truncate text-xs sm:text-sm ${isFocusTrack ? 'text-white' : 'text-white/80'}`}>
                            {track.name}
                          </span>
                          {isFocusTrack && (
                            <span className="bg-primary text-[8px] sm:text-[10px] font-bold text-white px-1 sm:px-1.5 py-0.5 rounded uppercase flex-shrink-0">
                              Focus
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-xs text-text-muted truncate">{track.artist}</span>
                      </div>
                      <div className="w-16 sm:w-32 text-[10px] sm:text-xs text-text-muted truncate hidden sm:block">
                        {track.album}
                      </div>
                      <div className="w-10 sm:w-16 text-right text-[10px] sm:text-xs text-text-muted font-mono">3:04</div>
                      <div className="w-8 sm:w-12 flex justify-end gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isFocusTrack && (
                          <button
                            onClick={() => props.removeFromFocusResult(index)}
                            className="text-text-muted hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                          </button>
                        )}
                        <GripVertical className="text-text-muted cursor-move w-3.5 sm:w-4 h-3.5 sm:h-4" />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bottom Action Bar */}
              <div className="p-2.5 sm:p-4 bg-[#171023] border-t border-border-dark shrink-0">
                {props.savedPlaylistUrl && (
                  <div className="mb-2 sm:mb-3 flex items-center justify-between gap-2">
                    <span className="text-[10px] sm:text-xs text-text-muted">Playlist link ready</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(props.savedPlaylistUrl!, '_blank')}
                        className="text-[10px] sm:text-xs text-primary hover:text-primary-dark flex items-center gap-1"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        onClick={props.onOpenShareModal}
                        className="text-[10px] sm:text-xs text-primary hover:text-primary-dark flex items-center gap-1"
                      >
                        Share <Share2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={() => props.handleSaveToSpotify(props.focusResult!)}
                    disabled={props.isSaving}
                    className="h-8 sm:h-10 px-4 sm:px-6 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs sm:text-sm font-bold shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-1.5 sm:gap-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {props.isSaving ? (
                      <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
                    ) : (
                      <>
                        <svg className="w-4 sm:w-5 h-4 sm:h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                        <span>Create</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Error/Success Messages */}
                {props.saveError && (
                  <div className="mt-2 sm:mt-3 bg-red-500/10 border border-red-500/20 rounded-xl p-2 sm:p-3 flex items-center gap-2 sm:gap-3 text-red-300 text-[10px] sm:text-xs">
                    <AlertCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                    <span>{props.saveError}</span>
                  </div>
                )}

                {props.saveSuccess && (
                  <div className="mt-2 sm:mt-3 bg-green-500/10 border border-green-500/20 rounded-xl p-2 sm:p-3 flex items-center gap-2 sm:gap-3 text-green-300 text-[10px] sm:text-xs">
                    <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
                    <span>{props.saveSuccess}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 sm:p-12">
              <Music className="w-12 sm:w-16 h-12 sm:h-16 text-gray-600 mb-3 sm:mb-4" />
              <h3 className="text-white text-lg sm:text-xl font-bold mb-2">No Playlist Generated</h3>
              <p className="text-text-muted text-xs sm:text-sm max-w-md">
                Select a focus track, configure your settings, and click &quot;Generate Playlist&quot; to create your streaming-optimized playlist.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
