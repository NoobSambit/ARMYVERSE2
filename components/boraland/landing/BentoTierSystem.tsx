'use client'

export default function BentoTierSystem() {
  const tiers = [
    { name: 'Randomized Drops', color: 'bg-accent-green', textColor: 'text-accent-green', label: '100% Random', shadow: 'shadow-[0_0_10px_rgba(57,255,20,0.5)]' },
    { name: 'Category-Aware', color: 'bg-primary', textColor: 'text-primary', label: 'Structured', shadow: 'shadow-[0_0_10px_rgba(0,240,255,0.5)]' },
    { name: 'Infinite Variety', color: 'bg-accent-blue', textColor: 'text-accent-blue', label: 'Huge Pool', shadow: 'shadow-[0_0_10px_rgba(0,170,255,0.5)]' },
    { name: 'No Rarity Walls', color: 'bg-gray-600', textColor: 'text-gray-300', label: 'Fair Play', shadow: '' }
  ]

  return (
    <div className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-2 rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col relative overflow-hidden">
      {/* Diamond Icon Background */}
      <div className="absolute top-0 right-0 p-4 md:p-6 opacity-10 pointer-events-none">
        <svg className="w-20 h-20 md:w-[120px] md:h-[120px] text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 3h12l4 6-10 13L2 9l4-6z" />
        </svg>
      </div>

      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 md:mb-6 relative z-10 font-display">
        Photocard Drop System
      </h3>

      <div className="flex flex-col gap-2 sm:gap-3 relative z-10 flex-1 justify-center">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="flex items-center justify-between p-2 md:p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`size-2.5 md:size-3 rounded-full ${tier.color} ${tier.shadow} group-hover:scale-110 transition-transform`}></div>
              <span className="font-bold text-[11px] sm:text-xs md:text-sm font-display">{tier.name}</span>
            </div>
            <span className={`text-[10px] sm:text-xs font-mono ${tier.textColor} bg-current/10 px-2 py-1 rounded font-display`}>
              {tier.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
