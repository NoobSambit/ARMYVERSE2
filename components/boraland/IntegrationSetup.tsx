'use client'

import { useState } from 'react'
import { apiFetch } from '@/lib/client/api'

export default function IntegrationSetup({ onComplete }: { onComplete?: () => void }) {
  const [lastfmUsername, setLastfmUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setLoading(true)
    setError(null)

    try {
      await apiFetch('/api/user/integrations', {
        method: 'PATCH',
        body: JSON.stringify({ lastfmUsername })
      })

      onComplete?.()
    } catch (e: any) {
      setError(e.message || 'Failed to connect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md">
      <h3 className="text-xl font-semibold text-white mb-4">Connect Last.fm</h3>
      <p className="text-white/70 text-sm mb-4">
        Connect your Last.fm account to track streaming quests and earn rewards!
      </p>

      <input
        type="text"
        placeholder="Your Last.fm username"
        value={lastfmUsername}
        onChange={(e) => setLastfmUsername(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 mb-4"
      />

      {error && <div className="text-rose-300 text-sm mb-4">{error}</div>}

      <button
        onClick={handleConnect}
        disabled={loading || !lastfmUsername}
        className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF9AD5] to-[#C084FC] text-black font-semibold disabled:opacity-50"
      >
        {loading ? 'Connecting...' : 'Connect Last.fm'}
      </button>
    </div>
  )
}
