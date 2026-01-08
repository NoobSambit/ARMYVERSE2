import React from 'react'
import { apiFetch } from '@/lib/client/api'

type InventoryGridProps = {
  items: any[]
  loading: boolean
  error: string | null
  cursor: string | null
  loadMore: (cursor: string) => void
  totalCount: number
  uniqueCount: number
  rareCount: number
}

export default function InventoryGrid({ 
  items, 
  loading, 
  error, 
  cursor, 
  loadMore,
  totalCount,
  uniqueCount,
  rareCount
}: InventoryGridProps) {
  
  const share = async (inventoryItemId: string) => {
    try {
      const res = await apiFetch('/api/game/share', { method: 'POST', body: JSON.stringify({ inventoryItemId }) })
      await navigator.clipboard.writeText(res.shareUrl)
      alert('Share link copied!')
    } catch (e) {}
  }

  return (
    <section className="flex-grow flex flex-col gap-4 md:gap-6 overflow-hidden h-full">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4 shrink-0">
            <div className="bora-glass-panel p-3 md:p-5 rounded-2xl border-l-2 md:border-l-4 border-l-bora-primary flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2">
                <div>
                    <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-0.5 md:mb-1">Total</p>
                    <h3 className="text-xl md:text-3xl font-display font-bold text-white">{totalCount} <span className="text-xs md:text-base text-gray-500 font-normal hidden md:inline">cards</span></h3>
                </div>
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-bora-primary/10 flex items-center justify-center text-bora-primary hidden md:flex">
                    <span className="material-symbols-outlined text-xl md:text-2xl">style</span>
                </div>
            </div>
            <div className="bora-glass-panel p-3 md:p-5 rounded-2xl border-l-2 md:border-l-4 border-l-accent-cyan flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2">
                <div>
                    <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-0.5 md:mb-1">Unique</p>
                    <h3 className="text-xl md:text-3xl font-display font-bold text-white">{uniqueCount} <span className="text-xs md:text-base text-gray-500 font-normal hidden md:inline">/ {totalCount}</span></h3>
                </div>
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-accent-cyan/10 flex items-center justify-center text-accent-cyan hidden md:flex">
                    <span className="material-symbols-outlined text-xl md:text-2xl">auto_awesome</span>
                </div>
            </div>
            <div className="bora-glass-panel p-3 md:p-5 rounded-2xl border-l-2 md:border-l-4 border-l-accent-pink flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2">
                <div>
                    <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-0.5 md:mb-1">Rare</p>
                    <h3 className="text-xl md:text-3xl font-display font-bold text-white">{rareCount} <span className="text-xs md:text-base text-gray-500 font-normal hidden md:inline">found</span></h3>
                </div>
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-accent-pink/10 flex items-center justify-center text-accent-pink hidden md:flex">
                    <span className="material-symbols-outlined text-xl md:text-2xl">diamond</span>
                </div>
            </div>
        </div>

        {/* Filters & Search */}
        <div className="bora-glass-panel rounded-xl p-2 md:p-3 flex flex-col gap-3 shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                <button className="bg-bora-primary text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium shadow-[0_0_10px_rgba(139,92,246,0.3)] whitespace-nowrap">All</button>
                <button className="bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium transition-colors whitespace-nowrap">Favorites</button>
                <button className="bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium transition-colors whitespace-nowrap hidden md:inline-flex">New</button>
                <div className="h-6 w-px bg-white/10 mx-1 hidden lg:block"></div>
                <div className="relative group">
                    <button className="flex items-center gap-1 bg-white/5 text-gray-300 px-2 md:px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm hover:bg-white/10 whitespace-nowrap">
                        <span>Member</span> <span className="material-symbols-outlined text-xs md:text-sm">expand_more</span>
                    </button>
                </div>
                <div className="relative group">
                    <button className="flex items-center gap-1 bg-white/5 text-gray-300 px-2 md:px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm hover:bg-white/10 whitespace-nowrap">
                        <span>Era</span> <span className="material-symbols-outlined text-xs md:text-sm">expand_more</span>
                    </button>
                </div>
                <div className="relative group">
                    <button className="flex items-center gap-1 bg-white/5 text-gray-300 px-2 md:px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm hover:bg-white/10 whitespace-nowrap">
                        <span>Rarity</span> <span className="material-symbols-outlined text-xs md:text-sm">expand_more</span>
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                    <span className="material-symbols-outlined absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base md:text-lg">search</span>
                    <input className="bg-black/30 border border-white/10 text-white text-xs md:text-sm rounded-xl pl-8 md:pl-9 pr-3 md:pr-4 py-1.5 md:py-2 focus:ring-1 focus:ring-bora-primary focus:border-bora-primary w-full placeholder-gray-600" placeholder="Search..." type="text"/>
                </div>
                <button className="p-1.5 md:p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/5 hover:border-white/20 shrink-0">
                    <span className="material-symbols-outlined text-lg md:text-xl">grid_view</span>
                </button>
            </div>
        </div>

        {/* Inventory Grid */}
        <div className="overflow-y-auto pr-1 md:pr-2 pb-4 scrollbar-thin flex-grow">
            {error && <div className="mb-4 text-rose-300 text-center text-sm">{error}</div>}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                {items.map((it) => (
                     <div key={it.id} className="group relative rounded-xl overflow-hidden bora-glass-panel border border-white/5 hover:border-bora-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-bora-primary/10">
                        <div className="relative aspect-[2/3] overflow-hidden">
                            <img alt={`${it.card?.member} card`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={it.card?.imageUrl || `https://placehold.co/400x600/2a1b3d/ffffff?text=${it.card?.member || 'Card'}`}/>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0720] via-transparent to-transparent opacity-90"></div>
                            <span className={`absolute top-2 right-2 md:top-3 md:right-3 backdrop-blur-sm border text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded uppercase tracking-wider ${
                                it.card?.rarity === 'rare' 
                                ? 'bg-accent-cyan/20 border-accent-cyan/40 text-accent-cyan shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                                : it.card?.rarity === 'epic'
                                ? 'bg-accent-pink/20 border-accent-pink/40 text-accent-pink shadow-[0_0_10px_rgba(244,114,182,0.3)]'
                                : it.card?.rarity === 'legendary'
                                ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]'
                                : 'bg-black/60 border-white/10 text-gray-300'
                            }`}>
                                {it.card?.rarity || 'Common'}
                            </span>
                             {/* Shine effect for rare+ cards */}
                             {(it.card?.rarity === 'rare' || it.card?.rarity === 'epic' || it.card?.rarity === 'legendary') && (
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_1s_ease-in-out]"></div>
                            )}
                        </div>
                        <div className="absolute bottom-0 left-0 w-full p-2 md:p-4">
                            <div className="flex justify-between items-end gap-1">
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-display font-bold text-white text-sm md:text-lg leading-tight mb-0.5 truncate ${
                                        it.card?.rarity === 'rare' ? 'text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-blue-400' : 
                                        it.card?.rarity === 'epic' ? 'text-transparent bg-clip-text bg-gradient-to-r from-accent-pink to-purple-400' :
                                        it.card?.rarity === 'legendary' ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500' : ''
                                    }`}>{it.card?.member}</h4>
                                    <p className="text-[10px] md:text-xs text-gray-400 truncate">{it.card?.era}</p>
                                </div>
                                <button onClick={() => share(it.id)} className="text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 p-1 md:p-1.5 rounded-xl transition-colors backdrop-blur-md shrink-0">
                                    <span className="material-symbols-outlined text-xs md:text-sm">share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading Skeletons */}
                {loading && Array.from({ length: items.length > 0 ? 3 : 6 }).map((_, i) => (
                    <div key={`skel-${i}`} className="rounded-xl border border-white/5 bg-white/5 aspect-[2/3] animate-pulse" />
                ))}
            </div>

            {/* Load More Button */}
             {cursor && !loading && (
                <div className="flex justify-center mt-6 mb-4">
                  <button onClick={() => loadMore(cursor)} className="px-6 py-2 rounded-xl border border-bora-primary/30 bg-bora-primary/10 text-white/90 hover:bg-bora-primary/20 transition-colors">
                      Load More Cards
                  </button>
                </div>
            )}
            
            {/* Empty State */}
            {!loading && items.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">style</span>
                    <p>No cards found in your collection.</p>
                </div>
            )}
        </div>
    </section>
  )
}
