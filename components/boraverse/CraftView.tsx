'use client'

import { useState } from 'react'
import { apiFetch } from '@/lib/client/api'

export default function CraftView() {
  const [cardId, setCardId] = useState('')
  const [targetRarity, setTargetRarity] = useState<'rare'|'epic'|'legendary'|'none'>('none')
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const body: any = {}
      if (cardId) body.cardId = cardId
      if (targetRarity !== 'none') body.targetRarity = targetRarity
      const res = await apiFetch('/api/game/craft', { method: 'POST', body: JSON.stringify(body) })
      setResult(res)
    } catch (e: any) {
      setError(e?.message || 'Craft failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-white text-2xl font-semibold mb-4">Craft</h2>
      <div className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-4 space-y-3">
        <div className="text-white/70 text-sm">Craft a specific card by ID or buy a ticket roll with a minimum rarity.</div>
        <input value={cardId} onChange={(e)=>setCardId(e.target.value)} placeholder="Card ID (optional)" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-[#3b1a52]/60 text-white" />
        <div className="flex items-center gap-3">
          <label className="text-white/70">Ticket floor:</label>
          <select value={targetRarity} onChange={(e)=>setTargetRarity(e.target.value as any)} className="px-3 py-2 rounded-xl bg-white/5 border border-[#3b1a52]/60 text-white">
            <option value="none">None</option>
            <option value="rare">Rare+</option>
            <option value="epic">Epic+</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>
        <button disabled={loading} onClick={submit} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF9AD5] to-[#C084FC] text-black font-semibold disabled:opacity-50">{loading ? 'Crafting…' : 'Craft'}</button>
        {error && <div className="text-rose-300">{error}</div>}
        {result?.reward && (
          <div className="text-white/90">Granted: {result.reward.member} • {result.reward.era} • {result.reward.rarity}</div>
        )}
      </div>
    </div>
  )
}


