'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { Search, Tune, GridView, ListView, ExpandMore } from '@/lib/utils/icons'
import { useBlogFilters } from '@/hooks/useBlogFilters'

interface TrendingTopicsProps {
  filters: ReturnType<typeof useBlogFilters>
  allTags: string[]
}

export default function TrendingTopics({ filters, allTags }: TrendingTopicsProps) {
  const { state, set } = filters
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
  const [localSearch, setLocalSearch] = useState(state.q)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Use actual tags from blogs - show empty placeholders if none
  const trendingTopics = useMemo(() => {
    if (allTags.length > 0) {
      return allTags.slice(0, 6)
    }
    return [] // No dummy data
  }, [allTags])

  const handleTopicClick = (topic: string) => {
    const newSelected = new Set(selectedTopics)
    if (newSelected.has(topic)) {
      newSelected.delete(topic)
    } else {
      newSelected.add(topic)
    }
    setSelectedTopics(newSelected)
    set({ tags: Array.from(newSelected) })
  }

  // Debounced search to prevent page jumping
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearch(value)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Debounce the actual filter update
    searchTimeoutRef.current = setTimeout(() => {
      set({ q: value })
    }, 500)
  }, [set])

  // Sync local search with state when it changes externally
  useEffect(() => {
    setLocalSearch(state.q)
  }, [state.q])

  // Sync selected topics with state
  useEffect(() => {
    setSelectedTopics(new Set(state.tags))
  }, [state.tags])

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8 items-start w-full relative">
      {/* Trending Cloud */}
      <div className="flex-1 w-full">
        <div className="flex items-center gap-2 mb-2 md:mb-3">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-accent-pink animate-pulse-slow" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
          </svg>
          <h3 className="text-white font-bold uppercase text-xs md:text-sm tracking-wider">
            {trendingTopics.length > 0 ? 'Trending Topics' : 'Topics'}
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {trendingTopics.length > 0 ? (
            trendingTopics.map((topic) => {
              const isSelected = selectedTopics.has(topic)
              return (
                <button
                  key={topic}
                  onClick={() => handleTopicClick(topic)}
                  className={`px-2.5 md:px-4 py-1.5 md:py-2 rounded-full border text-xs md:text-sm font-medium transition-all hover:scale-105 active:scale-95 ${
                    isSelected
                      ? 'border-primary bg-primary/20 text-white'
                      : 'border-white/10 bg-white/5 text-white hover:bg-primary hover:border-primary'
                  }`}
                >
                  #{topic}
                </button>
              )
            })
          ) : (
            // Empty state placeholders
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="px-2.5 md:px-4 py-1.5 md:py-2 rounded-full border border-white/5 bg-white/5 text-white/30 text-xs md:text-sm font-medium"
              >
                #
              </div>
            ))
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="w-full lg:w-auto flex flex-col gap-2 md:gap-3 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={localSearch}
            onChange={handleSearchChange}
            className="w-full sm:w-auto lg:w-64 bg-[#1a1a2e] border border-white/20 rounded-full py-2 md:py-2.5 pl-9 md:pl-10 pr-4 text-gray-100 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-gray-500"
          />
        </div>
        <div className="flex gap-1.5 md:gap-2">
          {/* Sort dropdown - works with filters */}
          <div className="relative">
            <select
              value={state.sort}
              onChange={(e) => set({ sort: e.target.value as any })}
              className="appearance-none bg-[#1a1a2e] border border-white/20 rounded-full py-2 md:py-2.5 pl-3 md:pl-4 pr-8 md:pr-10 text-gray-100 text-sm focus:outline-none focus:border-primary cursor-pointer w-full sm:w-auto"
            >
              <option value="newest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="trending7d">Most Read</option>
              <option value="mostReacted">Highest Rated</option>
            </select>
            <ExpandMore className="absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-white/40 pointer-events-none" />
          </div>

          {/* Filter toggle button */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`w-9 h-9 md:w-10 md:h-10 rounded-full border flex items-center justify-center transition-colors ${
              showFilterPanel || state.moods.length > 0
                ? 'bg-primary border-primary text-white'
                : 'bg-[#1a1a2e] border-white/20 text-gray-400 hover:text-white hover:border-primary/50'
            }`}
            title="Toggle filters"
          >
            <Tune className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* View mode toggle - actually updates the view */}
          <div className="bg-[#1a1a2e] border border-white/20 rounded-full p-1 flex items-center">
            <button
              onClick={() => set({ view: 'grid' as const })}
              className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-colors ${
                state.view === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Grid view"
            >
              <GridView className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <button
              onClick={() => set({ view: 'list' as const })}
              className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-colors ${
                state.view === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="List view"
            >
              <ListView className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
        </div>

        {/* Expandable filter panel */}
        {showFilterPanel && (
          <div className="absolute top-full right-0 mt-2 w-56 md:w-64 glass-panel rounded-xl md:rounded-2xl p-3 md:p-4 z-50">
            <h4 className="text-white font-bold text-xs md:text-sm mb-2 md:mb-3">Filter by Mood</h4>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {['emotional', 'fun', 'hype', 'chill', 'romantic', 'energetic'].map((mood) => (
                <button
                  key={mood}
                  onClick={() => {
                    const newMoods = state.moods.includes(mood)
                      ? state.moods.filter(m => m !== mood)
                      : [...state.moods, mood]
                    set({ moods: newMoods })
                  }}
                  className={`px-2 md:px-3 py-1 md:py-1 rounded-full text-[10px] md:text-xs font-medium capitalize transition-colors ${
                    state.moods.includes(mood)
                      ? 'bg-primary text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
            {state.moods.length > 0 && (
              <button
                onClick={() => set({ moods: [] })}
                className="mt-2 md:mt-3 text-[10px] md:text-xs text-primary hover:text-white transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
