'use client'

import { useMemo } from 'react'
import { Search } from 'lucide-react'
import { BlogFiltersState, SortOption, useBlogFilters } from '@/hooks/useBlogFilters'
import { track } from '@/lib/utils/analytics'

interface FilterBarProps {
	filters: ReturnType<typeof useBlogFilters>
	allTags?: string[]
}

const SORTS: { value: SortOption; label: string }[] = [
	{ value: 'relevance', label: 'Relevance' },
	{ value: 'newest', label: 'Newest' },
	{ value: 'trending7d', label: 'Trending 7d' },
	{ value: 'mostViewed', label: 'Most viewed' },
	{ value: 'mostReacted', label: 'Most liked' },
	{ value: 'oldest', label: 'Oldest' },
]

export default function FilterBar({ filters, allTags = [] }: FilterBarProps) {
	const { state, set, clearAll } = filters
	const selectedCount = useMemo(() => {
		let c = 0
		const s = state as BlogFiltersState
		c += s.q ? 1 : 0
		c += s.tags.length + s.moods.length + s.authors.length + s.languages.length + s.types.length
		c += (s.before ? 1 : 0) + (s.after ? 1 : 0) + (s.minRead ? 1 : 0) + (s.maxRead ? 1 : 0)
		c += s.savedBy ? 1 : 0
		return c
	}, [state])

	return (
		<div className="sticky top-[56px] z-20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3 glass-panel">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
						<input aria-label="Search"
							className="w-full pl-10 pr-3 py-2 rounded-xl bg-black/70 border border-gray-700 text-white placeholder:text-gray-400"
							value={state.q}
							onChange={(e) => set({ q: e.target.value, sort: e.target.value ? 'relevance' : state.sort })}
							onKeyDown={(e) => { if (e.key === 'Enter') track('search_submitted', { q: state.q }) }}
							placeholder="Search posts, tags, authors..." />
					</div>
					<select aria-label="Sort"
						className="px-3 py-2 rounded-xl bg-black/40 border border-[#A78BFA1A] text-white"
						value={state.sort}
						onChange={(e) => set({ sort: e.target.value as SortOption })}>
						{SORTS.map(s => (
							<option key={s.value} value={s.value}>{s.label}</option>
						))}
					</select>
					{/* Track sort change */}
					<div className="hidden" aria-hidden>
						{/* This effect-like tracker piggybacks on change above via microtask */}
					</div>
					<div className="segmented w-40" role="tablist" aria-label="View toggle">
						<div
							className="segmented-thumb"
							style={{ left: '2px', width: 'calc(50% - 3px)', transform: state.view === 'list' ? 'translateX(100%)' : 'translateX(0)' }}
						/>
						<button role="tab" aria-selected={state.view !== 'list'} onClick={() => { set({ view: 'grid', page: 1 }); track('view_toggled', { view: 'grid' }) }} className="segmented-item">Grid</button>
						<button role="tab" aria-selected={state.view === 'list'} onClick={() => { set({ view: 'list', page: 1 }); track('view_toggled', { view: 'list' }) }} className="segmented-item">List</button>
					</div>
				</div>
				<div className="flex flex-wrap gap-2 items-center">
					{allTags.slice(0, 12).map(tag => (
						<button key={tag}
							aria-pressed={state.tags.includes(tag)}
							onClick={() => {
								const next = state.tags.includes(tag) ? state.tags.filter(t => t !== tag) : [...state.tags, tag]
								set({ tags: next })
							}}
							className={`px-3 py-1 rounded-full text-sm border tracking-wide ${state.tags.includes(tag) ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white border-transparent shadow-[0_1px_0_0_#FFFFFF08,0_12px_24px_-12px_#8B5CF633]' : 'bg-black/40 text-gray-300 border-[#A78BFA1A]'}`}>{tag}</button>
					))}
					{selectedCount > 0 && (
						<button onClick={clearAll} className="ml-auto text-sm text-[#A78BFA] underline">Clear all</button>
					)}
				</div>
			</div>
		</div>
	)
}


