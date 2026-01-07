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
      <div className="bg-[#2e2249] rounded-xl p-6 border border-white/5 flex flex-col h-full min-h-[300px]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-white font-bold text-lg">Listening Activity</h3>
            <p className="text-[#a290cb] text-xs">Last 30 Days • Daily Streams</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white/40 text-sm">{loading ? 'Loading...' : 'No data available'}</div>
        </div>
      </div>
    )
  }

  // Use dailyGain for the chart to show variance
  // Find max absolute value for scaling (positive or negative)
  const maxAbsValue = Math.max(...history.map(h => Math.abs(h.dailyGain)), 1)
  const maxPositive = Math.max(...history.map(h => h.dailyGain), 0)
  const maxNegative = Math.min(...history.map(h => h.dailyGain), 0)

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

  // Calculate bar height based on dailyGain (can be positive or negative)
  const getBarHeightAndColor = (dailyGain: number) => {
    const absValue = Math.abs(dailyGain)
    const heightPercentage = Math.max(10, (absValue / maxAbsValue) * 90)
    const isPositive = dailyGain >= 0

    return {
      height: heightPercentage,
      isPositive
    }
  }

  return (
    <div className="bg-[#2e2249] rounded-xl p-6 border border-white/5 flex flex-col h-full min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-white font-bold text-lg">Listening Activity</h3>
          <p className="text-[#a290cb] text-xs">Last {history.length} Days • Daily Streams Variance</p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full flex items-center gap-2 sm:gap-3 px-2 relative">
        {/* Zero line */}
        <div className="absolute inset-0 flex items-center pointer-events-none z-0">
          <div className="w-full h-px bg-white/10" />
        </div>

        {/* Bars */}
        <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 h-full w-full relative z-10">
          {displayHistory.map((data, i) => {
            const originalIndex = history.indexOf(data)
            const { height, isPositive } = getBarHeightAndColor(data.dailyGain)
            const isHovered = hoveredIndex === originalIndex
            const isLatest = originalIndex === history.length - 1

            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-center"
                style={{ minHeight: `${height}%` }}
              >
                <div
                  className={`w-full rounded-t-sm transition-all relative group ${
                    isLatest
                      ? 'bg-[#895af6] shadow-[0_0_15px_rgba(137,90,246,0.5)]'
                      : isPositive
                        ? 'bg-green-500/60 hover:bg-green-500'
                        : 'bg-red-500/60 hover:bg-red-500'
                  }`}
                  style={{ height: `${Math.max(height, 15)}%` }}
                  onMouseEnter={() => setHoveredIndex(originalIndex)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip */}
                  <div className={`absolute -top-14 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap transition-opacity z-20 ${
                    isHovered || isLatest ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div>{formatValue(data.dailyGain)} daily</div>
                    <div className="text-[8px] font-normal text-gray-600">{formatDate(data.date)}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500/60"></div>
          <span className="text-white/60">Positive</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500/60"></div>
          <span className="text-white/60">Negative</span>
        </div>
      </div>
    </div>
  )
}
