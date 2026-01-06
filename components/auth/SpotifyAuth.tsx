'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Music, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth'
import { getAuthToken } from '@/lib/auth/token'

interface SpotifyAuthProps {
  onAuthSuccess?: () => void
}

export default function SpotifyAuth({ onAuthSuccess }: SpotifyAuthProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { isAuthenticated, refreshStatus, isLoading: statusLoading } = useSpotifyAuth()

  const handleSpotifyAuth = async () => {
    try {
      if (!user) {
        setError('Please sign in to continue')
        return
      }

      setIsLoading(true)
      setError(null)

      const idToken = await getAuthToken(user)
      const response = await fetch('/api/spotify/auth-url', {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody.error || 'Failed to get authentication URL')
      }

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Failed to get authentication URL')
      }
    } catch (err) {
      console.error('Error starting Spotify auth:', err)
      setError(err instanceof Error ? err.message : 'Failed to start authentication')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const auth = params.get('auth')
    const authError = params.get('error')

    if (authError) {
      setError(`Authentication failed: ${authError}`)
    }

    if (auth === 'success') {
      refreshStatus()
      onAuthSuccess?.()
    }

    if (auth || authError) {
      params.delete('auth')
      params.delete('error')
      const nextQuery = params.toString()
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`
      window.history.replaceState({}, document.title, nextUrl)
    }
  }, [onAuthSuccess, refreshStatus])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}

      className="min-h-screen flex items-center justify-center py-8 px-6"
    >
      <div className="max-w-md w-full">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border border-purple-500/30 text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Music className="w-10 h-10 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Connect Your Spotify
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 mb-8"
          >
            Connect your Spotify account to see your personalized music analytics, 
            listening habits, and BTS-specific insights.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 mb-8 text-left"
          >
            <div className="flex items-center space-x-3 text-gray-300">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>View your top artists and tracks</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Analyze your BTS listening habits</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Get personalized recommendations</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Discover your music mood patterns</span>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </motion.div>
          )}

          {/* Connect Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSpotifyAuth}
            disabled={isLoading || statusLoading}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl text-white font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3"
          >
            {isLoading || statusLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-5 h-5" />
                <span>{isAuthenticated ? 'Reconnect with Spotify' : 'Connect with Spotify'}</span>
              </>
            )}
          </motion.button>

          {/* Privacy Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-gray-500 text-sm mt-6"
          >
            We only access your public profile and listening data. 
            Your data is never shared with third parties.
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  )
}