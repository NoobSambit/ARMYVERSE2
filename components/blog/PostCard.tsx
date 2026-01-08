'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Eye, Heart, User, MoreVertical, RotateCcw, PlusCircle, Upload, CircleSlash, BookmarkPlus } from 'lucide-react'
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

function getMoodColor(mood: string): string {
	const moodColors: Record<string, string> = {
		emotional: 'text-primary bg-primary/10',
		fun: 'text-accent-pink bg-accent-pink/10',
		hype: 'text-yellow-500 bg-yellow-500/10',
		chill: 'text-blue-400 bg-blue-400/10',
		romantic: 'text-pink-400 bg-pink-400/10',
		energetic: 'text-orange-400 bg-orange-400/10'
	}
	return moodColors[mood] || 'text-primary bg-primary/10'
}

export default function PostCard({ post, variant = 'grid' }: PostCardProps) {
	const { user } = useAuth()
	const isOwner = !!user && post.author?.id && user.uid === post.author.id
	const [menuOpen, setMenuOpen] = useState(false)
	const [collectionsOpen, setCollectionsOpen] = useState(false)
	const [myCollections, setMyCollections] = useState<Array<{ slug: string; title: string }>>([])
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
	const [isSaved, setIsSaved] = useState(false)
	const [isLiked, setIsLiked] = useState(false)

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
	const moodColorClass = getMoodColor(post.mood)

	const handleSave = async (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (!user) return

		try {
			const response = await fetch(`/api/blogs/${post._id}/save`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			})
			if (response.ok) {
				setIsSaved(!isSaved)
				track('blog_saved', { id: post._id, saved: !isSaved })
			}
		} catch (error) {
			console.error('Failed to save blog:', error)
		}
	}

	const handleLike = async (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (!user) return

		try {
			const response = await fetch(`/api/blogs/${post._id}/reactions`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ reactionType: 'loved' })
			})
			if (response.ok) {
				setIsLiked(!isLiked)
				track('blog_reaction', { id: post._id, type: 'loved' })
			}
		} catch (error) {
			console.error('Failed to like blog:', error)
		}
	}

	return (
		<article className={`group glass-panel rounded-xl md:rounded-[2rem] p-2 md:p-3 hover:bg-white/5 transition-all duration-300 border-transparent hover:border-primary/20 ${variant === 'list' ? 'flex gap-3 md:gap-4' : ''}`}>
			<Link href={`/blogs/${post._id}`} onClick={() => track('card_click', { id: post._id })} className="block group focus:outline-none focus:ring-2 focus:ring-purple-500">
				<div className={`relative h-40 md:h-52 lg:h-56 rounded-xl md:rounded-[1.5rem] overflow-hidden mb-3 md:mb-4`}>
					{post.coverImage ? (
						<Image src={post.coverImage} alt={post.title} fill priority={false} sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
					) : (
						<div className="w-full h-full bg-gradient-to-tr from-primary/30 to-accent-pink/30" />
					)}

					{/* Live indicator for trending posts */}
					{post.views && post.views > 1000 && (
						<div className="absolute top-2 right-2 md:top-3 md:right-3 flex gap-2">
							<div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
						</div>
					)}

					{/* Hover actions */}
					<div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 flex gap-1.5 md:gap-2">
						<button
							onClick={handleSave}
							className="w-7 h-7 md:w-8 md:h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-primary transition-colors"
						>
							<BookmarkPlus className="w-3.5 h-3.5 md:w-4 md:h-4" />
						</button>
						<button
							onClick={handleLike}
							className="w-7 h-7 md:w-8 md:h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-accent-pink transition-colors"
						>
							<Heart className="w-3.5 h-3.5 md:w-4 md:h-4" />
						</button>
					</div>
				</div>

				<div className="px-1.5 md:px-2 pb-2">
					<div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
						<span className={`text-[10px] md:text-xs font-bold ${moodColorClass} px-1.5 md:px-2 py-0.5 md:py-1 rounded-full capitalize`}>
							{post.mood}
						</span>
						<span className="text-[10px] md:text-xs text-white/40">•</span>
						<span className="text-[10px] md:text-xs text-white/40">{post.readTime || 5} min read</span>
					</div>

					<h3 className={`text-base md:text-lg xl:text-xl font-bold text-white mb-1 md:mb-2 leading-tight group-hover:text-primary transition-colors ${variant === 'list' ? 'text-sm md:text-base line-clamp-1' : 'line-clamp-2 md:line-clamp-none'}`}>
						{post.title}
					</h3>

					{variant !== 'list' && (
						<p className="text-white/60 text-xs md:text-sm mb-2 md:mb-4 line-clamp-2 hidden md:block">
							{excerpt}...
						</p>
					)}

					<div className="flex items-center justify-between border-t border-white/5 pt-2 md:pt-3 mt-auto">
						<div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
							{post.author?.id ? (
								<button
									onClick={(e) => {
										e.preventDefault()
										e.stopPropagation()
										setSelectedUserId(post.author!.id!)
									}}
									className="inline-flex items-center hover:text-purple-400 transition-colors group/author min-w-0"
								>
									{post.author.avatar ? (
										<div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-cover mr-1.5 md:mr-2 flex-shrink-0" style={{ backgroundImage: `url(${post.author.avatar})` }} />
									) : (
										<User className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" />
									)}
									<span className="text-xs md:text-sm text-white/80 font-medium group-hover/author:text-primary truncate">
										{post.author.name || 'Unknown'}
									</span>
								</button>
							) : (
								<span className="inline-flex items-center min-w-0">
									<User className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-1 flex-shrink-0" />
									<span className="text-xs md:text-sm text-white/80 font-medium truncate">{post.author?.name || 'Unknown'}</span>
								</span>
							)}
						</div>

						<div className="flex items-center gap-2 md:gap-3 text-white/40 text-[10px] md:text-xs flex-shrink-0">
							<span className="flex items-center gap-0.5 md:gap-1">
								<Eye className="w-3 h-3 md:w-4 md:h-4" />
								<span className="hidden sm:inline">{formatNumber(post.views || 0)}</span>
							</span>
							<span className="flex items-center gap-0.5 md:gap-1">
								<Heart className="w-3 h-3 md:w-4 md:h-4" />
								<span className="hidden sm:inline">{formatNumber(totalReactions)}</span>
							</span>
						</div>
					</div>
				</div>
			</Link>

			{isOwner && (
				<div className="absolute right-1.5 top-1.5 md:right-2 md:top-2">
					<button
						aria-label="Owner actions"
						className="p-1.5 md:p-2 rounded-full bg-black/40 border border-white/10 text-white hover:bg-white/10"
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							setMenuOpen(v => !v)
						}}
					>
						<MoreVertical className="w-3 h-3 md:w-4 md:h-4" />
					</button>
					{menuOpen && (
						<div role="menu" className="mt-1.5 md:mt-2 w-48 md:w-56 rounded-lg md:rounded-xl bg-[#0B0912]/95 border border-white/10 shadow-2xl p-1 text-white absolute right-0 z-50">
							<Link href={`/blogs/${post._id}/edit`} className="block px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl hover:bg-white/10 text-white text-xs md:text-sm">Edit</Link>
							<button className="w-full text-left px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl hover:bg-white/10 flex items-center gap-1.5 md:gap-2 text-white text-xs md:text-sm" onClick={async (e) => { e.preventDefault(); e.stopPropagation(); const publish = confirm('Publish this post?'); if (!publish) return; await fetch(`/api/blogs/${post._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'published' }) }); track('blog_published', { id: post._id }); setMenuOpen(false) }}>
								<Upload className="w-3 h-3 md:w-4 md:h-4" /> Publish
							</button>
							<button className="w-full text-left px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl hover:bg-white/10 flex items-center gap-1.5 md:gap-2 text-white text-xs md:text-sm" onClick={async (e) => { e.preventDefault(); e.stopPropagation(); const unpub = confirm('Unpublish this post?'); if (!unpub) return; await fetch(`/api/blogs/${post._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'draft' }) }); track('blog_unpublished', { id: post._id }); setMenuOpen(false) }}>
								<CircleSlash className="w-3 h-3 md:w-4 md:h-4" /> Unpublish
							</button>
							<button className="w-full text-left px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl hover:bg-white/10 flex items-center gap-1.5 md:gap-2 text-white text-xs md:text-sm" onClick={async (e) => { e.preventDefault(); e.stopPropagation(); if (post.isDeleted) { await fetch(`/api/blogs/${post._id}/restore`, { method: 'POST' }); track('blog_restored', { id: post._id }) } else { await fetch(`/api/blogs/${post._id}`, { method: 'DELETE' }); track('blog_deleted', { id: post._id }) } setMenuOpen(false) }}>
								{post.isDeleted ? <RotateCcw className="w-3 h-3 md:w-4 md:h-4" /> : null}
								{post.isDeleted ? 'Restore' : 'Delete'}
							</button>
							<button className="w-full text-left px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl hover:bg-white/10 flex items-center gap-1.5 md:gap-2 text-xs md:text-sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCollectionsOpen(v => !v) }}>
								<PlusCircle className="w-3 h-3 md:w-4 md:h-4" /> Add to collection
							</button>
							{collectionsOpen && (
								<div className="mt-1 max-h-60 overflow-auto text-white">
									{myCollections.length === 0 ? (
										<div className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-xs text-gray-400">No collections yet</div>
									) : myCollections.map(c => (
										<button key={c.slug} className="w-full text-left px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl hover:bg-white/10 text-[10px] md:text-xs" onClick={async (e) => { e.preventDefault(); e.stopPropagation(); await fetch(`/api/collections/${encodeURIComponent(c.slug)}/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add', postId: post._id }) }); track('blog_added_to_collection', { id: post._id, collection: c.slug }); setMenuOpen(false); setCollectionsOpen(false) }}>{c.title}</button>
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
