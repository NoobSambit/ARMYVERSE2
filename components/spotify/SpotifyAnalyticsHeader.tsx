'use client'

import React from 'react'
import { RefreshCw, ExternalLink, Download } from 'lucide-react'
import { motion } from 'framer-motion'

interface SpotifyAnalyticsHeaderProps {
  lastUpdated?: string
  onRefresh?: () => void
  onExport?: () => void
  refreshing?: boolean
}

export default function SpotifyAnalyticsHeader({
  lastUpdated,
  onRefresh,
  onExport,
  refreshing = false
}: SpotifyAnalyticsHeaderProps) {
  const formatDate = (dateKey: string) => {
    const date = new Date(dateKey)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
    >
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Spotify Analytics
          <span className="text-purple-400 font-light"> (Kworb)</span>
        </h1>
        <div className="flex items-center gap-3 text-sm text-white/40 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            <span>Last updated: {lastUpdated ? formatDate(lastUpdated) : 'Loading...'}</span>
          </div>
          <span className="text-white/20">•</span>
          <div className="flex items-center gap-1">
            <span>Source:</span>
            <a
              href="https://kworb.net/spotify/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-purple-400 transition-colors inline-flex items-center gap-1"
            >
              kworb.net
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2A2438] hover:bg-[#352D46] text-white text-sm font-semibold transition-all border border-purple-500/20"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </div>
    </motion.div>
  )
}
