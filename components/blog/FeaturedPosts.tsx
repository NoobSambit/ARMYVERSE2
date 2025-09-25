'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface BlogLite {
	_id: string
	title: string
	coverImage?: string | null
	createdAt: string
	author: { name: string }
	readTime?: number
}

export default function FeaturedPosts() {
	const [items, setItems] = useState<BlogLite[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let active = true
		;(async () => {
			try {
				const params = new URLSearchParams({ page: '1', limit: '4', sortBy: 'trending7d', status: 'published' })
				const res = await fetch(`/api/blogs?${params.toString()}`)
				if (!res.ok) throw new Error('Failed to fetch featured')
				const data = await res.json()
				if (active) setItems(data.blogs || [])
			} catch (e: any) {
				if (active) setError(e?.message || 'Failed to load')
			} finally {
				if (active) setLoading(false)
			}
		})()
		return () => { active = false }
	}, [])

	if (loading) {
		return (
			<div className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-4">
				<div className="lg:col-span-2 h-56 rounded-2xl bg-gray-900/60 animate-pulse" />
				<div className="h-56 rounded-2xl bg-gray-900/60 animate-pulse" />
				<div className="h-56 rounded-2xl bg-gray-900/60 animate-pulse" />
			</div>
		)
	}
	if (error || items.length === 0) return null

	const [primary, ...secondary] = items

	return (
		<div className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-4">
			<Link href={`/blogs/${primary._id}`} className="lg:col-span-2 group relative rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-500/40">
				{primary.coverImage ? (
					<div className="relative h-56">
						<Image src={primary.coverImage} alt={primary.title} fill className="object-cover" />
					</div>
				) : (
					<div className="h-56 bg-gradient-to-tr from-purple-600/30 to-pink-600/30" />
				)}
				<div className="absolute inset-0 bg-black/40" />
				<div className="absolute bottom-0 p-4">
					<h3 className="text-white text-xl font-semibold group-hover:text-purple-200">{primary.title}</h3>
					<p className="text-gray-300 text-sm">By {primary.author.name}{primary.readTime ? ` • ${primary.readTime} min` : ''}</p>
				</div>
			</Link>
			{secondary.map((s) => (
				<Link key={s._id} href={`/blogs/${s._id}`} className="group relative rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-500/40">
					{s.coverImage ? (
						<div className="relative h-56">
							<Image src={s.coverImage} alt={s.title} fill className="object-cover" />
						</div>
					) : (
						<div className="h-56 bg-gradient-to-tr from-purple-600/30 to-pink-600/30" />
					)}
					<div className="absolute inset-0 bg-black/40" />
					<div className="absolute bottom-0 p-3">
						<h4 className="text-white font-semibold line-clamp-2 group-hover:text-purple-200">{s.title}</h4>
					</div>
				</Link>
			))}
		</div>
	)
}


