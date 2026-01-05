'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ExternalLink, BarChart2, List } from 'lucide-react'

interface TopArtistsProps {
  artists: any[]
  loading?: boolean
}

// Helper to extract image URL from Last.fm array or string
const getImageUrl = (image: any, fallback: string = ''): string => {
  if (!image) return fallback
  if (typeof image === 'string') return image
  if (Array.isArray(image)) {
    // Try to get extralarge, then large, then medium
    const sizes = ['extralarge', 'large', 'medium', 'small']
    for (const size of sizes) {
      const img = image.find((i: any) => i.size === size)
      if (img && img['#text']) return img['#text']
    }
    // Fallback to last item (usually largest) or first
    const last = image[image.length - 1]
    if (last && last['#text']) return last['#text']
  }
  return fallback
}

export default function TopArtists({ artists, loading = false }: TopArtistsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list')

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const chartData = artists.slice(0, 8).map((artist, index) => ({
    name: artist.name,
    playcount: artist.playcount ? parseInt(artist.playcount) : 0,
    rank: artist.rank || (index + 1),
  }))

  if (loading) {
    return (
      <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-6 border border-white/5 animate-pulse min-h-[400px]">
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-black/20 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/5"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
           <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-2 rounded-xl border border-white/5">
              <BarChart2 className="w-6 h-6 text-purple-400" />
           </div>
           <div>
             <h3 className="text-xl font-bold text-white">Top Artists</h3>
             <p className="text-xs text-gray-400">Your most played artists</p>
           </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 self-start md:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl transition-all duration-300 ${
              viewMode === 'list' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`p-2 rounded-xl transition-all duration-300 ${
              viewMode === 'chart' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
            title="Chart View"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {artists.slice(0, 10).map((artist, index) => {
              // Extract image using helper
              const imageUrl = getImageUrl(artist.image, 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=60&h=60')
              
              const playcount = artist.playcount ? parseInt(artist.playcount) : 0
              const rank = artist.rank || (index + 1)

              return (
                <motion.div
                  key={artist.url || artist.id || artist.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-8 text-center font-bold text-gray-500 group-hover:text-purple-400 transition-colors">
                    #{rank}
                  </div>

                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt={artist.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/5 group-hover:border-purple-500/50 transition-colors"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=60&h=60'
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{artist.name}</p>
                    <p className="text-purple-400 text-xs font-bold">{formatNumber(playcount)} <span className="text-gray-500 font-normal">plays</span></p>
                  </div>

                  <button
                    onClick={() => window.open(artist.url || artist.external_urls?.lastfm, '_blank')}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-opacity p-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <motion.div
            key="chart"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickFormatter={formatNumber} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F0720',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#F9FAFB'
                    }}
                    cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                  />
                  <Bar 
                    dataKey="playcount" 
                    fill="#8B5CF6" 
                    radius={[4, 4, 0, 0]} 
                    name="Scrobbles"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
