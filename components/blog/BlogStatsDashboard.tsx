'use client'

import { useEffect, useState } from 'react'

interface BlogStats {
  posts: number
  writers: number
  avgReadTime: number
  trending: string
}

export default function BlogStatsDashboard() {
  const [stats, setStats] = useState<BlogStats>({
    posts: 14200,
    writers: 842,
    avgReadTime: 5,
    trending: '#Hope'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/blogs/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch blog stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  const statItems = [
    { label: 'Posts', value: formatNumber(stats.posts), color: 'text-white' },
    { label: 'Writers', value: formatNumber(stats.writers), color: 'text-white' },
    { label: 'Read Time', value: `${stats.avgReadTime}m`, color: 'text-white' },
    { label: 'Trending', value: stats.trending, color: 'text-primary', highlighted: true }
  ]

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-3 w-full">
      {statItems.map((item, index) => (
        <div
          key={index}
          className={`glass-panel rounded-xl md:rounded-2xl p-2 md:p-3 flex flex-col items-center justify-center min-h-[60px] md:min-h-[80px] ${
            item.highlighted ? 'border-primary/30 bg-primary/10' : ''
          }`}
        >
          <span className="text-[10px] md:text-xs text-white/50 uppercase tracking-wider font-bold">
            {item.label}
          </span>
          <span className={`text-base md:text-xl font-bold ${item.color} mt-0.5 md:mt-1`}>
            {loading ? '...' : item.value}
          </span>
        </div>
      ))}
    </div>
  )
}
