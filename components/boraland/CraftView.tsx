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
    <div className="max-w-3xl mx-auto px-0 md:px-4 py-4 md:py-8">
      <div className="mb-4 md:mb-6">
        <h2 className="text-white text-2xl md:text-3xl font-bold mb-1">Crafting System</h2>
        <p className="text-gray-400 text-xs md:text-sm">Use Stardust to craft specific cards</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-3 md:p-4 space-y-3 md:space-y-4">
        <div className="text-white/70 text-xs md:text-sm">Craft a specific card by ID or buy a ticket roll with a minimum rarity.</div>
        <input 
          value={cardId} 
          onChange={(e)=>setCardId(e.target.value)} 
          placeholder="Card ID (optional)" 
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm md:text-base placeholder:text-gray-600 focus:ring-1 focus:ring-bora-primary" 
        />
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <label className="text-white/70 text-sm">Ticket floor:</label>
          <select 
            value={targetRarity} 
            onChange={(e)=>setTargetRarity(e.target.value as any)} 
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm md:text-base focus:ring-1 focus:ring-bora-primary"
          >
            <option value="none">None</option>
            <option value="rare">Rare+</option>
            <option value="epic">Epic+</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>
        <button 
          disabled={loading} 
          onClick={submit} 
          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#FF9AD5] to-[#C084FC] text-black font-semibold disabled:opacity-50 hover:shadow-lg transition-all text-sm md:text-base"
        >
          {loading ? 'Crafting…' : 'Craft'}
        </button>
        {error && <div className="text-rose-300 text-sm">{error}</div>}
        {result?.reward && (
          <div className="text-white/90 bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm">
            <span className="font-semibold">Granted:</span> {result.reward.member} • {result.reward.era} • {result.reward.rarity}
          </div>
        )}
      </div>
    </div>
  )
}


