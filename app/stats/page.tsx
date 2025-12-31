'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Calendar, RefreshCw, AlertCircle } from 'lucide-react'
import UserProfile from '@/components/dashboard/UserProfile'
import RecentTracks from '@/components/dashboard/RecentTracks'
import TopArtists from '@/components/dashboard/TopArtists'
import BTSAnalytics from '@/components/dashboard/BTSAnalytics'
import UsernameInputCard from '@/components/dashboard/UsernameInputCard'
import { LastFmPeriod } from '@/lib/lastfm/types'

interface DashboardData {
  userProfile: {
    name: string
    realname: string
    url: string
    image: string
    playcount: number
    registered: Date
    accountAge: string
  }
  overview: {
    totalTracks: number
    totalArtists: number
    totalListeningTime: number
    btsPlays: number
    btsPercentage: number
    accountAge: string
  }
  recentTracks: any[]
  topArtists: any[]
  topTracks: any[]
  topAlbums: any[]
  btsAnalytics: {
    totalBTSPlays: number
    favoriteBTSAlbum: string
    memberPreference: Array<{ member: string; plays: number }>
    btsTracks: any[]
    soloTracks: any[]
  }
  btsTimeline: any
}

export default function Stats() {
  const [username, setUsername] = useState<string>('')
  const [provider, setProvider] = useState<'lastfm' | 'statsfm'>('lastfm')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<LastFmPeriod>('overall')
  const [refreshing, setRefreshing] = useState(false)

  const loadDashboardData = useCallback(async () => {
    if (!username) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/music/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          provider,
          period,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch dashboard data')
      }

      const freshData = await response.json()
      setData(freshData)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [username, provider, period])

  useEffect(() => {
    if (username) {
      loadDashboardData()
    }
  }, [username, period, loadDashboardData])

  const handleUsernameSubmit = (newUsername: string, newProvider: 'lastfm' | 'statsfm') => {
    setUsername(newUsername)
    setProvider(newProvider)
    setError(null)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
  }

  // Show username input if no username is set
  if (!username) {
    return <UsernameInputCard onSubmit={handleUsernameSubmit} error={error} />
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Loading Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="animate-pulse">
              <div className="h-12 bg-gray-700 rounded mb-4 w-1/2 mx-auto"></div>
              <div className="h-6 bg-gray-700 rounded w-1/3 mx-auto"></div>
            </div>
          </motion.div>

          {/* Loading Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-purple-500/30 animate-pulse"
              >
                <div className="h-6 bg-gray-700 rounded mb-6 w-1/3"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-16 bg-gray-700 rounded"></div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Error Loading Dashboard</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setUsername('')
                  setError(null)
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-medium transition-colors"
              >
                Change Username
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-colors"
              >
                Try Again
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="min-h-screen py-8 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
            Music Stats Dashboard
          </h1>
          <p className="text-xl text-gray-400">
            BTS-focused listening analytics from {provider === 'lastfm' ? 'Last.fm' : 'Stats.fm'}
          </p>
          <button
            onClick={() => {
              setUsername('')
              setData(null)
            }}
            className="mt-4 text-sm text-gray-500 hover:text-gray-400 underline"
          >
            Change username ({username})
          </button>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-purple-500/20"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Time Range:</span>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as LastFmPeriod)}
                className="bg-black/80 text-white border border-gray-700 rounded-lg px-3 py-2 focus:border-purple-400 focus:outline-none"
                aria-label="Time range selection"
              >
                <option value="7day">Last 7 Days</option>
                <option value="1month">Last Month</option>
                <option value="3month">Last 3 Months</option>
                <option value="6month">Last 6 Months</option>
                <option value="12month">Last Year</option>
                <option value="overall">All Time</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* User Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <UserProfile user={data.userProfile} overview={data.overview} />
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Tracks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <RecentTracks tracks={data.recentTracks} />
          </motion.div>

          {/* Top Artists */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <TopArtists artists={data.topArtists} />
          </motion.div>
        </div>

        {/* BTS Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <BTSAnalytics btsAnalytics={data.btsAnalytics} />
        </motion.div>
      </div>
    </div>
  )
}
