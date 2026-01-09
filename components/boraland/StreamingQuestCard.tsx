'use client'

import { useState } from 'react'
import StreamingConnectionModal from './quests/StreamingConnectionModal'

type StreamingQuest = {
  code: string
  title: string
  period: string
  progress: number
  goalValue: number
  completed: boolean
  claimed: boolean
  streamingMeta?: {
    trackTargets?: Array<{ trackName: string; artistName: string; count: number; thumbnail?: string | null; spotifyId?: string | null }>
    albumTargets?: Array<{ albumName: string; trackCount: number; tracks?: Array<{name: string; artist: string}>, coverImage?: string | null; spotifyId?: string | null }>
  }
  trackProgress?: Record<string, number>
  reward?: { dust: number; xp: number }
}

// Helper function to normalize track names (must match backend logic)
function normalizeTrackName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, '')
    .replace(/\s*\[.*?\]\s*/g, '')
    .replace(/\s*-\s*feat\..*$/i, '')
    .replace(/\s*ft\..*$/i, '')
    .replace(/[^\w\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
}

export default function StreamingQuestCard({
  quest,
  onClaim,
  onVerify,
  isConnected
}: {
  quest: StreamingQuest
  onClaim: (code: string) => void
  onVerify: () => void
  isConnected?: boolean
}) {
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const percent = Math.min((quest.progress / quest.goalValue) * 100, 100)
  
  const dust = quest.reward?.dust || 150
  const xp = quest.reward?.xp || 50

  return (
    <div className="bora-glass-panel rounded-2xl p-5 border border-bora-primary/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
        <span className="material-symbols-outlined text-9xl">headphones</span>
      </div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <span className="material-symbols-outlined text-2xl">queue_music</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">{quest.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Streaming</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">schedule</span> 
                    {quest.period === 'daily' ? 'Resets daily' : 'Resets weekly'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-sm font-bold text-accent-neon">+{dust} Dust</span>
            <span className="text-xs text-gray-500">+{xp} XP</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-300 font-medium">Progress</span>
            <span className="text-white font-bold">{quest.progress} / {quest.goalValue}</span>
          </div>
          <div className="w-full bg-surface-lighter h-2.5 rounded-full overflow-hidden">
            <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full shadow-[0_0_10px_rgba(167,139,250,0.5)] relative transition-all duration-500"
                style={{ width: `${percent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
            </div>
          </div>
        </div>

        {/* Connection Status Banner */}
        {!isConnected && (
          <div className="mb-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
            <span className="material-symbols-outlined text-yellow-400 mt-0.5">warning</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-200 mb-1">Streaming Service Not Connected</p>
              <p className="text-xs text-yellow-300/80 mb-3">
                Connect Last.fm or Stats.fm to track your progress automatically
              </p>
              <button
                onClick={() => setShowConnectionModal(true)}
                className="px-3 py-1.5 rounded-xl bg-yellow-600/20 text-yellow-300 text-xs font-bold border border-yellow-600/30 hover:bg-yellow-600/30 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">link</span>
                Connect Now
              </button>
            </div>
          </div>
        )}

        <div className="bg-surface-dark/50 rounded-xl p-4 border border-white/5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Required Tracks</p>
            {isConnected && (
              <div className="flex items-center gap-1.5 text-xs text-green-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                Connected
              </div>
            )}
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {quest.streamingMeta?.trackTargets?.map((target, idx) => {
                const trackKey = `track:${normalizeTrackName(target.trackName)}:${target.artistName.toLowerCase()}`.replace(/\./g, '_')
                const currentProgress = quest.trackProgress?.[trackKey] || 0
                const isComplete = currentProgress >= target.count

                return (
                  <div key={idx} className={`flex items-center justify-between p-2 rounded-xl transition-colors group ${isComplete ? 'bg-green-500/10 border border-green-500/20' : 'bg-surface-lighter/50 hover:bg-surface-lighter'}`}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                          <TrackThumbnail url={target.thumbnail} spotifyId={target.spotifyId} isComplete={isComplete} />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-gray-200 truncate">{target.trackName}</div>
                            <div className="text-xs text-gray-500">{target.artistName}</div>
                          </div>
                      </div>
                      <div className={`text-xs flex items-center gap-1.5 shrink-0 ml-2 font-bold ${isComplete ? 'text-green-400' : currentProgress > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                          <span className="material-symbols-outlined text-xs">repeat</span>
                          {currentProgress}/{target.count}
                      </div>
                  </div>
                )
            })}
            {quest.streamingMeta?.albumTargets?.map((target, idx) => (
                <AlbumTarget key={idx} album={target} trackProgress={quest.trackProgress} />
            ))}
          </div>

          {!isConnected && (
            <div className="mt-4">
              <button
                onClick={() => setShowConnectionModal(true)}
                className="w-full py-2 rounded-xl bg-yellow-600/20 text-yellow-400 text-xs font-bold border border-yellow-600/30 hover:bg-yellow-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">link</span> Connect to Verify
              </button>
            </div>
          )}
        </div>

        <button
            disabled={!quest.completed || quest.claimed}
            onClick={() => onClaim(quest.code)}
            className={`w-full py-3 rounded-xl font-bold text-sm border border-white/5 transition-colors ${
                quest.claimed
                    ? 'bg-surface-lighter text-gray-500 cursor-not-allowed'
                    : quest.completed
                        ? 'bg-bora-primary text-white hover:bg-bora-primary-dark shadow-lg shadow-bora-primary/25 animate-pulse'
                        : 'bg-surface-lighter text-gray-500 cursor-not-allowed'
            }`}
        >
            {quest.claimed ? 'Claimed' : quest.completed ? 'Claim Reward' : 'Claim Reward (Incomplete)'}
        </button>
      </div>

      {/* Connection Modal */}
      <StreamingConnectionModal
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
        onConnected={() => {
          setShowConnectionModal(false)
          onVerify()
        }}
      />
    </div>
  )
}

function TrackThumbnail({ url, spotifyId, isComplete }: { url?: string | null, spotifyId?: string | null, isComplete: boolean }) {
  const content = url ? (
    <img src={url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/10" />
  ) : (
    <div className={`w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center shrink-0 ${isComplete ? 'from-green-600 to-emerald-600' : 'from-purple-600 to-pink-600'}`}>
      <span className="material-symbols-outlined text-white text-sm">{isComplete ? 'check_circle' : 'music_note'}</span>
    </div>
  )

  if (spotifyId) {
    return (
      <a href={`https://open.spotify.com/track/${spotifyId}`} target="_blank" rel="noreferrer" className="shrink-0">
        {content}
      </a>
    )
  }
  return content
}

function AlbumThumbnail({ url, spotifyId, isComplete }: { url?: string | null, spotifyId?: string | null, isComplete: boolean }) {
  const content = url ? (
    <img src={url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/10" />
  ) : (
    <div className={`w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center shrink-0 ${isComplete ? 'from-green-600 to-emerald-600' : 'from-blue-600 to-purple-600'}`}>
      <span className="material-symbols-outlined text-white text-sm">{isComplete ? 'check_circle' : 'album'}</span>
    </div>
  )

  if (spotifyId) {
    return (
      <a href={`https://open.spotify.com/album/${spotifyId}`} target="_blank" rel="noreferrer" className="shrink-0">
        {content}
      </a>
    )
  }
  return content
}

// Album target component with expandable track list
function AlbumTarget({ album, trackProgress }: {
  album: { albumName: string; trackCount: number; tracks?: Array<{name: string; artist: string}>, coverImage?: string | null, spotifyId?: string | null }
  trackProgress?: Record<string, number>
}) {
  const [expanded, setExpanded] = useState(false)

  // Calculate how many tracks from this album are complete
  const completedTracks = album.tracks?.reduce((count, track) => {
    const trackKey = `album:${album.albumName}:${normalizeTrackName(track.name)}`.replace(/\./g, '_')
    return count + (trackProgress?.[trackKey] ? 1 : 0)
  }, 0) || 0

  const totalTracks = album.tracks?.length || 0
  const isComplete = completedTracks === totalTracks && totalTracks > 0

  return (
    <div className={`rounded-xl overflow-hidden ${isComplete ? 'bg-green-500/10 border border-green-500/20' : 'bg-surface-lighter/50'}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2 hover:bg-surface-lighter transition-colors group"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <AlbumThumbnail url={album.coverImage} spotifyId={album.spotifyId} isComplete={isComplete} />
          <div className="min-w-0 flex-1">
            <div className="text-sm text-gray-200 truncate">{album.albumName}</div>
            <div className="text-xs text-gray-500">{album.trackCount} tracks required</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {album.tracks && album.tracks.length > 0 && (
            <span className={`text-xs font-bold ${isComplete ? 'text-green-400' : completedTracks > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
              {completedTracks}/{totalTracks}
            </span>
          )}
          <span className={`material-symbols-outlined text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </div>
      </button>

      {expanded && album.tracks && album.tracks.length > 0 && (
        <div className="px-2 pb-2 space-y-1">
          {album.tracks.map((track, idx) => {
            const trackKey = `album:${album.albumName}:${normalizeTrackName(track.name)}`.replace(/\./g, '_')
            const isTrackComplete = trackProgress?.[trackKey] === 1

            return (
              <div
                key={idx}
                className={`flex items-center gap-2 p-2 rounded text-xs transition-colors ${isTrackComplete ? 'bg-green-500/10 border border-green-500/20' : 'bg-surface-dark/50'}`}
              >
                <span className={`w-6 text-center ${isTrackComplete ? 'text-green-400' : 'text-gray-500'}`}>
                  {isTrackComplete ? '✓' : idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`truncate ${isTrackComplete ? 'text-green-300' : 'text-gray-300'}`}>{track.name}</div>
                  <div className="text-gray-600 text-[10px]">{track.artist}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
