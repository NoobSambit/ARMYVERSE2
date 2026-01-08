'use client'

import { getBadgeImagePath, getBadgeRarityColors, getBadgeCategory } from '@/lib/utils/badgeImages'
import Image from 'next/image'

type BadgeItem = {
  id: string
  badge: {
    code: string
    name: string
    description: string
    icon: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    type: string
  }
  earnedAt: string
  metadata?: {
    streakCount?: number
    milestoneNumber?: number
  }
}

type BadgesGridProps = {
  badges: BadgeItem[]
  loading: boolean
  error: string | null
  totalCount: number
}

export default function BadgesGrid({ badges, loading, error, totalCount }: BadgesGridProps) {
  // Group badges by category
  const groupedBadges = badges.reduce((acc, badge) => {
    const category = getBadgeCategory(badge.badge.code)
    if (!acc[category]) acc[category] = []
    acc[category].push(badge)
    return acc
  }, {} as Record<string, BadgeItem[]>)

  const categories = ['Daily Streak', 'Daily Milestone', 'Weekly Streak', 'Weekly Milestone', 'Daily Completion', 'Weekly Completion']

  return (
    <section className="flex-grow flex flex-col gap-6 overflow-hidden h-full">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bora-glass-panel p-5 rounded-2xl border-l-4 border-l-yellow-500 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Badges</p>
            <h3 className="text-3xl font-display font-bold text-white">
              {totalCount} <span className="text-base text-gray-500 font-normal">earned</span>
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400">
            <span className="material-symbols-outlined text-2xl">military_tech</span>
          </div>
        </div>

        <div className="bora-glass-panel p-5 rounded-2xl border-l-4 border-l-purple-500 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Legendary Badges</p>
            <h3 className="text-3xl font-display font-bold text-white">
              {badges.filter(b => b.badge.rarity === 'legendary').length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
            <span className="material-symbols-outlined text-2xl">workspace_premium</span>
          </div>
        </div>

        <div className="bora-glass-panel p-5 rounded-2xl border-l-4 border-l-blue-500 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Recent Badge</p>
            <h3 className="text-sm font-display font-bold text-white truncate">
              {badges.length > 0 ? badges[0].badge.name : 'None'}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
            <span className="material-symbols-outlined text-2xl">new_releases</span>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="overflow-y-auto pr-2 pb-4 scrollbar-thin flex-grow">
        {error && <div className="mb-4 text-rose-300 text-center">{error}</div>}

        {categories.map(category => {
          const categoryBadges = groupedBadges[category] || []
          if (categoryBadges.length === 0) return null

          return (
            <div key={category} className="mb-8">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-400">grade</span>
                {category}
                <span className="text-xs text-gray-500 font-normal">({categoryBadges.length})</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {categoryBadges.map((item) => {
                  const colors = getBadgeRarityColors(item.badge.rarity)
                  const imagePath = getBadgeImagePath(item.badge.code)

                  return (
                    <div
                      key={item.id}
                      className={`group relative rounded-2xl overflow-hidden bora-glass-panel border ${colors.border} hover:border-bora-primary/50 transition-all duration-300 hover:-translate-y-1 ${colors.glow} p-4 flex flex-col items-center gap-3`}
                    >
                      {/* Badge Image */}
                      <div className={`relative w-20 h-20 rounded-full ${colors.bg} p-2 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Image
                          src={imagePath}
                          alt={item.badge.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            // Fallback to emoji icon if image fails to load
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = `<span class="text-3xl">${item.badge.icon}</span>`
                            }
                          }}
                        />
                      </div>

                      {/* Badge Info */}
                      <div className="text-center">
                        <h4 className={`font-bold text-xs ${colors.text} mb-1 leading-tight`}>
                          {item.badge.name}
                        </h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                          {item.badge.rarity}
                        </p>
                      </div>

                      {/* Metadata */}
                      {item.metadata?.streakCount && (
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] text-white font-bold">
                          Day {item.metadata.streakCount}
                        </div>
                      )}

                      {/* Earned Date on Hover */}
                      <div className="absolute inset-0 bg-black/90 opacity-100 transition-opacity flex items-center justify-center p-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-300 mb-1">{item.badge.description}</p>
                          <p className="text-[10px] text-gray-500">
                            Earned {new Date(item.earnedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={`skel-${i}`} className="rounded-xl border border-white/5 bg-white/5 aspect-square animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && badges.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">military_tech</span>
            <p>No badges earned yet. Complete quests to earn badges!</p>
          </div>
        )}
      </div>
    </section>
  )
}
