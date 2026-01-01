'use client'

import React, { useState, useMemo } from 'react'
import { useAllSongs, SongDoc } from '@/hooks/useAllSongs'
import { Loader2 } from 'lucide-react'

interface Props {
  onGenerated: (songs: SongDoc[]) => void
}

type GapMode = 'auto' | 'manual'

type FillMode = 'random' | 'album' | 'era'

const ERAS = [
  { label: '2013-2014 (School/Skool Luv)', value: '2013-2014' },
  { label: '2015-2016 (HYYH)', value: '2015-2016' },
  { label: '2017-2018 (Love Yourself)', value: '2017-2018' },
  { label: '2019-2020 (Map Of The Soul / BE)', value: '2019-2020' },
  { label: '2021-Present (Solo Era)', value: '2021-2025' }
]

export default function StreamingFocusForm({ onGenerated }: Props) {
  const { songs, loading, error } = useAllSongs()

  /* shared */
  const [primaryId, setPrimaryId] = useState('')
  const [search, setSearch] = useState('')
  const [totalLength, setTotalLength] = useState(20)
  const [generating, setGenerating] = useState(false)

  /* gap strategy */
  const [gapMode, setGapMode] = useState<GapMode>('auto')

  /* auto */
  const [minGap, setMinGap] = useState(2)
  const [maxGap, setMaxGap] = useState(3)
  const [fillMode, setFillMode] = useState<FillMode>('random')
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([])
  const [selectedEra, setSelectedEra] = useState<string>('2013-2014')
  const [albumSearch, setAlbumSearch] = useState('')

  /* manual */
  const [gapCount, setGapCount] = useState(6)
  const [manualSearch, setManualSearch] = useState('')
  const [manualPool, setManualPool] = useState<SongDoc[]>([])



  const primaryOptions = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return []
    return songs.filter(s => s.name.toLowerCase().includes(q) || s.album.toLowerCase().includes(q))
  }, [search, songs])

  const selectedPrimaryTrack = useMemo(() => {
    return songs.find(s => s.spotifyId === primaryId)
  }, [primaryId, songs])

  const albumList = useMemo(() => {
    const map = new Map<string, { name: string; thumb: string }>()
    songs.forEach(s => {
      if (!map.has(s.album)) map.set(s.album, { name: s.album, thumb: s.thumbnails?.small || s.thumbnails?.medium || s.thumbnails?.large || '' })
    })
    return Array.from(map.values())
  }, [songs])

  const manualFiltered = useMemo(() => {
    const q = manualSearch.toLowerCase()
    return songs.filter(s => (s.name + s.album + s.artist).toLowerCase().includes(q))
  }, [manualSearch, songs])

  const toggleAlbum = (albumName: string) => {
    setSelectedAlbums(prev => prev.includes(albumName) ? prev.filter(a => a !== albumName) : [...prev, albumName])
  }

  const toggleManualSong = (song: SongDoc) => {
    setManualPool(prev => prev.some(s => s.spotifyId === song.spotifyId) ? prev.filter(s => s.spotifyId !== song.spotifyId) : [...prev, song])
  }

  /* submission */
  const handleGenerate = async () => {
    if (!primaryId) return
    setGenerating(true)

    const payload: any = {
      mode: gapMode,
      primaryTrackId: primaryId,
      totalLength,
    }
    if (gapMode === 'auto') {
      payload.auto = {
        minGap,
        maxGap,
        fillMode,
        albums: fillMode === 'album' ? selectedAlbums : undefined,
        era: fillMode === 'era' ? selectedEra : undefined
      }
    } else {
      payload.manual = {
        gapCount,
        gapSongIds: manualPool.map(s => s.spotifyId)
      }
    }

    try {
      const res = await fetch('/api/playlist/streaming-focused', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (res.ok) onGenerated(data)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="text-white">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Streaming-Focused Playlist</h2>

      {/* primary track */}
      <div className="mb-6 sm:mb-8">
        <label className="block text-xs sm:text-sm mb-2 text-gray-300">Primary Track</label>

        {/* Show selected track if exists */}
        {selectedPrimaryTrack ? (
          <div className="mb-3 p-3 sm:p-4 bg-green-500/10 border border-green-500/30 rounded-lg sm:rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img
                src={selectedPrimaryTrack.thumbnails?.small || selectedPrimaryTrack.thumbnails?.medium || selectedPrimaryTrack.thumbnails?.large}
                alt={selectedPrimaryTrack.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-white font-medium text-sm sm:text-base truncate">{selectedPrimaryTrack.name}</p>
                <p className="text-gray-400 text-xs sm:text-sm truncate">{selectedPrimaryTrack.artist} • {selectedPrimaryTrack.album}</p>
              </div>
            </div>
            <button
              onClick={() => setPrimaryId('')}
              className="text-gray-400 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
              Change
            </button>
          </div>
        ) : null}

        <input aria-label="Primary search" title="Primary search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search BTS songs…" className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg sm:rounded-xl mb-2 text-sm" />
        <div className="max-h-40 sm:max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
          {loading && <p className="text-gray-400 text-sm">Loading…</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {primaryOptions.slice(0, 20).map(t => (
            <button key={t.spotifyId} onClick={() => { setPrimaryId(t.spotifyId); setSearch(''); }} className={`flex items-center w-full p-2 rounded-lg hover:bg-white/10 ${primaryId === t.spotifyId ? 'bg-purple-600/30' : ''}`}>
              <img src={t.thumbnails?.small || t.thumbnails?.medium || t.thumbnails?.large} alt={t.name} className="w-7 h-7 sm:w-8 sm:h-8 mr-2 sm:mr-3 rounded flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">{t.name} – {t.artist}</span>
            </button>
          ))}
        </div>
      </div>

      {/* gap mode toggle */}
      <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-4 items-center">
        <span className="text-xs sm:text-sm text-gray-300">Gap mode:</span>
        <button onClick={() => setGapMode('auto')} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm ${gapMode === 'auto' ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Auto</button>
        <button onClick={() => setGapMode('manual')} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm ${gapMode === 'manual' ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}>Manual</button>
      </div>

      {gapMode === 'auto' ? (
        <>
          {/* gap range & total length */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <label className="block text-xs sm:text-sm mb-1 sm:mb-2 text-gray-300">Min gap</label>
              <input aria-label="Min gap" title="Min gap" type="number" min={1} value={minGap} onChange={e => setMinGap(Number(e.target.value))} className="w-full p-2 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm mb-1 sm:mb-2 text-gray-300">Max gap</label>
              <input aria-label="Max gap" title="Max gap" type="number" min={minGap} value={maxGap} onChange={e => setMaxGap(Number(e.target.value))} className="w-full p-2 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm" />
            </div>
          </div>

          {/* fill mode */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm mb-1 sm:mb-2 text-gray-300">Fill Mode</label>
            <select aria-label="Fill mode" title="Fill mode" value={fillMode} onChange={e => setFillMode(e.target.value as FillMode)} className="w-full p-2 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm">
              <option value="random">Random BTS songs</option>
              <option value="album">By album</option>
              <option value="era">By era</option>
            </select>
          </div>

          {fillMode === 'album' && (
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm mb-2 text-gray-300">Choose Albums</label>
              <input value={albumSearch} onChange={e=>setAlbumSearch(e.target.value)} placeholder="Search albums…" className="w-full p-2 mb-2 bg-gray-800/50 border border-gray-600 rounded-lg text-sm" />
              <div className="max-h-32 sm:max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                {albumList.filter(alb => alb.name.toLowerCase().includes(albumSearch.trim().toLowerCase())).map(alb => (
                  <label key={alb.name} className="flex items-center space-x-2 sm:space-x-3 px-2 py-1 hover:bg-white/5 rounded cursor-pointer">
                    <input type="checkbox" checked={selectedAlbums.includes(alb.name)} onChange={() => toggleAlbum(alb.name)} className="flex-shrink-0" />
                    <img src={alb.thumb} alt={alb.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">{alb.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {fillMode === 'era' && (
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm mb-1 sm:mb-2 text-gray-300">Select Era</label>
              <select aria-label="Era" title="Era" value={selectedEra} onChange={e => setSelectedEra(e.target.value)} className="w-full p-2 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm">
                {ERAS.map(er => <option key={er.value} value={er.value}>{er.label}</option>)}
              </select>
            </div>
          )}
        </>
      ) : (
        <>
          {/* manual gap count */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm mb-1 sm:mb-2 text-gray-300">Number of gap songs</label>
            <input aria-label="Gap songs count" title="Gap songs count" type="number" min={1} value={gapCount} onChange={e => setGapCount(Number(e.target.value))} className="w-full p-2 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm" />
          </div>
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm mb-1 sm:mb-2 text-gray-300">Search & select gap songs</label>
            <input aria-label="Manual search" title="Manual search" value={manualSearch} onChange={e => setManualSearch(e.target.value)} placeholder="Search…" className="w-full p-2 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg sm:rounded-xl mb-2 text-sm" />
            <div className="max-h-40 sm:max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
              {manualFiltered.slice(0, 30).map(t => (
                <label key={t.spotifyId} className="flex items-center w-full p-2 rounded-lg hover:bg-white/10 cursor-pointer">
                  <input type="checkbox" className="mr-2 flex-shrink-0" checked={manualPool.some(s => s.spotifyId === t.spotifyId)} onChange={() => toggleManualSong(t)} />
                  <img src={t.thumbnails?.small || t.thumbnails?.medium || t.thumbnails?.large} alt={t.name} className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 rounded flex-shrink-0" />
                  <span className="text-xs sm:text-sm flex-1 truncate">{t.name} – {t.artist}</span>
                </label>
              ))}
            </div>
            {manualPool.length > 0 && <p className="text-green-400 text-xs sm:text-sm mt-2">{manualPool.length} songs selected</p>}
          </div>
        </>
      )}

      {/* total length */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm mb-1 sm:mb-2 text-gray-300">Playlist length</label>
        <input aria-label="Playlist length" title="Playlist length" type="number" min={5} value={totalLength} onChange={e => setTotalLength(Number(e.target.value))} className="w-full p-2 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg sm:rounded-xl text-sm" />
      </div>

      <button disabled={!primaryId || generating} onClick={handleGenerate} className={`w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold flex items-center justify-center transition-all duration-300 text-sm sm:text-base ${primaryId ? 'bg-purple-600/80 hover:bg-purple-600' : 'bg-gray-600'} text-white`}>
        {generating ? <Loader2 className="animate-spin w-5 h-5" /> : 'Generate Streaming Playlist'}
      </button>
    </div>
  )
}