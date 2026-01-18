'use client'

import React from 'react'
import { ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

interface SpotifyAnalyticsHeaderProps {
  lastUpdated?: string
}

export default function SpotifyAnalyticsHeader({
  lastUpdated,
}: SpotifyAnalyticsHeaderProps) {
  const formatDate = (dateKey: string) => {
    const date = new Date(dateKey)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
        </h1>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-white/40 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            <span>
              Last updated:{' '}
              {lastUpdated ? formatDate(lastUpdated) : 'Loading...'}
            </span>
          </div>
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
        <p className="text-xs text-white/30 mt-2 max-w-2xl">
          Data is scraped from kworb.net. Minor inaccuracies or delays can be
          present compared to official Spotify stats.
        </p>
      </div>
    </motion.div>
  )
}
