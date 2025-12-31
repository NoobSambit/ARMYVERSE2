'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Music, User, ArrowRight, AlertCircle } from 'lucide-react'

interface UsernameInputCardProps {
  onSubmit: (username: string, provider: 'lastfm' | 'statsfm') => void
  error?: string | null
}

export default function UsernameInputCard({ onSubmit, error }: UsernameInputCardProps) {
  const [username, setUsername] = useState('')
  const [provider, setProvider] = useState<'lastfm' | 'statsfm'>('lastfm')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onSubmit(username.trim(), provider)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mb-4"
          >
            <Music className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent mb-2">
            Music Stats Dashboard
          </h1>
          <p className="text-gray-400">
            Enter your Last.fm or Stats.fm username to view your BTS listening statistics
          </p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Music Service
              </label>
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setProvider('lastfm')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    provider === 'lastfm'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  Last.fm
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setProvider('statsfm')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    provider === 'statsfm'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  Stats.fm
                </motion.button>
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={provider === 'lastfm' ? 'e.g., armyforever' : 'e.g., bts_fan_123'}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  required
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {provider === 'lastfm'
                  ? 'Your Last.fm profile must be public to view stats'
                  : 'Your Stats.fm profile must be public or you\'ll need to authenticate'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
            >
              View Stats
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>

          {/* Info Section */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <h3 className="text-sm font-medium text-gray-300 mb-3">About This Dashboard</h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>View your BTS-focused listening statistics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Track member preferences and favorite eras</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>Discover your BTS listening timeline</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>No authentication required for public profiles</span>
              </li>
            </ul>
          </div>

          {/* Example Usernames */}
          <div className="mt-4 p-3 bg-purple-500/5 rounded-lg">
            <p className="text-xs text-gray-500">
              Don&apos;t have an account? Create one at{' '}
              <a
                href="https://www.last.fm/join"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Last.fm
              </a>
              {' '}or{' '}
              <a
                href="https://stats.fm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Stats.fm
              </a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
