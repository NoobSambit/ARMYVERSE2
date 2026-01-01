'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Calendar, RefreshCw, AlertCircle, Settings } from 'lucide-react'
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
      <div className="min-h-screen py-8 px-4 md:px-6 bg-[#0F0720]">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Loading Header */}
          <div className="flex justify-between items-center mb-8">
             <div className="h-10 bg-gray-800 rounded w-64 animate-pulse"></div>
             <div className="h-10 bg-gray-800 rounded w-32 animate-pulse"></div>
          </div>

          <div className="h-64 bg-black/40 backdrop-blur-lg rounded-3xl border border-white/5 animate-pulse"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
               <div className="h-80 bg-black/40 backdrop-blur-lg rounded-3xl border border-white/5 animate-pulse"></div>
               <div className="h-80 bg-black/40 backdrop-blur-lg rounded-3xl border border-white/5 animate-pulse"></div>
            </div>
            <div className="lg:col-span-4">
               <div className="h-[600px] bg-black/40 backdrop-blur-lg rounded-3xl border border-white/5 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 px-6 flex items-center justify-center bg-[#0F0720]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md w-full bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setUsername('')
                setError(null)
              }}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium transition-colors"
            >
              Change Username
            </button>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="min-h-screen py-6 px-4 md:px-6 bg-[#0F0720] text-white">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Dashboard Header Bar */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
              <span className="font-display font-bold text-lg">AV</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Music Stats Dashboard</h1>
              <p className="text-xs text-purple-300 tracking-wider">ARMYVERSE EDITION</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-6">
            {/* Provider Status */}
            <div className="hidden md:flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
              <span className="text-xs text-gray-400">Connected to</span>
              <span className="text-xs font-bold text-white capitalize">{provider === 'lastfm' ? 'Last.fm' : 'Stats.fm'}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            </div>

            <div className="h-8 w-px bg-white/10 hidden md:block" />

            {/* Controls */}
            <div className="flex items-center gap-3 flex-1 md:flex-none">
              <div className="relative group">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as LastFmPeriod)}
                  className="appearance-none bg-black/40 hover:bg-black/60 text-sm text-white border border-white/10 rounded-lg pl-3 pr-8 py-2 focus:border-purple-500/50 focus:outline-none transition-colors cursor-pointer min-w-[140px]"
                >
                  <option value="7day">Last 7 Days</option>
                  <option value="1month">Last Month</option>
                  <option value="3month">Last 3 Months</option>
                  <option value="6month">Last 6 Months</option>
                  <option value="12month">Last Year</option>
                  <option value="overall">All Time</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <Calendar className="w-3 h-3" />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-black/40 hover:bg-purple-500/20 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </motion.button>
              
              <motion.button
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => {
                   setUsername('')
                   setData(null)
                 }}
                 className="p-2 bg-black/40 hover:bg-purple-500/20 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-colors"
                 title="Change User Settings"
               >
                 <Settings className="w-4 h-4" />
               </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Hero Section: User Profile */}
        <div className="w-full">
          <UserProfile user={data.userProfile} overview={data.overview} />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Analytics & Charts (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* BTS Analytics - Prominent Feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <BTSAnalytics btsAnalytics={data.btsAnalytics} />
            </motion.div>

            {/* Top Artists - Secondary Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TopArtists artists={data.topArtists} />
            </motion.div>
          </div>

          {/* Right Column: Feeds & Lists (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full">
            {/* Recent Tracks Feed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="h-full"
            >
              <RecentTracks tracks={data.recentTracks} />
            </motion.div>
          </div>

        </div>

        {/* Footer Credit */}
        <div className="text-center text-xs text-gray-600 mt-12 pb-4">
           Data provided by {provider === 'lastfm' ? 'Last.fm' : 'Stats.fm'} • Designed for ARMY
        </div>
      </div>
    </div>
  )
}
