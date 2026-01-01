'use client'

export default function RarityPill({ rarity }: { rarity: 'common'|'rare'|'epic'|'legendary' | null | undefined }) {
  // Handle null/undefined rarity gracefully
  if (!rarity) {
    return (
      <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-slate-400 text-xs">
        Unknown
      </span>
    )
  }

  const color = rarity === 'common' ? 'text-slate-300' : rarity === 'rare' ? 'text-sky-400' : rarity === 'epic' ? 'text-fuchsia-400' : 'text-amber-400'
  return (
    <span className={`px-2 py-0.5 rounded-full border border-white/10 bg-white/5 ${color} text-xs`}>
      {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
    </span>
  )
}


