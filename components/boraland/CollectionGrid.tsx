import React, { useEffect, useMemo, useState } from 'react'

type CatalogNode = {
  key: string
  label: string
  path: string[]
  total: number
  collected: number
  children: CatalogNode[]
}

type CatalogData = {
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

type CollectionGridProps = {
  groups: CollectionGroup[]
  totalCards: number
  collectedCards: number
  loading: boolean
  error: string | null
  catalog?: CatalogData | null
  catalogLoading?: boolean
  catalogError?: string | null
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedCategory: string | null
  selectedSubcategory: string | null
  onSelectCategory: (value: string | null) => void
  onSelectSubcategory: (value: string | null, category?: string | null) => void
}

const buildScaledUrl = (url?: string, width?: number) => {
  if (!url || !width) return url
  if (url.includes('/scale-to-width-down/')) {
    return url.replace(/\/scale-to-width-down\/\d+/i, `/scale-to-width-down/${width}`)
  }
  if (url.includes('/revision/latest')) {
    return url.replace('/revision/latest', `/revision/latest/scale-to-width-down/${width}`)
  }
  return url
}

export default function CollectionGrid({
  groups,
  totalCards,
  collectedCards,
  loading,
  error,
  catalog,
  catalogLoading = false,
  catalogError = null,
  searchQuery,
  onSearchChange,
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory
}: CollectionGridProps) {
  const [openDropdown, setOpenDropdown] = useState<'category' | 'subcategory' | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [activeCard, setActiveCard] = useState<CollectionCard | null>(null)

  useEffect(() => {
    if (!activeCard) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveCard(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeCard])

  const findNodeLabel = useMemo(() => {
    const map = new Map<string, string>()
    const walk = (nodes: CatalogNode[]) => {
      for (const node of nodes) {
        map.set(node.key, node.label)
        if (node.children?.length) walk(node.children)
      }
    }
    if (catalog?.categories?.length) walk(catalog.categories)
    return map
  }, [catalog])

  const categoryOptions = useMemo(() => catalog?.categories ?? [], [catalog])
  const selectedCategoryNode = useMemo(
    () => categoryOptions.find((node) => node.key === selectedCategory) || null,
    [categoryOptions, selectedCategory]
  )

  const subcategoryOptions = useMemo(() => {
    if (!selectedCategoryNode) return []
    const options: Array<{ key: string; label: string; depth: number }> = []
    const walk = (nodes: CatalogNode[], prefix: string[]) => {
      for (const node of nodes) {
        const labelParts = [...prefix, node.label]
        options.push({
          key: node.key,
          label: labelParts.join(' / '),
          depth: prefix.length
        })
        if (node.children?.length) {
          walk(node.children, labelParts)
        }
      }
    }
    walk(selectedCategoryNode.children || [], [])
    return options
  }, [selectedCategoryNode])

  const subcategoryLabelMap = useMemo(
    () => new Map(subcategoryOptions.map((option) => [option.key, option.label])),
    [subcategoryOptions]
  )

  const selectedCategoryLabel = selectedCategory ? (findNodeLabel.get(selectedCategory) || selectedCategory) : null
  const selectedSubcategoryLabel = selectedSubcategory
    ? (subcategoryLabelMap.get(selectedSubcategory) || findNodeLabel.get(selectedSubcategory) || selectedSubcategory)
    : null

  const hasCategory = Boolean(selectedCategory)
  const availableCount = hasCategory ? totalCards : (catalog?.totalCards ?? null)
  const ownedCount = hasCategory ? collectedCards : (catalog?.collectedCards ?? null)
  const completionPercent = availableCount ? Math.round(((ownedCount || 0) / availableCount) * 100) : 0

  const activeFilters = [
    selectedCategoryLabel ? { key: 'category', label: 'Category', value: selectedCategoryLabel } : null,
    selectedSubcategoryLabel ? { key: 'subcategory', label: 'Subcategory', value: selectedSubcategoryLabel } : null,
    searchQuery ? { key: 'search', label: 'Search', value: searchQuery } : null
  ].filter(Boolean) as Array<{ key: string; label: string; value: string }>

  const toggleDropdown = (key: 'category' | 'subcategory') => {
    setOpenDropdown((prev) => (prev === key ? null : key))
  }

  const closePanels = () => {
    setOpenDropdown(null)
  }

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <section className="flex-grow flex flex-col gap-4 md:gap-6 overflow-hidden h-full">
      <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4 shrink-0">
        <div className="bora-glass-panel p-3 md:p-5 rounded-2xl border-l-2 md:border-l-4 border-l-bora-primary flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2">
          <div>
            <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-0.5 md:mb-1">
              {hasCategory ? 'Collection Available' : 'All Collections'}
            </p>
            <h3 className="text-xl md:text-3xl font-display font-bold text-white">
              {availableCount ?? '—'} <span className="text-xs md:text-base text-gray-500 font-normal hidden md:inline">cards</span>
            </h3>
            {!hasCategory && (
              <p className="text-[10px] md:text-xs text-gray-500">Select a category to see missing cards.</p>
            )}
          </div>
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-bora-primary/10 flex items-center justify-center text-bora-primary hidden md:flex">
            <span className="material-symbols-outlined text-xl md:text-2xl">inventory_2</span>
          </div>
        </div>
        <div className="bora-glass-panel p-3 md:p-5 rounded-2xl border-l-2 md:border-l-4 border-l-accent-cyan flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2">
          <div>
            <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-0.5 md:mb-1">
              {hasCategory ? 'Collected' : 'Collected Overall'}
            </p>
            <h3 className="text-xl md:text-3xl font-display font-bold text-white">
              {ownedCount ?? '—'} <span className="text-xs md:text-base text-gray-500 font-normal hidden md:inline">owned</span>
            </h3>
          </div>
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-accent-cyan/10 flex items-center justify-center text-accent-cyan hidden md:flex">
            <span className="material-symbols-outlined text-xl md:text-2xl">check_circle</span>
          </div>
        </div>
        <div className="bora-glass-panel p-3 md:p-5 rounded-2xl border-l-2 md:border-l-4 border-l-accent-pink flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2">
          <div>
            <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-0.5 md:mb-1">
              {hasCategory ? 'Completion' : 'Overall Completion'}
            </p>
            <h3 className="text-xl md:text-3xl font-display font-bold text-white">
              {availableCount ? `${completionPercent}%` : '—'} <span className="text-xs md:text-base text-gray-500 font-normal hidden md:inline">complete</span>
            </h3>
          </div>
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-accent-pink/10 flex items-center justify-center text-accent-pink hidden md:flex">
            <span className="material-symbols-outlined text-xl md:text-2xl">donut_large</span>
          </div>
        </div>
      </div>

      <div className="bora-glass-panel rounded-xl p-2 md:p-3 flex flex-col gap-3 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => {
              onSearchChange('')
              onSelectCategory(null)
              onSelectSubcategory(null)
              closePanels()
            }}
            className="bg-bora-primary text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium shadow-[0_0_10px_rgba(139,92,246,0.3)] whitespace-nowrap"
          >
            All
          </button>
          <div className="h-6 w-px bg-white/10 mx-1 hidden lg:block"></div>
          <div className="relative">
            <button
              onClick={() => toggleDropdown('category')}
              aria-expanded={openDropdown === 'category'}
              className={`flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm whitespace-nowrap border ${
                openDropdown === 'category'
                  ? 'bg-bora-primary/20 text-white border-bora-primary/40'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
              }`}
            >
              <span>{selectedCategoryLabel || 'Category'}</span>
              <span className="material-symbols-outlined text-xs md:text-sm">expand_more</span>
            </button>
          </div>
          <div className="relative">
            <button
              onClick={() => toggleDropdown('subcategory')}
              aria-expanded={openDropdown === 'subcategory'}
              className={`flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm whitespace-nowrap border ${
                openDropdown === 'subcategory'
                  ? 'bg-bora-primary/20 text-white border-bora-primary/40'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
              } ${!selectedCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!selectedCategory}
            >
              <span>{selectedSubcategoryLabel || 'Subcategory'}</span>
              <span className="material-symbols-outlined text-xs md:text-sm">expand_more</span>
            </button>
          </div>
        </div>

        {openDropdown && (
          <div className="rounded-xl border border-white/10 bg-black/30 p-3 md:p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-sm md:text-base font-semibold text-white">
                  {openDropdown === 'category' ? 'Categories' : 'Subcategories'}
                </h4>
                <p className="text-[10px] md:text-xs text-gray-500">
                  {openDropdown === 'category' ? 'Pick a collection category.' : 'Drill into a specific set.'}
                </p>
              </div>
              <button onClick={closePanels} className="text-[10px] md:text-xs text-gray-400 hover:text-white">
                Close
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin">
              {openDropdown === 'category' && (
                <>
                  {catalogLoading && <div className="text-xs text-gray-400">Loading categories...</div>}
                  {catalogError && <div className="text-xs text-rose-300">{catalogError}</div>}
                  {!catalogLoading && !catalogError && (
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          onSelectCategory(null)
                          onSelectSubcategory(null)
                          closePanels()
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 rounded-lg"
                      >
                        All categories
                      </button>
                      {categoryOptions.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-gray-400">No categories available.</div>
                      ) : (
                        categoryOptions.map((category) => (
                          <button
                            key={category.key}
                            onClick={() => {
                              onSelectCategory(category.key)
                              onSelectSubcategory(null)
                              closePanels()
                            }}
                            className={`w-full px-3 py-2 text-left text-xs hover:bg-white/10 rounded-lg ${
                              selectedCategory === category.key ? 'bg-bora-primary/15 text-white' : 'text-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">{category.label}</span>
                              <span className="text-[10px] text-gray-400">{category.collected} / {category.total}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}

              {openDropdown === 'subcategory' && (
                <>
                  {!selectedCategory && <div className="text-xs text-gray-400">Select a category to see subcategories.</div>}
                  {selectedCategory && (
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          onSelectSubcategory(null)
                          closePanels()
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/10 rounded-lg"
                      >
                        All subcategories
                      </button>
                      {subcategoryOptions.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-gray-400">No subcategories available.</div>
                      ) : (
                        subcategoryOptions.map((subcategory) => (
                          <button
                            key={subcategory.key}
                            onClick={() => {
                              onSelectSubcategory(subcategory.key, selectedCategory)
                              closePanels()
                            }}
                            className={`w-full px-3 py-2 text-left text-xs hover:bg-white/10 rounded-lg ${
                              selectedSubcategory === subcategory.key ? 'bg-bora-primary/15 text-white' : 'text-gray-200'
                            }`}
                          >
                            <span className={subcategory.depth ? 'pl-2 text-gray-300' : 'font-medium text-gray-100'}>
                              {subcategory.label}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base md:text-lg">search</span>
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="bg-black/30 border border-white/10 text-white text-xs md:text-sm rounded-xl pl-8 md:pl-9 pr-3 md:pr-4 py-1.5 md:py-2 focus:ring-1 focus:ring-bora-primary focus:border-bora-primary w-full placeholder-gray-600"
              placeholder="Search..."
              type="text"
            />
          </div>
          <button className="p-1.5 md:p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/5 hover:border-white/20 shrink-0">
            <span className="material-symbols-outlined text-lg md:text-xl">grid_view</span>
          </button>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs text-gray-400">
            {activeFilters.map((filter) => (
              <span key={filter.key} className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                {filter.label}: {filter.value}
              </span>
            ))}
            <button
              onClick={() => {
                onSearchChange('')
                onSelectCategory(null)
                onSelectSubcategory(null)
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
        {error && <div className="mb-4 text-rose-300 text-center text-sm">{error}</div>}
        {!selectedCategory && !loading && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">category</span>
            <p>Select a category to view the collection.</p>
          </div>
        )}

        {selectedCategory && loading && (
          <div className="text-xs text-gray-400">Loading collection...</div>
        )}

        {selectedCategory && !loading && groups.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">style</span>
            <p>No cards found for this collection.</p>
          </div>
        )}

        {selectedCategory && groups.map((group) => {
          const percent = group.total ? Math.round((group.collected / group.total) * 100) : 0
          const isOpen = expandedGroups[group.key] ?? false
          return (
            <div key={group.key} className="mb-6">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2 mb-3">
                <div>
                  <h4 className="text-base md:text-lg font-semibold text-white">{group.label}</h4>
                  <p className="text-[10px] md:text-xs text-gray-400">{group.collected} collected · {group.total} cards total</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden md:block w-40 h-1.5 bg-black/40 rounded-full">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-bora-primary to-accent-pink"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <button
                    onClick={() => toggleGroup(group.key)}
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-bora-primary/40 bg-bora-primary/10 text-bora-primary shadow-[0_0_12px_rgba(139,92,246,0.35)] hover:bg-bora-primary/20 hover:text-white transition"
                    aria-label={isOpen ? 'Collapse collection' : 'Expand collection'}
                  >
                    <span className="material-symbols-outlined text-xl font-bold">{isOpen ? 'expand_less' : 'expand_more'}</span>
                  </button>
                </div>
              </div>
              {isOpen && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                  {group.cards.map((card) => {
                    if (!card.owned) {
                      return (
                        <div key={card.cardId} className="rounded-xl border border-white/5 bg-gradient-to-br from-[#2A1540] to-[#140A24] aspect-[2/3] flex flex-col items-center justify-center text-gray-500">
                          <span className="text-3xl md:text-4xl">?</span>
                          <p className="mt-2 text-[10px] md:text-xs uppercase tracking-wider">Missing</p>
                        </div>
                      )
                    }

                    const title = card.title || card.subcategory || card.category || 'Photocard'
                    const category = card.category || card.categoryPath || 'Gallery'
                    const subcategory = card.subcategory || card.subcategoryPath || ''
                    const metaLine = subcategory ? `${category} - ${subcategory}` : category
                    const lowRes = card.thumbUrl
                    const mediumRes = buildScaledUrl(card.imageUrl || card.thumbUrl, 640)
                    const highRes = buildScaledUrl(card.imageUrl || card.thumbUrl, 1200)
                    const imageSrc = mediumRes || lowRes || `https://placehold.co/400x600/2a1b3d/ffffff?text=${encodeURIComponent(title)}`
                    const srcSetCandidates = [
                      lowRes ? { url: lowRes, width: 225 } : null,
                      mediumRes ? { url: mediumRes, width: 640 } : null,
                      highRes ? { url: highRes, width: 1200 } : null
                    ].filter(Boolean) as Array<{ url: string; width: number }>
                    const seenUrls = new Set<string>()
                    const imageSrcSet = srcSetCandidates
                      .filter((entry) => {
                        if (seenUrls.has(entry.url)) return false
                        seenUrls.add(entry.url)
                        return true
                      })
                      .map((entry) => `${entry.url} ${entry.width}w`)
                      .join(', ')
                    const imageSizes = imageSrcSet
                      ? '(min-width: 1536px) 240px, (min-width: 1280px) 220px, (min-width: 1024px) 200px, (min-width: 768px) 180px, 48vw'
                      : undefined

                    return (
                      <div key={card.cardId} className="group relative rounded-xl overflow-hidden bora-glass-panel border border-white/5 hover:border-bora-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-bora-primary/10">
                        <div className="relative aspect-[2/3] overflow-hidden">
                          <img
                            alt={`${title} card`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            src={imageSrc}
                            srcSet={imageSrcSet || undefined}
                            sizes={imageSizes}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0720] via-transparent to-transparent opacity-90"></div>
                          <span className="absolute top-2 right-2 md:top-3 md:right-3 backdrop-blur-sm border text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded uppercase tracking-wider bg-black/60 border-white/10 text-gray-300 max-w-[70%] truncate">
                            {category}
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full p-2 md:p-4">
                          <div className="flex justify-between items-end gap-1">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-display font-bold text-white text-sm md:text-lg leading-tight mb-0.5 truncate">{title}</h4>
                              <p className="text-[10px] md:text-xs text-gray-400 truncate">{metaLine}</p>
                            </div>
                            <button
                              onClick={() => setActiveCard(card)}
                              className="text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 p-1 md:p-1.5 rounded-xl transition-colors backdrop-blur-md shrink-0"
                              aria-label="Open card details"
                            >
                              <span className="material-symbols-outlined text-xs md:text-sm">open_in_full</span>
                            </button>
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
      </div>

      {activeCard && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveCard(null)}
        >
          <div
            className="w-full max-w-5xl max-h-[85vh] md:max-h-[90vh] rounded-2xl border border-white/10 bg-[#120a24]/95 shadow-2xl overflow-hidden flex flex-col"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 bg-[#120a24]/95 backdrop-blur">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-gray-500">Photocard</p>
                <h3 className="text-base md:text-lg font-semibold text-white truncate">
                  {activeCard.title || activeCard.subcategory || activeCard.category || 'Photocard'}
                </h3>
              </div>
              <button
                onClick={() => setActiveCard(null)}
                className="text-gray-400 hover:text-white"
                aria-label="Close details"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-4 p-4 overflow-y-auto">
              <div className="rounded-xl bg-black/40 p-3 flex items-center justify-center">
                <img
                  src={
                    buildScaledUrl(activeCard.imageUrl || activeCard.thumbUrl, 1600) ||
                    activeCard.imageUrl ||
                    activeCard.thumbUrl ||
                    `https://placehold.co/800x1200/2a1b3d/ffffff?text=${encodeURIComponent(activeCard.title || 'Photocard')}`
                  }
                  alt={activeCard.title || 'Photocard'}
                  className="max-h-[60vh] md:max-h-[70vh] w-auto rounded-xl object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">Category</p>
                  <p className="text-white">{activeCard.category || activeCard.categoryPath || 'Unknown'}</p>
                </div>
                {activeCard.subcategory && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Subcategory</p>
                    <p className="text-white">{activeCard.subcategory}</p>
                  </div>
                )}
                {activeCard.categoryPath && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Category Path</p>
                    <p className="text-gray-300 break-words">{activeCard.categoryPath}</p>
                  </div>
                )}
                {activeCard.subcategoryPath && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Subcategory Path</p>
                    <p className="text-gray-300 break-words">{activeCard.subcategoryPath}</p>
                  </div>
                )}
                {activeCard.pageUrl && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Page URL</p>
                    <a
                      href={activeCard.pageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-bora-primary hover:text-white break-words"
                    >
                      {activeCard.pageUrl}
                    </a>
                  </div>
                )}
                {activeCard.sourceUrl && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Source URL</p>
                    <a
                      href={activeCard.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-bora-primary hover:text-white break-words"
                    >
                      {activeCard.sourceUrl}
                    </a>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  {activeCard.imageUrl && (
                    <a
                      href={activeCard.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-full border border-white/10 text-xs text-gray-200 hover:text-white hover:border-white/30"
                    >
                      Open original image
                    </a>
                  )}
                </div>
                <button
                  onClick={() => setActiveCard(null)}
                  className="md:hidden mt-4 w-full rounded-xl border border-white/10 py-2 text-xs text-gray-200 hover:text-white hover:border-white/30"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
