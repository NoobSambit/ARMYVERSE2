'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock, Eye, Heart, User, MoreVertical, RotateCcw, PlusCircle, Upload, CircleSlash } from 'lucide-react'
import { track } from '@/lib/utils/analytics'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import ProfileViewModal from '@/components/profile/ProfileViewModal'

export interface PostCardProps {
	post: {
		_id: string
		title: string
			content?: string
		coverImage?: string | null
		mood: string
		tags: string[]
		createdAt: string
		readTime?: number
		views?: number
		reactions?: { moved?: number; loved?: number; surprised?: number }
			author?: { id?: string; name?: string; avatar?: string | null }
			isDeleted?: boolean
	}
	variant?: 'grid' | 'list'
}

function formatNumber(num: number = 0): string {
	if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
	if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
	return String(num)
}

export default function PostCard({ post, variant = 'grid' }: PostCardProps) {
	const { user } = useAuth()
	const isOwner = !!user && post.author?.id && user.uid === post.author.id
	const [menuOpen, setMenuOpen] = useState(false)
	const [collectionsOpen, setCollectionsOpen] = useState(false)
	const [myCollections, setMyCollections] = useState<Array<{ slug: string; title: string }>>([])
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

	useEffect(() => {
		if (isOwner && collectionsOpen && user) {
			fetch(`/api/collections?ownerId=${encodeURIComponent(user.uid)}&limit=100`)
				.then(r => r.json())
				.then(data => {
					const cols = (data?.collections || []).map((c: any) => ({ slug: c.slug, title: c.title }))
					setMyCollections(cols)
				})
				.catch(() => {})
		}
	}, [isOwner, collectionsOpen, user])
	const totalReactions = (post.reactions?.moved || 0) + (post.reactions?.loved || 0) + (post.reactions?.surprised || 0)
	const safeContent = typeof post.content === 'string' ? post.content : ''
	const excerpt = safeContent.replace(/<[^>]*>/g, '').slice(0, 160)

	return (
		<article className={`bg-[#0F0B16]/70 border border-[#A78BFA1A] rounded-2xl overflow-hidden transition shadow-[0_1px_0_0_#FFFFFF08,0_12px_24px_-12px_#8B5CF633] ${variant === 'list' ? 'flex gap-4 p-4' : 'p-0'}`}>
			<Link href={`/blogs/${post._id}`} onClick={() => track('card_click', { id: post._id })} className="block group focus:outline-none focus:ring-2 focus:ring-purple-500">
				{post.coverImage ? (
					<div className={`${variant === 'list' ? 'w-48 h-32 shrink-0' : 'w-full h-48' } relative overflow-hidden`}>
						<Image src={post.coverImage} alt={post.title} fill priority={false} sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
					</div>
				) : (
					<div className={`${variant === 'list' ? 'w-48 h-32 shrink-0' : 'w-full h-48' } bg-gradient-to-tr from-[#8B5CF6]/30 to-[#D946EF]/30`} />
				)}
				<div className={`${variant === 'list' ? 'py-1' : 'p-5'}`}>
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#A78BFA] capitalize tracking-wide">{post.mood}</span>
						<span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
					</div>
					<h3 className={`font-semibold text-white ${variant === 'list' ? 'text-base line-clamp-1' : 'text-lg line-clamp-2'} group-hover:text-[#A78BFA]`}>{post.title}</h3>
					<p className={`text-[#B6B3C7] ${variant === 'list' ? 'hidden md:line-clamp-2' : 'mt-2 line-clamp-2'}`}>{excerpt}...</p>
					<div className="mt-3 flex items-center justify-between text-sm text-gray-400">
						<div className="flex items-center gap-3">
							{post.author?.id ? (
								<button 
									onClick={(e) => {
										e.preventDefault()
										e.stopPropagation()
										setSelectedUserId(post.author!.id!)
									}}
									className="inline-flex items-center hover:text-purple-400 transition-colors"
								>
									<User className="w-4 h-4 mr-1" />{post.author?.name || 'Unknown'}
								</button>
							) : (
								<span className="inline-flex items-center"><User className="w-4 h-4 mr-1" />{post.author?.name || 'Unknown'}</span>
							)}
							{post.readTime ? (<span className="inline-flex items-center"><Clock className="w-4 h-4 mr-1" />{post.readTime} min</span>) : null}
						</div>
						<div className="flex items-center gap-3">
							<span className="inline-flex items-center"><Eye className="w-4 h-4 mr-1" />{formatNumber(post.views || 0)}</span>
							<span className="inline-flex items-center"><Heart className="w-4 h-4 mr-1" />{formatNumber(totalReactions)}</span>
						</div>
					</div>
				</div>
			</Link>
			{isOwner && (
				<div className="absolute right-2 top-2">
					<button aria-label="Owner actions" className="p-2 rounded-full bg-black/40 border border-white/10 text-white hover:bg-white/10" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(v => !v) }}>
						<MoreVertical className="w-4 h-4" />
					</button>
					{menuOpen && (
						<div role="menu" className="mt-2 w-56 rounded-xl bg-[#0B0912]/95 border border-white/10 shadow-2xl p-1 text-white">
							<Link href={`/blogs/${post._id}/edit`} className="block px-3 py-2 rounded-xl hover:bg-white/10 text-white">Edit</Link>
							<button className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 text-white" onClick={async (e) => { e.preventDefault(); e.stopPropagation(); const publish = confirm('Publish this post?'); if (!publish) return; await fetch(`/api/blogs/${post._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'published' }) }); track('blog_published', { id: post._id }); setMenuOpen(false) }}>
								<Upload className="w-4 h-4" /> Publish
							</button>
							<button className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 text-white" onClick={async (e) => { e.preventDefault(); e.stopPropagation(); const unpub = confirm('Unpublish this post?'); if (!unpub) return; await fetch(`/api/blogs/${post._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'draft' }) }); track('blog_unpublished', { id: post._id }); setMenuOpen(false) }}>
								<CircleSlash className="w-4 h-4" /> Unpublish
							</button>
							<button className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 text-white" onClick={async (e) => { e.preventDefault(); e.stopPropagation(); if (post.isDeleted) { await fetch(`/api/blogs/${post._id}/restore`, { method: 'POST' }); track('blog_restored', { id: post._id }) } else { await fetch(`/api/blogs/${post._id}`, { method: 'DELETE' }); track('blog_deleted', { id: post._id }) } setMenuOpen(false) }}>
								{post.isDeleted ? <RotateCcw className="w-4 h-4" /> : null}
								{post.isDeleted ? 'Restore' : 'Delete'}
							</button>
							<button className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCollectionsOpen(v => !v) }}>
								<PlusCircle className="w-4 h-4" /> Add to collection
							</button>
							{collectionsOpen && (
								<div className="mt-1 max-h-60 overflow-auto text-white">
									{myCollections.length === 0 ? (
										<div className="px-3 py-2 text-xs text-gray-400">No collections yet</div>
									) : myCollections.map(c => (
										<button key={c.slug} className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10" onClick={async (e) => { e.preventDefault(); e.stopPropagation(); await fetch(`/api/collections/${encodeURIComponent(c.slug)}/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add', postId: post._id }) }); track('blog_added_to_collection', { id: post._id, collection: c.slug }); setMenuOpen(false); setCollectionsOpen(false) }}>{c.title}</button>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			)}
			
			{/* Profile View Modal */}
			<ProfileViewModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
		</article>
	)
}


