'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Calendar, TrendingUp, Heart, Play, Music, RefreshCw, AlertCircle } from 'lucide-react'
import UserProfile from '@/components/dashboard/UserProfile'
import RecentTracks from '@/components/dashboard/RecentTracks'
import TopArtists from '@/components/dashboard/TopArtists'
import BTSAnalytics from '@/components/dashboard/BTSAnalytics'
import SpotifyConnectCard from '@/components/auth/SpotifyConnectCard'
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth'
import { 
  fetchDashboardData, 
  getCachedDashboardData, 
  cacheDashboardData,
  SpotifyUser,
  SpotifyTrack,
  SpotifyArtist,
  AudioFeatures,
  DashboardOverview,
  BTSAnalytics as BTSAnalyticsType,
  GenreAnalysis,
  MoodAnalysis,
  ListeningPatterns
} from '@/lib/spotify/dashboard'

interface DashboardData {
  userProfile: SpotifyUser
  overview: DashboardOverview
  recentTracks: SpotifyTrack[]
  topArtists: SpotifyArtist[]
  topTracks: SpotifyTrack[]
  userPlaylists: SpotifyTrack[]
  audioFeatures: AudioFeatures[]
  btsAnalytics: BTSAnalyticsType
  genreAnalysis: GenreAnalysis[]
  moodAnalysis: MoodAnalysis[]
  listeningPatterns: ListeningPatterns
  recommendations: SpotifyTrack[]
}

export default function Stats() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('short_term')
  const [refreshing, setRefreshing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const { isAuthenticated } = useSpotifyAuth()

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Try to get cached data first
      const cachedData = await getCachedDashboardData(userId)
      
      if (cachedData) {
        setData(cachedData)
        setLoading(false)
        return
      }

      // Fetch fresh data using backend API
      const freshData = await fetchDashboardData(userId)
      setData(freshData)
      
      // Cache the data
      await cacheDashboardData(userId, freshData)
      
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadDashboardData()
    }
  }, [timeRange, isAuthenticated, userId, loadDashboardData])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      if (!userId) {
        throw new Error('User not authenticated')
      }
      const freshData = await fetchDashboardData(userId)
      setData(freshData)
      await cacheDashboardData(userId, freshData)
    } catch (err) {
      setError('Failed to refresh data. Please try again.')
    } finally {
      setRefreshing(false)
    }
  }

  const handleAuthenticated = (newUserId: string) => {
    setUserId(newUserId)
    // The useSpotifyAuth hook will automatically handle the authentication status
  }

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return <SpotifyConnectCard onAuthSuccess={() => handleAuthenticated('user-123')} />
  }

  if (loading) {
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadDashboardData}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-colors"
            >
              Try Again
            </motion.button>
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
            Spotify Dashboard
          </h1>
          <p className="text-xl text-gray-400">
            Your personalized music analytics and insights
          </p>
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
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-black/80 text-white border border-gray-700 rounded-lg px-3 py-2 focus:border-purple-400 focus:outline-none"
                aria-label="Time range selection"
              >
                <option value="short_term">Last 4 Weeks</option>
                <option value="medium_term">Last 6 Months</option>
                <option value="long_term">All Time</option>
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
            {(() => {
              const counts: Record<string, number> = {}
              // Count occurrences of each artist from recent tracks
              for (const t of data.recentTracks) {
                for (const a of t.artists) {
                  if (!a.id) continue
                  counts[a.id] = (counts[a.id] || 0) + 1
                }
              }
              return <TopArtists artists={data.topArtists} playCounts={counts} />
            })()}
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Genre Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Music className="mr-2" />
              Genre Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.genreAnalysis.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="percentage"
                  label={({ genre, percentage }) => `${genre}: ${percentage}%`}
                >
                  {data.genreAnalysis.slice(0, 5).map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={`hsl(${i * 72}, 70%, 60%)`} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#000000', 
                    border: '1px solid #6B7280',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Mood Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Heart className="mr-2" />
              Mood Analysis
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.moodAnalysis.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="track" 
                  stroke="#9CA3AF" 
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#000000', 
                    border: '1px solid #6B7280',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Bar dataKey="energy" fill="#8B5CF6" name="Energy" />
                <Bar dataKey="valence" fill="#EC4899" name="Valence" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <TrendingUp className="mr-2" />
            Recommended for You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.recommendations.slice(0, 8).map((track, i) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ scale: 1.05 }}
                className="group bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
              >
                <Image
                  src={track.album.images[0]?.url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=300&auto=format&fit=crop'}
                  alt={track.album.name}
                  width={150}
                  height={150}
                  className="w-full aspect-square rounded-lg object-cover mb-3 group-hover:scale-105 transition-transform duration-300"
                />
                <h4 className="text-white font-medium truncate">{track.name}</h4>
                <p className="text-gray-400 text-sm truncate">{track.artists.map((a) => a.name).join(', ')}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-purple-400 text-sm">{track.popularity}%</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => window.open(track.external_urls.spotify, '_blank')}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}