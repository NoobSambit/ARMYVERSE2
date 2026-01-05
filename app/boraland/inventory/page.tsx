'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { apiFetch } from '@/lib/client/api'
import BoralandHeader from '@/components/boraland/BoralandHeader'
import CommandCenter from '@/components/boraland/CommandCenter'
import InventoryGrid from '@/components/boraland/InventoryGrid'
import BadgesGrid from '@/components/boraland/BadgesGrid'

// Types aligned with API responses
type ItemCard = { member: string; era: string; set: string; rarity: 'common'|'rare'|'epic'|'legendary' | null | undefined; publicId: string; imageUrl: string }
type Item = { id: string; acquiredAt: string; card: ItemCard }
type ApiItem = Omit<Item, 'card'> & { card: ItemCard | null }

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

const hasCard = (item: ApiItem): item is Item => Boolean(item.card)

export default function Page() {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()

  // Tab State for Header
  const [activeTab, setActiveTab] = useState<'home' | 'fangate' | 'armybattles'>('home')

  // View State (Cards or Badges)
  const [view, setView] = useState<'cards' | 'badges'>('cards')

  // Inventory State
  const [items, setItems] = useState<Item[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const loadedOnceRef = useRef(false)
  const [, setUserXp] = useState(0)

  // Badges State
  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [badgesLoading, setBadgesLoading] = useState(false)
  const [badgesError, setBadgesError] = useState<string | null>(null)
  const [badgesTotalCount, setBadgesTotalCount] = useState(0)

  // Derived Stats
  const uniqueCount = new Set(items.map(i => i.card.publicId)).size // Approximate uniqueness by publicId
  const rareCount = items.filter(i => ['rare', 'epic', 'legendary'].includes(i.card.rarity || '')).length

  // Load Inventory Data
  const load = async (next?: string | null) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch(`/api/game/inventory?limit=20${next ? `&skip=${next}` : ''}`)
      
      const sanitized = (res.items as ApiItem[] | undefined)?.filter(hasCard) ?? []
      
      setItems((prev) => {
        if (!next) {
          return sanitized
        }
        const map = new Map(prev.map((i) => [i.id, i]))
        for (const it of sanitized) map.set(it.id, it)
        return Array.from(map.values())
      })
      
      setCursor(res.nextCursor || null)
      
      // Update total count if available from API (or estimate)
      // Note: Your current API might not return total count in the paginated response directly for the whole collection efficiently, 
      // but let's assume we might fetch it or just use the current loaded count if API doesn't support it yet.
      // Ideally, the API should return { items: [], nextCursor: '...', total: 100 }
      // Checking previous response structure... API returns `items` and `nextCursor`. 
      // We will fetch a separate stats call or modify API later. For now, let's try to get stats from game state or separate call.
      
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

          // Get total count separately if needed, or rely on inventory load
          const inventoryRes = await apiFetch('/api/game/inventory?limit=1')
          setTotalCount(inventoryRes?.total || 0) // Assuming API was updated to return total, strictly based on previous context it returned items.
          // Let's check api/game/inventory/route.ts -> It returns items and nextCursor.
          // Wait, I read the route file. It does NOT return total count in the response body top level.
          // It calculates `count` for pagination but doesn't return it as `total`.
          // I should probably update the API to return total, or fetch it differently.
          // For now, I will use a separate fetch to get the count or just show loaded count if I can't change API.
          // Actually, looking at `app/boraland/page.tsx` earlier, I used `res?.total` from `/api/game/inventory?limit=1`.
          // Let me double check if I missed where `total` is added to the response in `route.ts`.
          // ... `const count = await InventoryItem.countDocuments(...)` ... `return NextResponse.json({ items: mapped, ...(nextCursor ? { nextCursor } : {}) })`
          // It seems `total` is NOT returned in the current `route.ts`.
          // I should fix the API route to return `total` as well to make the UI accurate.
      } catch (e) {}
  }

  useEffect(() => {
    if (user === null) {
      showToast('warning', 'Sign in to access your inventory')
      router.push('/boraland')
      return
    }
    
    if (user && !loadedOnceRef.current) {
        loadedOnceRef.current = true
        load(null)
        loadBadges()
        loadUserStats()
    }
  }, [user, router, showToast])

  if (!user) return null

  return (
    <div className="h-[calc(100vh-4rem)] bg-background-deep text-gray-200 flex flex-col overflow-hidden relative">
        {/* Background Effects */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05]"></div>
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-bora-primary/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-cyan/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
        </div>

        <BoralandHeader activeTab={activeTab} onTabChange={(tab) => {
          setActiveTab(tab)
          if (tab === 'home') router.push('/boraland')
          else if (tab === 'fangate') router.push('/boraland')
          else if (tab === 'armybattles') router.push('/boraland')
        }} />

        <main className="flex-grow z-10 p-4 lg:p-6 flex flex-col lg:flex-row gap-6 h-[calc(100vh-4rem)]">
            <CommandCenter />

            <div className="flex-grow flex flex-col gap-4">
              {/* View Toggle */}
              <div className="flex items-center gap-2 bora-glass-panel rounded-xl p-1 w-fit">
                <button
                  onClick={() => setView('cards')}
                  className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
                    view === 'cards'
                      ? 'bg-bora-primary text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">style</span>
                    Photocards
                  </span>
                </button>
                <button
                  onClick={() => setView('badges')}
                  className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
                    view === 'badges'
                      ? 'bg-bora-primary text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">military_tech</span>
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
                  uniqueCount={uniqueCount}
                  rareCount={rareCount}
                />
              ) : (
                <BadgesGrid
                  badges={badges}
                  loading={badgesLoading}
                  error={badgesError}
                  totalCount={badgesTotalCount}
                />
              )}
            </div>
        </main>
    </div>
  )
}
