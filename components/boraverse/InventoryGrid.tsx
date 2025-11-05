'use client'

import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '@/lib/client/api'
import RarityPill from './RarityPill'

type ItemCard = { member: string; era: string; set: string; rarity: 'common'|'rare'|'epic'|'legendary' | null | undefined; publicId: string; imageUrl: string }
type Item = { id: string; acquiredAt: string; card: ItemCard }
type ApiItem = Omit<Item, 'card'> & { card: ItemCard | null }

const hasCard = (item: ApiItem): item is Item => Boolean(item.card)

export default function InventoryGrid() {
  const [items, setItems] = useState<Item[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadedOnceRef = useRef(false)

  const load = async (next?: string | null) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch(`/api/game/inventory${next ? `?skip=${next}` : ''}`)
      const sanitized = (res.items as ApiItem[] | undefined)?.filter(hasCard) ?? []
      setItems((prev) => {
        if (!next) {
          // First page: replace to avoid duplicate StrictMode mounts
          return sanitized
        }
        const map = new Map(prev.map((i) => [i.id, i]))
        for (const it of sanitized) map.set(it.id, it)
        return Array.from(map.values())
      })
      setCursor(res.nextCursor || null)
    } catch (e: any) {
      setError(e?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (loadedOnceRef.current) return
    loadedOnceRef.current = true
    load(null)
  }, [])

  const share = async (inventoryItemId: string) => {
    try {
      const res = await apiFetch('/api/game/share', { method: 'POST', body: JSON.stringify({ inventoryItemId }) })
      await navigator.clipboard.writeText(res.shareUrl)
      alert('Share link copied!')
    } catch (e) {}
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {error && <div className="mb-4 text-rose-300">{error}</div>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((it) => (
          <div key={it.id} className="group rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md overflow-hidden shadow-[0_10px_30px_rgba(129,0,255,0.15)] transform transition hover:rotate-[0.5deg]">
            <div className="p-2 flex justify-end"><RarityPill rarity={it.card.rarity} /></div>
            <img src={it.card.imageUrl} alt={`${it.card.member} ${it.card.era}`} className="w-full h-72 object-cover" />
            <div className="p-3 text-white/90 text-sm flex items-center justify-between">
              <span>{it.card.member} • {it.card.era}</span>
              <button onClick={() => share(it.id)} className="text-xs px-2 py-1 rounded-lg border border-[#3b1a52]/60">Share</button>
            </div>
          </div>
        ))}
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 h-80 animate-pulse" />
        ))}
      </div>
      {cursor && (
        <div className="flex justify-center mt-6">
          <button onClick={() => load(cursor)} className="px-4 py-2 rounded-xl border border-[#3b1a52]/60 text-white/90">Load more</button>
        </div>
      )}
    </div>
  )
}


