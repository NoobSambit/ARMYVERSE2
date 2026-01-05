'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/client/api'

type ConnectionModalProps = {
  isOpen: boolean
  onClose: () => void
  onConnected: () => void
}

export default function StreamingConnectionModal({ isOpen, onClose, onConnected }: ConnectionModalProps) {
  const [service, setService] = useState<'lastfm' | 'statsfm'>('lastfm')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentConnection, setCurrentConnection] = useState<{lastfm?: string, statsfm?: string} | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadCurrentConnection()
    }
  }, [isOpen])

  const loadCurrentConnection = async () => {
    try {
      const res = await apiFetch('/api/user/integrations')
      setCurrentConnection({
        lastfm: res.lastfm?.username,
        statsfm: res.statsfm?.username
      })
    } catch (e) {
      // Ignore
    }
  }

  const handleConnect = async () => {
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await apiFetch('/api/user/integrations', {
        method: 'PATCH',
        body: JSON.stringify({
          [service === 'lastfm' ? 'lastfmUsername' : 'statsfmUsername']: username.trim()
        })
      })

      onConnected()
      onClose()
    } catch (e: any) {
      setError(e.message || 'Failed to connect. Please check your username and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async (serviceType: 'lastfm' | 'statsfm') => {
    setLoading(true)
    setError(null)

    try {
      await apiFetch('/api/user/integrations', {
        method: 'PATCH',
        body: JSON.stringify({
          [serviceType === 'lastfm' ? 'lastfmUsername' : 'statsfmUsername']: null
        })
      })

      await loadCurrentConnection()
    } catch (e: any) {
      setError(e.message || 'Failed to disconnect')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gradient-to-br from-surface-dark via-surface to-surface-dark border border-bora-primary/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Connect Streaming Service</h2>
            <p className="text-gray-400 text-sm">
              Connect Last.fm or Stats.fm to track your streaming progress and complete quests
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Current Connections */}
        {(currentConnection?.lastfm || currentConnection?.statsfm) && (
          <div className="mb-6 p-4 rounded-xl bg-surface-lighter/50 border border-white/5">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-3">Current Connections</p>
            <div className="space-y-2">
              {currentConnection.lastfm && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-400">headphones</span>
                    <div>
                      <p className="text-sm font-medium text-white">Last.fm</p>
                      <p className="text-xs text-gray-400">@{currentConnection.lastfm}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDisconnect('lastfm')}
                    disabled={loading}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                  >
                    Disconnect
                  </button>
                </div>
              )}
              {currentConnection.statsfm && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-400">analytics</span>
                    <div>
                      <p className="text-sm font-medium text-white">Stats.fm</p>
                      <p className="text-xs text-gray-400">@{currentConnection.statsfm}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDisconnect('statsfm')}
                    disabled={loading}
                    className="text-xs text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Service Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Service</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setService('lastfm')}
              className={`p-4 rounded-xl border-2 transition-all ${
                service === 'lastfm'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <span className="material-symbols-outlined text-3xl mb-2 block text-red-400">headphones</span>
              <p className="text-sm font-semibold text-white">Last.fm</p>
              <p className="text-xs text-gray-400 mt-1">Most accurate</p>
            </button>
            <button
              onClick={() => setService('statsfm')}
              className={`p-4 rounded-xl border-2 transition-all ${
                service === 'statsfm'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <span className="material-symbols-outlined text-3xl mb-2 block text-green-400">analytics</span>
              <p className="text-sm font-semibold text-white">Stats.fm</p>
              <p className="text-xs text-gray-400 mt-1">Spotify stats</p>
            </button>
          </div>
        </div>

        {/* Username Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {service === 'lastfm' ? 'Last.fm' : 'Stats.fm'} Username
          </label>
          <input
            type="text"
            placeholder={`Enter your ${service === 'lastfm' ? 'Last.fm' : 'Stats.fm'} username`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            className="w-full px-4 py-3 rounded-xl bg-surface-lighter border border-white/10 text-white placeholder-gray-500 focus:border-bora-primary/50 focus:outline-none transition-colors"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-2">
            {service === 'lastfm'
              ? 'Find your username at last.fm/user/YOUR_USERNAME'
              : 'Find your username at stats.fm/YOUR_USERNAME'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-2">
            <span className="material-symbols-outlined text-base mt-0.5">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Info */}
        <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-400 text-base mt-0.5">info</span>
            <div className="text-xs text-blue-200">
              <p className="font-semibold mb-1">How it works:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-300">
                <li>Your streaming data is checked from the quest start time</li>
                <li>Only streams of the required songs/albums count</li>
                <li>Data is cached for 15 minutes to reduce API calls</li>
                <li>Click "Verify Progress" to update your quest progress</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-surface-lighter text-gray-300 font-semibold hover:bg-surface-dark transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={loading || !username.trim()}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-bora-primary to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-bora-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Connecting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">link</span>
                Connect
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
