'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { apiFetch } from '@/lib/client/api'
import BoralandHeader from '@/components/boraland/BoralandHeader'
import CommandCenter from '@/components/boraland/CommandCenter'
import InventoryGrid from '@/components/boraland/InventoryGrid'
import CollectionGrid from '@/components/boraland/CollectionGrid'
import BadgesGrid from '@/components/boraland/BadgesGrid'
import MobileNav from '@/components/boraland/MobileNav'

// Types aligned with API responses
type ItemCard = {
  cardId: string
  title?: string | null
  category?: string
  categoryPath?: string
  subcategory?: string | null
  subcategoryPath?: string | null
  imageUrl?: string
  thumbUrl?: string
  sourceUrl?: string
  pageUrl?: string
}
type ItemSource = { type?: string }
type Item = {
  id: string
  acquiredAt: string
  card: ItemCard
  source?: ItemSource
}
type ApiItem = Omit<Item, 'card'> & { card: ItemCard | null }

type CatalogNode = {
  key: string
  label: string
  path: string[]
  total: number
  collected: number
  children: CatalogNode[]
}

type CatalogResponse = {
  totalCards: number
  collectedCards: number
  categories: CatalogNode[]
}

type CollectionCard = {
  cardId: string
  title: string | null
  category: string
  categoryPath?: string
  subcategory: string | null
  subcategoryPath?: string | null
  imageUrl: string
  thumbUrl?: string
  sourceUrl?: string
  pageUrl?: string
  owned: boolean
}

type CollectionGroup = {
  key: string
  label: string
  total: number
  collected: number
  cards: CollectionCard[]
}

type CollectionResponse = {
  totalCards: number
  collectedCards: number
  groups: CollectionGroup[]
}

type BadgeItem = {
  id: string
  badge: {
    code: string
    name: string
    description: string
    icon: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    type: 'streak' | 'achievement' | 'event' | 'quest' | 'completion'
    criteria?: {
      streakDays?: number
      streakWeeks?: number
      questPeriod?: 'daily' | 'weekly'
      questType?: 'streaming' | 'quiz' | 'any'
      threshold?: number
    }
  }
  earnedAt: string
  metadata?: {
    streakCount?: number
    questCode?: string
    cyclePosition?: number
    milestoneNumber?: number
    completionDate?: string
    completionStreakCount?: number
    completionType?: 'daily' | 'weekly'
    masteryKind?: 'member' | 'era'
    masteryKey?: string
    masteryLevel?: number
    masteryVariant?: 'milestone' | 'special'
  }
}

const hasCard = (item: ApiItem): item is Item => Boolean(item.card)

