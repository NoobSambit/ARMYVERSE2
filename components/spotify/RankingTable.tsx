'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import ChangeIndicator from './ChangeIndicator'

interface RankRow {
  rank: number
  artist?: string
  name?: string
  streams?: number
  listeners?: number
  daily?: number
  dailyChange?: number
  url?: string
}

interface RankingTableProps {
  title: string
  headers: string[]
  rows: RankRow[]
  changes24h?: Record<string, { rankChange?: number, streamsChange?: number }>
  changes7d?: Record<string, { rankChange?: number, streamsChange?: number }>
  maxRows?: number
  showStreamChanges?: boolean
}

export default function RankingTable({
  title,
  headers,
  rows,
  changes24h,
  changes7d,
  maxRows = 50,
  showStreamChanges = false
}: RankingTableProps) {
  const [showAll, setShowAll] = useState(false)
  const displayRows = showAll ? rows : rows.slice(0, maxRows)

  const formatNumber = (n?: number) => {
    if (typeof n !== 'number') return '-'
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
    return n.toLocaleString()
  }

  const formatChange = (n?: number) => {
    if (typeof n !== 'number') return '-'
    const formatted = formatNumber(n)
    return n > 0 ? `+${formatted}` : formatted
  }

  const getChangeIndicator = (row: RankRow) => {
    const key = `${row.rank}-${row.name || row.artist}`
    const change24h_data = changes24h?.[key] || changes24h?.[row.artist || row.name || '']
    const change7d_data = changes7d?.[key] || changes7d?.[row.artist || row.name || '']

    if (showStreamChanges) {
      // Show stream changes for Daily 200
      const streamChange24 = change24h_data?.streamsChange
      const streamChange7d = change7d_data?.streamsChange

      if (streamChange24 === undefined && streamChange7d === undefined) return null

      return <ChangeIndicator change24h={streamChange24} change7d={streamChange7d} mode="pill" />
    } else {
      // Show rank changes for All-Time and Monthly Listeners
      const rankChange24 = change24h_data?.rankChange
      const rankChange7d = change7d_data?.rankChange

      if (rankChange24 === undefined && rankChange7d === undefined) return null

      // Rank changes are usually "up is good" (negative rank change number means better rank? No, usually +1 rank is better, but rank 1 is < rank 2).
      // Actually usually + means gained positions (rank decreased number).
      // Let's assume the data provides rank change where positive is improvement or movement.
      // Kworb usually: green means rank went UP (number went down).
      // My `ChangeIndicator` assumes + is green.
      // I'll stick to standard behavior.

      return (
        <div className="flex gap-1">
          {rankChange24 !== undefined && rankChange24 !== 0 && (
            <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded ${rankChange24 > 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
              {rankChange24 > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(rankChange24)}
            </span>
          )}
        </div>
      )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#18181B] rounded-3xl border border-white/5 overflow-hidden"
    >
      <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          {title}
        </h2>
        {/* Optional: Add Today/Yesterday toggle here if needed in future */}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm text-white">
          <thead className="bg-[#1F1F23]">
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-left text-xs font-bold text-white/40 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {displayRows.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-6 py-4 font-medium text-white/50 w-16">{row.rank}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                     {/* Add image placeholder if available in row data, though RankRow might not have it always */}
                    {row.url ? (
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-white hover:text-purple-400 transition-colors inline-flex items-center gap-1"
                      >
                        {row.name ? `${row.artist} - ${row.name}` : (row.artist || '')}
                      </a>
                    ) : (
                      <span className="font-semibold text-white">{row.name ? `${row.artist} - ${row.name}` : (row.artist || '')}</span>
                    )}
                  </div>
                </td>
                {row.streams !== undefined && row.daily !== undefined && (
                  <td className="px-6 py-4 font-mono text-white/80">
                    {formatNumber(row.streams)} <span className={`text-xs ${row.daily >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>({formatChange(row.daily)})</span>
                  </td>
                )}
                {row.streams !== undefined && row.daily === undefined && (
                  <td className="px-6 py-4 font-mono text-white/80">{formatNumber(row.streams)}</td>
                )}
                {row.daily !== undefined && row.streams === undefined && (
                  <td className={`px-6 py-4 font-mono text-right ${row.daily >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <span className={row.daily !== 0 ? 'inline-flex items-center px-2 py-0.5 rounded' + (row.daily > 0 ? ' bg-emerald-500/10' : ' bg-rose-500/10') : ''}>
                      {formatChange(row.daily)}
                    </span>
                  </td>
                )}
                {row.listeners !== undefined && (
                  <td className="px-6 py-4 font-mono text-white/80">{formatNumber(row.listeners)}</td>
                )}
                {row.dailyChange !== undefined && (
                  <td className={`px-6 py-4 font-mono text-right ${row.dailyChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                     <span className={`inline-flex items-center px-2 py-0.5 rounded ${row.dailyChange >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                        {formatChange(row.dailyChange)}
                     </span>
                  </td>
                )}
                {(changes24h || changes7d || showStreamChanges) && (
                  <td className="px-6 py-4 text-right">
                    {getChangeIndicator(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {displayRows.map((row, idx) => (
          <div
            key={idx}
            className="p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="text-lg sm:text-xl font-bold text-white/50 w-8 flex-shrink-0">
                {row.rank}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Artist/Track Name */}
                <div className="mb-2">
                  {row.url ? (
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-white hover:text-purple-400 transition-colors text-sm"
                    >
                      {row.name ? `${row.artist} - ${row.name}` : (row.artist || '')}
                    </a>
                  ) : (
                    <span className="font-semibold text-white text-sm">
                      {row.name ? `${row.artist} - ${row.name}` : (row.artist || '')}
                    </span>
                  )}
                </div>

                {/* Stats in a compact row */}
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  {row.streams !== undefined && (
                    <div className="flex items-center gap-1">
                      <span className="text-white/40">Streams:</span>
                      <span className="font-mono text-white font-medium">
                        {formatNumber(row.streams)}
                      </span>
                      {row.daily !== undefined && (
                        <span className={`font-medium ${row.daily >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ({formatChange(row.daily)})
                        </span>
                      )}
                    </div>
                  )}

                  {row.listeners !== undefined && (
                    <div className="flex items-center gap-1">
                      <span className="text-white/40">Listeners:</span>
                      <span className="font-mono text-white font-medium">
                        {formatNumber(row.listeners)}
                      </span>
                    </div>
                  )}

                  {row.dailyChange !== undefined && (
                    <div className={`flex items-center gap-1 font-medium ${row.dailyChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <span className="text-white/40">Daily:</span>
                      <span>{formatChange(row.dailyChange)}</span>
                    </div>
                  )}

                  {/* Change Indicator */}
                  {(changes24h || changes7d || showStreamChanges) && getChangeIndicator(row) && (
                    <div className="flex items-center">
                      {getChangeIndicator(row)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rows.length > maxRows && (
        <div className="p-3 sm:p-4 border-t border-white/5 text-center bg-white/[0.02]">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-purple-400 hover:text-purple-300 text-xs font-bold uppercase tracking-wide transition-colors"
          >
            {showAll ? 'Show Less' : `Show More`}
          </button>
        </div>
      )}
    </motion.div>
  )
}
