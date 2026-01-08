'use client'

import { useEffect, useState } from 'react'
import { VerifiedUser, ChevronLeft, ChevronRight } from '@/lib/utils/icons'

interface AuthorData {
  _id: string
  profile: {
    displayName: string
    avatarUrl?: string
    bio?: string
  }
  stats: {
    blogCount: number
  }
  isOnline?: boolean
}

export default function AuthorSpotlight() {
  const [authors, setAuthors] = useState<AuthorData[]>([])
  const [loading, setLoading] = useState(true)
  const [scrollIndex, setScrollIndex] = useState(0)

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await fetch('/api/users/top-writers?limit=10')
        if (res.ok) {
          const data = await res.json()
          setAuthors(data.users || [])
        }
      } catch (error) {
        console.error('Failed to fetch authors:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAuthors()
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setScrollIndex(prev => Math.max(0, prev - 1))
    } else {
      setScrollIndex(prev => Math.min(authors.length - 3, prev + 1))
    }
  }

  // Generate random activity bars for visual appeal
  const generateActivityBars = () => {
    return [40, 70, 100, 50].map(h => ({
      height: `${h}%`,
      opacity: h === 100 ? 1 : h === 70 ? 0.6 : h === 50 ? 0.4 : 0.3
    }))
  }

  // Always show container, even when loading or empty
  return (
    <div className="mb-6 md:mb-12">
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h3 className="text-white font-bold text-base md:text-lg flex items-center gap-2">
          <VerifiedUser className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          Top Voices this Week
        </h3>
        <div className="flex gap-1.5 md:gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={scrollIndex === 0}
            className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={scrollIndex >= authors.length - 3}
            className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-3 md:pb-4 scrollbar-hide snap-x">
        {loading ? (
          // Skeleton loaders
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="snap-start flex-shrink-0 w-56 md:w-64 glass-panel rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4 animate-pulse"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="h-3 md:h-4 bg-white/10 rounded w-20 md:w-24 mb-1.5 md:mb-2" />
                <div className="h-2.5 md:h-3 bg-white/10 rounded w-14 md:w-16" />
              </div>
              <div className="h-6 md:h-8 w-10 md:w-12 flex items-end gap-0.5 flex-shrink-0">
                <div className="w-1 bg-white/20 h-[40%] rounded-t-sm" />
                <div className="w-1 bg-white/20 h-[70%] rounded-t-sm" />
                <div className="w-1 bg-white/20 h-[100%] rounded-t-sm" />
                <div className="w-1 bg-white/20 h-[50%] rounded-t-sm" />
              </div>
            </div>
          ))
        ) : authors.length === 0 ? (
          // Empty state - show placeholder cards
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="snap-start flex-shrink-0 w-56 md:w-64 glass-panel rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4 opacity-40"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="h-3 md:h-4 bg-white/10 rounded w-20 md:w-24 mb-1.5 md:mb-2" />
                <div className="h-2.5 md:h-3 bg-white/10 rounded w-14 md:w-16" />
              </div>
              <div className="h-6 md:h-8 w-10 md:w-12 flex items-end gap-0.5 flex-shrink-0">
                <div className="w-1 bg-white/20 h-[40%] rounded-t-sm" />
                <div className="w-1 bg-white/20 h-[70%] rounded-t-sm" />
                <div className="w-1 bg-white/20 h-[100%] rounded-t-sm" />
                <div className="w-1 bg-white/20 h-[50%] rounded-t-sm" />
              </div>
            </div>
          ))
        ) : (
          // Actual authors
          authors.map((author) => {
            const activityBars = generateActivityBars()
            return (
              <div
                key={author._id}
                className="snap-start flex-shrink-0 w-56 md:w-64 glass-panel rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="relative flex-shrink-0">
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-cover"
                    style={{
                      backgroundImage: author.profile.avatarUrl
                        ? `url(${author.profile.avatarUrl})`
                        : 'linear-gradient(135deg, #9054f8 0%, #f854a8 100%)'
                    }}
                  />
                  {author.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-background-dark" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-xs md:text-sm group-hover:text-primary transition-colors truncate">
                    {author.profile.displayName}
                  </h4>
                  <p className="text-white/40 text-[10px] md:text-xs">
                    {author.stats.blogCount} articles posted
                  </p>
                </div>
                <div className="h-6 md:h-8 w-10 md:w-12 flex items-end gap-0.5 flex-shrink-0">
                  {activityBars.map((bar, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary rounded-t-sm transition-all"
                      style={{ height: bar.height, opacity: bar.opacity }}
                    />
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
