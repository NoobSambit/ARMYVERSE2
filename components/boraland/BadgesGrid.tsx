'use client'

import {
  getBadgeImagePath,
  getBadgeRarityColors,
  getBadgeCategory,
} from '@/lib/utils/badgeImages'
import Image from 'next/image'
import StreakBadgeWithOverlay from './StreakBadgeWithOverlay'
import BadgeModal from './BadgeModal'
import { useEffect, useState, useMemo } from 'react'

const FAVORITES_STORAGE_KEY = 'boraland:badges:favorites'

type BadgeItem = {
  id: string
  badge: {
    code: string
    name: string
    description: string
    icon: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    type: 'streak' | 'achievement' | 'event' | 'quest' | 'completion'
  }
  earnedAt: string
  metadata?: {
    streakCount?: number
    milestoneNumber?: number
    completionDate?: string
    completionStreakCount?: number
    completionType?: 'daily' | 'weekly'
  }
}

type BadgesGridProps = {
  badges: BadgeItem[]
  loading: boolean
  error: string | null
  totalCount: number
  searchQuery: string
  onSearchChange: (value: string) => void
  filterMode: 'all' | 'favorites' | 'new'
  onFilterModeChange: (value: 'all' | 'favorites' | 'new') => void
  categoryFilter: string | null
  onCategoryFilterChange: (value: string | null) => void
  rarityFilter: string | null
  onRarityFilterChange: (value: string | null) => void
  typeFilter: string | null
  onTypeFilterChange: (value: string | null) => void
}

const CATEGORY_OPTIONS = [
  'Daily Streak',
  'Daily Milestone',
  'Weekly Streak',
  'Weekly Milestone',
  'Daily Completion',
  'Weekly Completion',
  'Member Mastery',
  'Era Mastery',
  'Quest Badges',
  'Event Badges',
  'Special Achievements',
] as const

const RARITY_OPTIONS = ['legendary', 'epic', 'rare', 'common'] as const

const TYPE_OPTIONS = [
  'streak',
  'achievement',
  'event',
  'quest',
  'completion',
] as const

const TYPE_LABELS: Record<string, string> = {
  streak: 'Streak',
  achievement: 'Achievement',
  event: 'Event',
  quest: 'Quest',
  completion: 'Completion',
}

