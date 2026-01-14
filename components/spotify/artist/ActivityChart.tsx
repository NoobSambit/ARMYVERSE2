'use client'

import React, { useState, useEffect } from 'react'

interface ActivityChartProps {
  artist: string
}

interface HistoryData {
  date: string
  totalStreams: number
  dailyGain: number
}

export default function ActivityChart({ artist }: ActivityChartProps) {
  const [history, setHistory] = useState<HistoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/spotify/kworb/history?artist=${encodeURIComponent(artist)}&days=30`)
        const json = await res.json()
        if (json.ok) {
          setHistory(json.history)
        }
      } catch (err) {
        console.error('Failed to fetch history:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [artist])

  if (loading || history.length === 0) {
    return (
      <div className="bg-[#2e2249] rounded-xl p-4 sm:p-5 md:p-6 border border-white/5 flex flex-col h-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px]">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg">Listening Activity</h3>
            <p className="text-[#a290cb] text-[10px] sm:text-xs">Last 30 Days • Daily Streams</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white/40 text-xs sm:text-sm">{loading ? 'Loading...' : 'No data available'}</div>
        </div>
      </div>
    )
  }

  // Format large numbers
  const formatValue = (n: number) => {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
    return n.toLocaleString()
  }

  // Format date for tooltip
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Show every nth bar to avoid overcrowding (max 15 bars)
  const maxBars = 15
  const step = Math.ceil(history.length / maxBars)
  const displayHistory = history.filter((_, i) => i % step === 0 || i === history.length - 1)

  // Calculate positive and negative max values separately
  const maxPositive = Math.max(...history.map(h => Math.max(0, h.dailyGain)), 1)
  const maxNegative = Math.abs(Math.min(...history.map(h => Math.min(0, h.dailyGain)), 0))
  const maxAbsValue = Math.max(maxPositive, maxNegative)

  // Calculate zero line position (40% from bottom if we have negative values, otherwise 10%)
  const hasNegativeValues = maxNegative > 0
  const zeroLinePosition = hasNegativeValues ? 40 : 10

  return (
    <div className="bg-[#2e2249] rounded-xl p-4 sm:p-5 md:p-6 border border-white/5 flex flex-col h-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px]">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div>
          <h3 className="text-white font-bold text-base sm:text-lg">Listening Activity</h3>
          <p className="text-[#a290cb] text-[10px] sm:text-xs">Last {history.length} Days • Daily Streams Variance</p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full relative h-[180px] sm:h-[220px] md:h-[260px]">
        {/* Zero line */}
        <div
          className="absolute left-0 right-0 h-px bg-white/10 pointer-events-none z-0"
          style={{ top: `${zeroLinePosition}%` }}
        />

        {/* Bars */}
        <div className="absolute inset-0 flex items-end gap-1 sm:gap-1.5 md:gap-2 px-1 sm:px-2 pb-2">
          {displayHistory.map((data, i) => {
            const originalIndex = history.indexOf(data)
            const dailyGain = data.dailyGain
            const isPositive = dailyGain >= 0
            const isHovered = hoveredIndex === originalIndex
            const isLatest = originalIndex === history.length - 1

            // Calculate bar height as percentage of max value
            const absValue = Math.abs(dailyGain)
            const barHeightPercent = Math.max(5, (absValue / maxAbsValue) * 35)

            // Position the bar - positive bars go up from zero line, negative bars go down
            let barStyle: React.CSSProperties = {}
            if (isPositive) {
              barStyle = {
                bottom: `${zeroLinePosition}%`,
                height: `${barHeightPercent}%`
              }
            } else {
              barStyle = {
                top: `${zeroLinePosition}%`,
                height: `${barHeightPercent}%`
              }
            }

            return (
              <div
                key={i}
                className="flex-1 relative h-full"
              >
                <div
                  className={`absolute left-1 right-1 transition-all rounded-sm ${
                    isLatest
                      ? 'bg-[#895af6] shadow-[0_0_15px_rgba(137,90,246,0.5)]'
                      : isPositive
                        ? 'bg-green-500/60 hover:bg-green-500'
                        : 'bg-red-500/60 hover:bg-red-500'
                  } ${isPositive ? 'rounded-t-sm' : 'rounded-b-sm'}`}
                  style={barStyle}
                  onMouseEnter={() => setHoveredIndex(originalIndex)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip */}
                  <div className={`absolute ${isPositive ? '-top-10 sm:-top-12 md:-top-14' : 'top-full mt-1 sm:mt-1.5 md:mt-2'} left-1/2 -translate-x-1/2 bg-white text-black text-[8px] sm:text-[9px] md:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap transition-opacity z-20 pointer-events-none ${
                    isHovered || isLatest ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div>{formatValue(dailyGain)} daily</div>
                    <div className="text-[7px] sm:text-[8px] font-normal text-gray-600">{formatDate(data.date)}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 sm:gap-6 mt-3 sm:mt-4 text-[10px] sm:text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-green-500/60"></div>
          <span className="text-white/60">Positive</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-red-500/60"></div>
          <span className="text-white/60">Negative</span>
        </div>
      </div>
    </div>
  )
}
