"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export type SortOption = 'relevance' | 'newest' | 'trending7d' | 'mostViewed' | 'mostReacted' | 'oldest'

export interface BlogFiltersState {
	q: string
	tags: string[]
	moods: string[]
	authors: string[]
	languages: string[]
	types: string[]
	savedBy?: string
	before?: string
	after?: string
	minRead?: number
	maxRead?: number
	sort: SortOption
	page: number
	view?: 'grid' | 'list'
}

const DEFAULTS: BlogFiltersState = {
	q: '',
	tags: [],
	moods: [],
	authors: [],
	languages: [],
	types: [],
	sort: 'newest',
	page: 1,
	view: 'grid',
}

function parseCSV(v: string | null): string[] {
	return v ? v.split(',').filter(Boolean) : []
}

export function useBlogFilters() {
	const router = useRouter()
	const pathname = usePathname()
	const sp = useSearchParams()

	const initial = useMemo<BlogFiltersState>(() => ({
		q: sp.get('q') || '',
		tags: parseCSV(sp.get('tags')),
		moods: parseCSV(sp.get('moods')),
		authors: parseCSV(sp.get('authors')),
		languages: parseCSV(sp.get('languages')),
		types: parseCSV(sp.get('types')),
		savedBy: sp.get('savedBy') || undefined,
		before: sp.get('before') || undefined,
		after: sp.get('after') || undefined,
		minRead: sp.get('minRead') ? Number(sp.get('minRead')) : undefined,
		maxRead: sp.get('maxRead') ? Number(sp.get('maxRead')) : undefined,
		sort: (sp.get('sort') as SortOption) || 'newest',
		page: sp.get('page') ? Number(sp.get('page')) : 1,
		view: (sp.get('view') as 'grid' | 'list') || 'grid',
	}), [sp])

	const [state, setState] = useState<BlogFiltersState>(initial)

	useEffect(() => {
		setState(initial)
	}, [initial])

	const toSearchParams = useCallback((s: BlogFiltersState) => {
		const params = new URLSearchParams()
		if (s.q) params.set('q', s.q)
		if (s.tags.length) params.set('tags', s.tags.join(','))
		if (s.moods.length) params.set('moods', s.moods.join(','))
		if (s.authors.length) params.set('authors', s.authors.join(','))
		if (s.languages.length) params.set('languages', s.languages.join(','))
		if (s.types.length) params.set('types', s.types.join(','))
		if (s.savedBy) params.set('savedBy', s.savedBy)
		if (s.before) params.set('before', s.before)
		if (s.after) params.set('after', s.after)
		if (s.minRead) params.set('minRead', String(s.minRead))
		if (s.maxRead) params.set('maxRead', String(s.maxRead))
		if (s.sort) params.set('sort', s.sort)
		if (s.page && s.page !== 1) params.set('page', String(s.page))
		if (s.view && s.view !== 'grid') params.set('view', s.view)
		return params
	}, [])

	const replaceUrl = useCallback((next: BlogFiltersState) => {
		const params = toSearchParams(next)
		router.replace(`${pathname}?${params.toString()}`)
	}, [pathname, router, toSearchParams])

	const set = useCallback((updater: Partial<BlogFiltersState> | ((prev: BlogFiltersState) => Partial<BlogFiltersState>)) => {
		setState((prev) => {
			const partial = typeof updater === 'function' ? updater(prev) : updater
			const next = { ...prev, ...partial, page: partial.page ?? 1 }
			replaceUrl(next)
			return next
		})
	}, [replaceUrl])

	const clearAll = useCallback(() => {
		setState(DEFAULTS)
		replaceUrl(DEFAULTS)
	}, [replaceUrl])

	return { state, set, clearAll }
}

export function buildApiParams(state: BlogFiltersState): URLSearchParams {
	const p = new URLSearchParams()
	if (state.q) p.set('search', state.q)
	if (state.tags.length) p.set('tags', state.tags.join(','))
	if (state.moods.length) p.set('moods', state.moods.join(','))
	if (state.authors.length) p.set('authors', state.authors.join(','))
	if (state.languages.length) p.set('languages', state.languages.join(','))
	if (state.types.length) p.set('types', state.types.join(','))
	if (state.savedBy) p.set('savedBy', state.savedBy)
	if (state.before) p.set('before', state.before)
	if (state.after) p.set('after', state.after)
	if (state.minRead) p.set('minRead', String(state.minRead))
	if (state.maxRead) p.set('maxRead', String(state.maxRead))
	p.set('sortBy', state.q ? (state.sort === 'relevance' ? 'relevance' : state.sort) : state.sort === 'relevance' ? 'newest' : state.sort)
	p.set('page', String(state.page))
	return p
}

export function useTypeahead(fetcher: (q: string) => Promise<string[]>) {
	const [q, setQ] = useState('')
	const [items, setItems] = useState<string[]>([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const id = setTimeout(async () => {
			if (!q) {
				setItems([])
				return
			}
			setLoading(true)
			try {
				const res = await fetcher(q)
				setItems(res)
			} finally {
				setLoading(false)
			}
		}, 200)
		return () => clearTimeout(id)
	}, [q, fetcher])

	return { q, setQ, items, loading }
}