export default function BadgesGrid({
  badges,
  loading,
  error,
  totalCount,
  searchQuery,
  onSearchChange,
  filterMode,
  onFilterModeChange,
  categoryFilter,
  onCategoryFilterChange,
  rarityFilter,
  onRarityFilterChange,
  typeFilter,
  onTypeFilterChange,
}: BadgesGridProps) {
  const [openDropdown, setOpenDropdown] = useState<
    'category' | 'rarity' | 'type' | null
  >(null)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [activeBadge, setActiveBadge] = useState<BadgeItem | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({})

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
      if (!stored) return
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        const ids = parsed.filter(value => typeof value === 'string')
        setFavoriteIds(new Set(ids))
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!activeBadge) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveBadge(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeBadge])

  const toggleFavorite = (badgeId: string) => {
    setFavoriteIds(prev => {
      const next = new Set(prev)
      if (next.has(badgeId)) {
        next.delete(badgeId)
      } else {
        next.add(badgeId)
      }
      try {
        localStorage.setItem(
          FAVORITES_STORAGE_KEY,
          JSON.stringify(Array.from(next))
        )
      } catch {}
      return next
    })
  }

  const toggleDropdown = (key: 'category' | 'rarity' | 'type') => {
    setOpenDropdown(prev => (prev === key ? null : key))
  }

  const closePanels = () => {
    setOpenDropdown(null)
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }))
  }

  const isNewBadge = (earnedAt: string) => {
    const earnedDate = new Date(earnedAt)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return earnedDate > sevenDaysAgo
  }

  const filteredBadges = useMemo(() => {
    let result = [...badges]

    if (filterMode === 'favorites') {
      result = result.filter(badge => favoriteIds.has(badge.id))
    } else if (filterMode === 'new') {
      result = result.filter(badge => isNewBadge(badge.earnedAt))
    }

    if (categoryFilter) {
      result = result.filter(
        badge => getBadgeCategory(badge.badge.code) === categoryFilter
      )
    }

    if (rarityFilter) {
      result = result.filter(badge => badge.badge.rarity === rarityFilter)
    }

    if (typeFilter) {
      result = result.filter(badge => badge.badge.type === typeFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        badge =>
          badge.badge.name.toLowerCase().includes(query) ||
          badge.badge.description.toLowerCase().includes(query)
      )
    }

    return result
  }, [
    badges,
    filterMode,
    categoryFilter,
    rarityFilter,
    typeFilter,
    searchQuery,
    favoriteIds,
  ])

  const groupedBadges = useMemo(() => {
    const groups: Record<string, BadgeItem[]> = {}
    filteredBadges.forEach(badge => {
      const category = getBadgeCategory(badge.badge.code)
      if (!groups[category]) groups[category] = []
      groups[category].push(badge)
    })
    return groups
  }, [filteredBadges])

  const legendCount = badges.filter(b => b.badge.rarity === 'legendary').length
  const epicCount = badges.filter(b => b.badge.rarity === 'epic').length
  const rareCount = badges.filter(b => b.badge.rarity === 'rare').length
  const currentStreak = useMemo(() => {
    const completionBadge = badges.find(
      b =>
        b.badge.code.includes('completion') && b.metadata?.completionStreakCount
    )
    return completionBadge?.metadata?.completionStreakCount || 0
  }, [badges])

  const activeFilters = [
    filterMode === 'favorites'
      ? { key: 'mode', label: 'Mode', value: 'Favorites' }
      : null,
    filterMode === 'new'
      ? { key: 'mode', label: 'Mode', value: 'New (7 days)' }
      : null,
    categoryFilter
      ? { key: 'category', label: 'Category', value: categoryFilter }
      : null,
    rarityFilter
      ? { key: 'rarity', label: 'Rarity', value: rarityFilter.toUpperCase() }
      : null,
    typeFilter
      ? {
          key: 'type',
          label: 'Type',
          value: TYPE_LABELS[typeFilter] || typeFilter,
        }
      : null,
    searchQuery ? { key: 'search', label: 'Search', value: searchQuery } : null,
  ].filter(Boolean) as Array<{ key: string; label: string; value: string }>

  const modeButtonClass = (active: boolean) =>
    `px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
      active
        ? 'bg-bora-primary text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
    }`

  const dropdownButtonClass = (active: boolean) =>
    `flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm whitespace-nowrap border ${
      active
        ? 'bg-bora-primary/20 text-white border-bora-primary/40'
        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
    }`

  return (
    <section className="flex-grow flex flex-col gap-4 md:gap-6 overflow-hidden h-full">
      {activeBadge && (
        <BadgeModal badge={activeBadge} onClose={() => setActiveBadge(null)} />
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 shrink-0">
        <div className="bora-glass-panel p-3 md:p-5 rounded-2xl border-l-2 md:border-l-4 border-l-yellow-500 flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2">
          <div>
            <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-0.5 md:mb-1">
              Total Badges
            </p>
            <h3 className="text-xl md:text-3xl font-display font-bold text-white">
              {totalCount}{' '}
              <span className="text-xs md:text-base text-gray-500 font-normal hidden md:inline">
                earned
              </span>
            </h3>
          </div>
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400 hidden md:flex">
            <span className="material-symbols-outlined text-xl md:text-2xl">
              military_tech
            </span>
          </div>
        </div>

        <div className="bora-glass-panel p-3 md:p-5 rounded-2xl border-l-2 md:border-l-4 border-l-purple-500 flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2">
          <div>
            <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-0.5 md:mb-1">
              Legendary
            </p>
            <h3 className="text-xl md:text-3xl font-display font-bold text-white">
              {legendCount}
            </h3>
          </div>
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 hidden md:flex">
            <span className="material-symbols-outlined text-xl md:text-2xl">
              workspace_premium
            </span>
          </div>
        </div>

        <div className="bora-glass-panel p-3 md:p-5 rounded-2xl border-l-2 md:border-l-4 border-l-blue-500 flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2">
          <div>
            <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-0.5 md:mb-1">
              Rare & Epic
            </p>
            <h3 className="text-xl md:text-3xl font-display font-bold text-white">
              {rareCount} <span className="text-gray-500 mx-1">·</span>{' '}
              {epicCount}
            </h3>
          </div>
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 hidden md:flex">
            <span className="material-symbols-outlined text-xl md:text-2xl">
              auto_awesome
            </span>
          </div>
        </div>

        <div className="bora-glass-panel p-3 md:p-5 rounded-2xl border-l-2 md:border-l-4 border-l-cyan-500 flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2">
          <div>
            <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-0.5 md:mb-1">
              Current Streak
            </p>
            <h3 className="text-xl md:text-3xl font-display font-bold text-white">
              {currentStreak}{' '}
              <span className="text-xs md:text-base text-gray-500 font-normal hidden md:inline">
                days
              </span>
            </h3>
          </div>
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 hidden md:flex">
            <span className="material-symbols-outlined text-xl md:text-2xl">
              trending_up
            </span>
          </div>
        </div>
      </div>

      <div className="bora-glass-panel rounded-xl p-2 md:p-3 flex flex-col gap-3 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => {
              onFilterModeChange('all')
              onSearchChange('')
              onCategoryFilterChange(null)
              onRarityFilterChange(null)
              onTypeFilterChange(null)
              closePanels()
            }}
            className={modeButtonClass(filterMode === 'all')}
          >
            All
          </button>
          <button
            onClick={() => {
              onFilterModeChange(
                filterMode === 'favorites' ? 'all' : 'favorites'
              )
              closePanels()
            }}
            className={modeButtonClass(filterMode === 'favorites')}
          >
            Favorites
          </button>
          <button
            onClick={() => {
              onFilterModeChange(filterMode === 'new' ? 'all' : 'new')
              closePanels()
            }}
            className={`${modeButtonClass(filterMode === 'new')} hidden md:inline-flex`}
          >
            New
          </button>
          <div className="h-6 w-px bg-white/10 mx-1 hidden lg:block"></div>
          <div className="relative">
            <button
              onClick={() => toggleDropdown('category')}
              aria-expanded={openDropdown === 'category'}
              className={dropdownButtonClass(openDropdown === 'category')}
            >
              <span>{categoryFilter || 'Category'}</span>
              <span className="material-symbols-outlined text-xs md:text-sm">
                expand_more
              </span>
            </button>
          </div>
          <div className="relative">
            <button
              onClick={() => toggleDropdown('rarity')}
              aria-expanded={openDropdown === 'rarity'}
              className={dropdownButtonClass(openDropdown === 'rarity')}
            >
              <span>
                {rarityFilter ? rarityFilter.toUpperCase() : 'Rarity'}
              </span>
              <span className="material-symbols-outlined text-xs md:text-sm">
                expand_more
              </span>
            </button>
          </div>
          <div className="relative">
            <button
              onClick={() => toggleDropdown('type')}
              aria-expanded={openDropdown === 'type'}
              className={dropdownButtonClass(openDropdown === 'type')}
            >
              <span>
                {typeFilter ? TYPE_LABELS[typeFilter] || typeFilter : 'Type'}
              </span>
              <span className="material-symbols-outlined text-xs md:text-sm">
                expand_more
              </span>
            </button>
          </div>
        </div>

        {openDropdown && (
          <div className="rounded-xl border border-white/10 bg-black/30 p-3 md:p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-sm md:text-base font-semibold text-white">
                  {openDropdown === 'category' && 'Categories'}
                  {openDropdown === 'rarity' && 'Badge Rarity'}
                  {openDropdown === 'type' && 'Badge Type'}
                </h4>
                <p className="text-[10px] md:text-xs text-gray-500">
                  {openDropdown === 'category' && 'Filter by badge category'}
                  {openDropdown === 'rarity' && 'Filter by badge rarity level'}
                  {openDropdown === 'type' && 'Filter by badge type'}
                </p>
              </div>
              <button
                onClick={closePanels}
                className="text-[10px] md:text-xs text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin">
              {openDropdown === 'category' && (
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onCategoryFilterChange(null)
                      closePanels()
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 rounded-lg"
                  >
                    All categories
                  </button>
                  {CATEGORY_OPTIONS.map(category => {
                    const count = badges.filter(
                      b => getBadgeCategory(b.badge.code) === category
                    ).length
                    return (
                      <button
                        key={category}
                        onClick={() => {
                          onCategoryFilterChange(category)
                          closePanels()
                        }}
                        className={`w-full px-3 py-2 text-left text-xs hover:bg-white/10 rounded-lg ${
                          categoryFilter === category
                            ? 'bg-bora-primary/15 text-white'
                            : 'text-gray-200'
                        }`}
                        disabled={count === 0}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{category}</span>
                          <span className="text-[10px] text-gray-400">
                            {count}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {openDropdown === 'rarity' && (
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onRarityFilterChange(null)
                      closePanels()
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 rounded-lg"
                  >
                    All rarities
                  </button>
                  {RARITY_OPTIONS.map(rarity => {
                    const colors = getBadgeRarityColors(rarity)
                    const count = badges.filter(
                      b => b.badge.rarity === rarity
                    ).length
                    return (
                      <button
                        key={rarity}
                        onClick={() => {
                          onRarityFilterChange(rarity)
                          closePanels()
                        }}
                        className={`w-full px-3 py-2 text-left text-xs hover:bg-white/10 rounded-lg ${
                          rarityFilter === rarity
                            ? 'bg-bora-primary/15 text-white'
                            : 'text-gray-200'
                        }`}
                        disabled={count === 0}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`capitalize ${colors.text} font-medium`}
                          >
                            {rarity}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {count}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {openDropdown === 'type' && (
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onTypeFilterChange(null)
                      closePanels()
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 rounded-lg"
                  >
                    All types
                  </button>
                  {TYPE_OPTIONS.map(type => {
                    const count = badges.filter(
                      b => b.badge.type === type
                    ).length
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          onTypeFilterChange(type)
                          closePanels()
                        }}
                        className={`w-full px-3 py-2 text-left text-xs hover:bg-white/10 rounded-lg ${
                          typeFilter === type
                            ? 'bg-bora-primary/15 text-white'
                            : 'text-gray-200'
                        }`}
                        disabled={count === 0}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">
                            {TYPE_LABELS[type] || type}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {count}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base md:text-lg">
              search
            </span>
            <input
              value={searchQuery}
              onChange={event => onSearchChange(event.target.value)}
              className="bg-black/30 border border-white/10 text-white text-xs md:text-sm rounded-xl pl-8 md:pl-9 pr-3 md:pr-4 py-1.5 md:py-2 focus:ring-1 focus:ring-bora-primary focus:border-bora-primary w-full placeholder-gray-600"
              placeholder="Search badges..."
              type="text"
            />
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs text-gray-400">
            {activeFilters.map(filter => (
              <span
                key={filter.key}
                className="px-2 py-1 rounded-full bg-white/5 border border-white/10"
              >
                {filter.label}: {filter.value}
              </span>
            ))}
            <button
              onClick={() => {
                onFilterModeChange('all')
                onSearchChange('')
                onCategoryFilterChange(null)
                onRarityFilterChange(null)
                onTypeFilterChange(null)
                closePanels()
              }}
              className="px-2 py-1 rounded-full border border-white/10 text-gray-300 hover:text-white hover:border-white/30"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="overflow-y-auto pr-1 md:pr-2 pb-4 scrollbar-thin flex-grow">
        {error && (
          <div className="mb-4 text-rose-300 text-center text-sm">{error}</div>
        )}

        {Object.keys(groupedBadges).length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
              military_tech
            </span>
            <p>
              {filterMode === 'favorites' && 'No favorite badges yet.'}
              {filterMode === 'new' && 'No new badges in the last 7 days.'}
              {filterMode === 'all' &&
              (searchQuery || categoryFilter || rarityFilter || typeFilter)
                ? 'No badges match your filters.'
                : 'No badges earned yet. Complete quests to earn badges!'}
            </p>
          </div>
        )}

        {Object.entries(groupedBadges).map(([category, categoryBadges]) => {
          const isExpanded = expandedCategories[category] ?? false
          const categoryRarityColors =
            categoryBadges.length > 0
              ? getBadgeRarityColors(categoryBadges[0].badge.rarity)
              : getBadgeRarityColors('common')

          return (
            <div key={category} className="mb-6">
              <div
                className="flex items-center justify-between gap-3 border-b border-white/10 pb-2 mb-3 cursor-pointer group"
                onClick={() => toggleCategory(category)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-yellow-400 ${categoryRarityColors.text}`}
                  >
                    grade
                  </span>
                  <h4 className="text-base md:text-lg font-semibold text-white">
                    {category}
                  </h4>
                  <span className="text-[10px] md:text-xs text-gray-400">
                    ({categoryBadges.length})
                  </span>
                </div>
                <button
                  className={`flex items-center justify-center w-9 h-9 rounded-full border border-bora-primary/40 bg-bora-primary/10 text-bora-primary shadow-[0_0_12px_rgba(139,92,246,0.35)] hover:bg-bora-primary/20 hover:text-white transition`}
                  aria-label={
                    isExpanded ? 'Collapse category' : 'Expand category'
                  }
                >
                  <span className="material-symbols-outlined text-xl font-bold">
                    {isExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
              </div>

              {isExpanded && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                  {categoryBadges.map(item => {
                    const colors = getBadgeRarityColors(item.badge.rarity)
                    const isFavorite = favoriteIds.has(item.id)
                    const isNew = isNewBadge(item.earnedAt)

                    const isCompletionBadge =
                      item.badge.code.includes('completion')
                    const hasStreakCount = !!(
                      item.metadata?.completionStreakCount ||
                      item.metadata?.streakCount
                    )
                    const streakCount =
                      item.metadata?.completionStreakCount ||
                      item.metadata?.streakCount ||
                      0
                    const completionType =
                      item.metadata?.completionType ||
                      (item.badge.code.includes('daily') ? 'daily' : 'weekly')

                    const cyclePosition =
                      streakCount > 0 ? ((streakCount - 1) % 10) + 1 : 1
                    const imagePath =
                      isCompletionBadge && hasStreakCount
                        ? `/badges/${completionType}-streak/streak-${cyclePosition}.png`
                        : getBadgeImagePath(item.badge.code)

                    return (
                      <div
                        key={item.id}
                        className="group relative rounded-2xl overflow-hidden bora-glass-panel border border-white/5 hover:border-bora-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-bora-primary/10"
                      >
                        <div className="relative aspect-square">
                          <div
                            className={`w-20 h-20 rounded-full mx-auto mt-4 ${colors.bg} p-2 flex items-center justify-center group-hover:scale-110 transition-transform`}
                          >
                            {isCompletionBadge && hasStreakCount ? (
                              <StreakBadgeWithOverlay
                                imagePath={imagePath}
                                badgeName={item.badge.name}
                                streakCount={streakCount}
                                size="lg"
                                fallbackIcon={item.badge.icon}
                                type={completionType}
                              />
                            ) : (
                              <Image
                                src={imagePath}
                                alt={item.badge.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-contain"
                                onError={e => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  const parent = target.parentElement
                                  if (parent) {
                                    parent.innerHTML = `<span class="text-3xl">${item.badge.icon}</span>`
                                  }
                                }}
                              />
                            )}
                          </div>

                          <button
                            onClick={() => toggleFavorite(item.id)}
                            className={`absolute top-2 left-2 md:top-3 md:left-3 p-1.5 rounded-xl border backdrop-blur-sm transition-colors ${
                              isFavorite
                                ? 'bg-yellow-400/20 border-yellow-300/30 text-yellow-200'
                                : 'bg-black/40 border-white/10 text-gray-300 hover:text-white'
                            }`}
                            aria-label={
                              isFavorite
                                ? 'Remove from favorites'
                                : 'Add to favorites'
                            }
                          >
                            <span className="material-symbols-outlined text-xs md:text-sm">
                              {isFavorite ? 'star' : 'star_border'}
                            </span>
                          </button>

                          {isNew && (
                            <span className="absolute top-2 right-2 md:top-3 md:right-3 backdrop-blur-sm border text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded uppercase tracking-wider bg-green-500/20 border-green-500/30 text-green-300">
                              NEW
                            </span>
                          )}

                          <div className="absolute bottom-0 left-0 w-full p-2 md:p-4">
                            <div className="flex flex-col items-center gap-1">
                              <h4
                                className={`font-bold text-xs ${colors.text} mb-1 leading-tight text-center`}
                              >
                                {item.badge.name}
                              </h4>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                                {item.badge.rarity}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => setActiveBadge(item)}
                            className="absolute bottom-2 right-2 md:bottom-3 md:right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors backdrop-blur-md"
                            aria-label="View badge details"
                          >
                            <span className="material-symbols-outlined text-sm md:text-base">
                              open_in_full
                            </span>
                          </button>
                        </div>

                        <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                          <div className="text-center">
                            <p className="text-xs text-gray-300 mb-1">
                              {item.badge.description}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              Earned{' '}
                              {new Date(item.earnedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`skel-${i}`}
                className="rounded-xl border border-white/5 bg-white/5 aspect-square animate-pulse"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