export default function Page() {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const searchParams = useSearchParams()

  // Tab State for Header
  const [activeTab, setActiveTab] = useState<
    'home' | 'fangate' | 'armybattles' | 'leaderboard' | 'borarush'
  >('home')

  // View State (Cards or Badges)
  const viewParam = searchParams.get('view')
  const [view, setView] = useState<'cards' | 'collection' | 'badges'>(
    viewParam === 'badges'
      ? 'badges'
      : viewParam === 'collection'
        ? 'collection'
        : 'cards'
  )

  // Inventory State
  const [items, setItems] = useState<Item[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [filteredCount, setFilteredCount] = useState(0)
  const loadedOnceRef = useRef(false)
  const [, setUserXp] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [subcategoryFilter, setSubcategoryFilter] = useState<string | null>(
    null
  )
  const [sourceFilter, setSourceFilter] = useState<string | null>(null)
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'new'>(
    'all'
  )

  // Catalog State
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null)
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogError, setCatalogError] = useState<string | null>(null)

  // Collection State
  const [collectionGroups, setCollectionGroups] = useState<CollectionGroup[]>(
    []
  )
  const [collectionTotal, setCollectionTotal] = useState(0)
  const [collectionCollected, setCollectionCollected] = useState(0)
  const [collectionLoading, setCollectionLoading] = useState(false)
  const [collectionError, setCollectionError] = useState<string | null>(null)

  // Badges State
  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [badgesLoading, setBadgesLoading] = useState(false)
  const [badgesError, setBadgesError] = useState<string | null>(null)
  const [badgesTotalCount, setBadgesTotalCount] = useState(0)
  const [badgeSearchQuery, setBadgeSearchQuery] = useState('')
  const [badgeFilterMode, setBadgeFilterMode] = useState<
    'all' | 'favorites' | 'new'
  >('all')
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState<string | null>(
    null
  )
  const [badgeRarityFilter, setBadgeRarityFilter] = useState<string | null>(
    null
  )
  const [badgeTypeFilter, setBadgeTypeFilter] = useState<string | null>(null)

  // Derived Stats
  const uniqueCount = new Set(items.map(i => i.card.cardId)).size
  const categoryCount = catalog?.categories?.length || 0

  // Load Inventory Data
  const load = async (
    next?: string | null,
    opts?: {
      query?: string
      category?: string | null
      subcategory?: string | null
      source?: string | null
      mode?: 'all' | 'favorites' | 'new'
    }
  ) => {
    setLoading(true)
    setError(null)
    try {
      const query = opts?.query ?? searchQuery
      const category = opts?.category ?? categoryFilter
      const subcategory = opts?.subcategory ?? subcategoryFilter
      const source = opts?.source ?? sourceFilter
      const mode = opts?.mode ?? filterMode
      const params = new URLSearchParams()
      params.set('limit', '20')
      if (next) params.set('skip', next)
      if (query) params.set('q', query)
      if (category) params.set('category', category)
      if (subcategory) params.set('subcategory', subcategory)
      if (source) params.set('source', source)
      if (mode === 'new') params.set('newOnly', '1')
      const res = await apiFetch(`/api/game/inventory?${params.toString()}`)

      const sanitized =
        (res.items as ApiItem[] | undefined)?.filter(hasCard) ?? []

      setItems(prev => {
        if (!next) {
          return sanitized
        }
        const map = new Map(prev.map(i => [i.id, i]))
        for (const it of sanitized) map.set(it.id, it)
        return Array.from(map.values())
      })

      setCursor(res.nextCursor || null)
      setFilteredCount(res.total || 0)
    } catch (e: any) {
      setError(e?.message || 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  // Load Badges Data
  const loadBadges = async () => {
    setBadgesLoading(true)
    setBadgesError(null)
    try {
      const res = await apiFetch('/api/game/badges')
      setBadges(res.badges || [])
      setBadgesTotalCount(res.badges?.length || 0)
    } catch (e: any) {
      setBadgesError(e?.message || 'Failed to load badges')
    } finally {
      setBadgesLoading(false)
    }
  }

  // Load User XP for Header
  const loadUserStats = async () => {
    try {
      const state = await apiFetch('/api/game/state')
      setUserXp(state?.totalXp || 0)

      // Get total count separately to keep overall totals stable
      const inventoryRes = await apiFetch('/api/game/inventory?limit=1')
      setTotalCount(inventoryRes?.total || 0)
    } catch (e) {}
  }

  const loadCatalog = async () => {
    setCatalogLoading(true)
    setCatalogError(null)
    try {
      const res = await apiFetch('/api/game/photocards/catalog')
      setCatalog(res)
    } catch (e: any) {
      setCatalogError(e?.message || 'Failed to load catalog')
    } finally {
      setCatalogLoading(false)
    }
  }

  const loadCollection = async () => {
    if (!categoryFilter) {
      setCollectionGroups([])
      setCollectionTotal(0)
      setCollectionCollected(0)
      setCollectionError(null)
      setCollectionLoading(false)
      return
    }
    setCollectionLoading(true)
    setCollectionError(null)
    try {
      const params = new URLSearchParams()
      params.set('category', categoryFilter)
      if (subcategoryFilter) params.set('subcategory', subcategoryFilter)
      if (searchQuery) params.set('q', searchQuery)
      const res = await apiFetch(
        `/api/game/photocards/collection?${params.toString()}`
      )
      const data = res as CollectionResponse
      setCollectionGroups(data.groups || [])
      setCollectionTotal(data.totalCards || 0)
      setCollectionCollected(data.collectedCards || 0)
    } catch (e: any) {
      setCollectionError(e?.message || 'Failed to load collection')
    } finally {
      setCollectionLoading(false)
    }
  }

  useEffect(() => {
    if (user === null) {
      showToast('warning', 'Sign in to access your inventory')
      router.push('/boraland')
      return
    }

    if (user && !loadedOnceRef.current) {
      loadedOnceRef.current = true
      loadBadges()
      loadUserStats()
      loadCatalog()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && view === 'badges') {
        loadBadges()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user, router, showToast, view])

  useEffect(() => {
    if (!user || !loadedOnceRef.current) return
    const timer = setTimeout(
      () => {
        if (view === 'cards') {
          load(null, {
            query: searchQuery,
            category: categoryFilter,
            subcategory: subcategoryFilter,
            source: sourceFilter,
            mode: filterMode,
          })
        } else if (view === 'collection') {
          loadCollection()
        } else if (view === 'badges') {
          loadBadges()
        }
      },
      searchQuery ? 300 : 0
    )
    return () => clearTimeout(timer)
  }, [
    user,
    view,
    searchQuery,
    categoryFilter,
    subcategoryFilter,
    sourceFilter,
    filterMode,
  ])

  if (!user) return null

  return (
    <div className="h-[100dvh] bg-background-deep text-gray-200 flex flex-col overflow-hidden relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05]"></div>
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-bora-primary/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-cyan/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
      </div>

      <BoralandHeader
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab)
          if (tab === 'home') router.push('/boraland')
          else if (tab === 'fangate') router.push('/boraland')
          else if (tab === 'armybattles') router.push('/boraland')
          else if (tab === 'borarush') router.push('/boraland?tab=borarush')
        }}
      />

      <main className="flex-grow z-10 p-3 md:p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden pb-20 lg:pb-0">
        <div className="hidden lg:block w-64 shrink-0">
          <CommandCenter />
        </div>

        <div className="flex-grow flex flex-col gap-3 md:gap-4 overflow-hidden">
          {/* View Toggle */}
          <div className="flex items-center gap-1 md:gap-2 bora-glass-panel rounded-lg md:rounded-xl p-0.5 md:p-1 w-fit shrink-0">
            <button
              onClick={() => setView('cards')}
              className={`px-3 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all ${
                view === 'cards'
                  ? 'bg-bora-primary text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1 md:gap-2">
                <span className="material-symbols-outlined text-sm md:text-base">
                  style
                </span>
                <span className="hidden sm:inline">Photocards</span>
                <span className="sm:hidden">Cards</span>
              </span>
            </button>
            <button
              onClick={() => setView('collection')}
              className={`px-3 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all ${
                view === 'collection'
                  ? 'bg-bora-primary text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1 md:gap-2">
                <span className="material-symbols-outlined text-sm md:text-base">
                  collections_bookmark
                </span>
                <span className="hidden sm:inline">Collection</span>
                <span className="sm:hidden">Collection</span>
              </span>
            </button>
            <button
              onClick={() => setView('badges')}
              className={`px-3 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all ${
                view === 'badges'
                  ? 'bg-bora-primary text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1 md:gap-2">
                <span className="material-symbols-outlined text-sm md:text-base">
                  military_tech
                </span>
                Badges
              </span>
            </button>
          </div>

          {/* Conditional Rendering */}
          {view === 'cards' ? (
            <InventoryGrid
              items={items}
              loading={loading}
              error={error}
              cursor={cursor}
              loadMore={load}
              totalCount={totalCount || items.length}
              filteredCount={filteredCount || 0}
              uniqueCount={uniqueCount}
              categoryCount={categoryCount}
              catalog={catalog}
              catalogLoading={catalogLoading}
              catalogError={catalogError}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterMode={filterMode}
              onFilterModeChange={setFilterMode}
              selectedCategory={categoryFilter}
              selectedSubcategory={subcategoryFilter}
              sourceFilter={sourceFilter}
              onSelectSource={setSourceFilter}
              onSelectCategory={value => {
                setCategoryFilter(value)
                setSubcategoryFilter(null)
              }}
              onSelectSubcategory={(value, category) => {
                if (category) setCategoryFilter(category)
                setSubcategoryFilter(value)
              }}
            />
          ) : view === 'collection' ? (
            <CollectionGrid
              groups={collectionGroups}
              totalCards={collectionTotal}
              collectedCards={collectionCollected}
              loading={collectionLoading}
              error={collectionError}
              catalog={catalog}
              catalogLoading={catalogLoading}
              catalogError={catalogError}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={categoryFilter}
              selectedSubcategory={subcategoryFilter}
              onSelectCategory={value => {
                setCategoryFilter(value)
                setSubcategoryFilter(null)
              }}
              onSelectSubcategory={(value, category) => {
                if (category) setCategoryFilter(category)
                setSubcategoryFilter(value)
              }}
            />
          ) : (
            <BadgesGrid
              badges={badges}
              loading={badgesLoading}
              error={badgesError}
              totalCount={badgesTotalCount}
              searchQuery={badgeSearchQuery}
              onSearchChange={setBadgeSearchQuery}
              filterMode={badgeFilterMode}
              onFilterModeChange={setBadgeFilterMode}
              categoryFilter={badgeCategoryFilter}
              onCategoryFilterChange={setBadgeCategoryFilter}
              rarityFilter={badgeRarityFilter}
              onRarityFilterChange={setBadgeRarityFilter}
              typeFilter={badgeTypeFilter}
              onTypeFilterChange={setBadgeTypeFilter}
            />
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
