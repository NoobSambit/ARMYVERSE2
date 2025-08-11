'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { User, ExternalLink } from 'lucide-react'
import { SpotifyArtist } from '@/lib/spotify/dashboard'

interface TopArtistsProps {
  artists: SpotifyArtist[]
  loading?: boolean
  // Map of artistId to number of times played in recent history
  playCounts?: Record<string, number>
}

export default function TopArtists({ artists, loading = false, playCounts = {} }: TopArtistsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list')
  const [expanded, setExpanded] = useState(false)
  const topFive = artists.slice(0, 5)
  const restArtists = artists.slice(5)

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const chartData = artists.slice(0, 8).map((artist, index) => ({
    name: artist.name,
    popularity: artist.popularity,
    followers: artist.followers.total,
    color: `hsl(${index * 45}, 70%, 60%)`
  }))

  const pieData = artists.slice(0, 5).map((artist, index) => ({
    name: artist.name,
    value: artist.popularity,
    color: `hsl(${index * 72}, 70%, 60%)`
  }))

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-purple-500/30"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-6 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-700 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-black/40 backdrop-blur-lg rounded-3xl p-6 border border-purple-500/30"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 sm:mb-6 space-y-3 md:space-y-0">
        <motion.h3
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl font-bold text-white flex items-center space-x-2"
        >
          <User className="w-5 h-5 text-purple-400" />
          <span>Top Artists</span>
        </motion.h3>

        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-800/50 rounded-lg p-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              List
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'chart'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Chart
            </motion.button>
          </div>

          {/* View More Button for list mode */}
          {viewMode === 'list' && restArtists.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setExpanded(true)}
              className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
            >
              View More
            </motion.button>
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {topFive.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-xl hover:bg-white/5 transition-all duration-300"
              >
                {/* Rank */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                </div>

                {/* Artist Image */}
                <div className="relative">
                  <img
                    src={artist.images[0]?.url || 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=60&h=60'}
                    alt={artist.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Artist Info */}
                <div className="flex-1 min-w-0">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="text-white font-medium truncate text-sm sm:text-base"
                  >
                    {artist.name}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="text-gray-400 text-xs sm:text-sm truncate"
                  >
                    {artist.genres.slice(0, 2).join(', ')}
                  </motion.p>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm">
                  <div className="text-center">
                    <p className="text-purple-400 font-medium">{artist.popularity}%</p>
                    <p className="text-gray-500 text-xs">Popularity</p>
                  </div>
                  <div className="text-center">
                    <p className="text-pink-400 font-medium">{formatNumber(artist.followers.total)}</p>
                    <p className="text-gray-500 text-xs">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-green-400 font-medium">{playCounts[artist.id] ?? 0}</p>
                    <p className="text-gray-500 text-xs">Plays</p>
                  </div>
                </div>

                {/* Action */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => window.open(artist.external_urls.spotify, '_blank')}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}

            {/* Expanded card with scroll for remaining artists */}
            <AnimatePresence>
              {expanded && restArtists.length > 0 && (
                <motion.div
                  key="expanded-list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 rounded-xl border border-purple-500/30 bg-black/30"
                >
                  <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-gray-700/50">
                    <p className="text-sm text-gray-300">More artists</p>
                    <button onClick={() => setExpanded(false)} className="text-xs text-purple-300 hover:text-white">Close</button>
                  </div>
                  <div className="max-h-80 sm:max-h-96 overflow-y-auto p-2 sm:p-3 space-y-2">
                    {restArtists.map((artist, idx) => (
                      <div key={artist.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {idx + 6}
                        </div>
                        <img src={artist.images[0]?.url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=60&auto=format&fit=crop'} alt={artist.name} className="w-8 h-8 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white truncate text-sm">{artist.name}</p>
                          <p className="text-gray-400 truncate text-xs">{artist.genres.slice(0,2).join(', ')}</p>
                        </div>
                        <div className="flex items-center space-x-3 text-xs">
                          <span className="text-purple-400">{artist.popularity}%</span>
                          <span className="text-pink-400">{formatNumber(artist.followers.total)}</span>
                          <span className="text-green-400">{playCounts[artist.id] ?? 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="chart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Bar Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #6B7280',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }} 
                  />
                  <Bar dataKey="popularity" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #6B7280',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hide legacy inline expand button; handled by header View More */}

      {/* Empty State */}
      {artists.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <User className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No top artists found</p>
          <p className="text-gray-500 text-sm">Start listening to see your top artists</p>
        </motion.div>
      )}
    </motion.div>
  )
}