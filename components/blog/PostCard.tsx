'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock, Eye, Heart, User } from 'lucide-react'
import { track } from '@/lib/utils/analytics'

export interface PostCardProps {
	post: {
		_id: string
		title: string
		content: string
		coverImage?: string | null
		mood: string
		tags: string[]
		createdAt: string
		readTime?: number
		views?: number
		reactions?: { moved?: number; loved?: number; surprised?: number }
		author: { name: string; avatar?: string | null }
	}
	variant?: 'grid' | 'list'
}

function formatNumber(num: number = 0): string {
	if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
	if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
	return String(num)
}

export default function PostCard({ post, variant = 'grid' }: PostCardProps) {
	const totalReactions = (post.reactions?.moved || 0) + (post.reactions?.loved || 0) + (post.reactions?.surprised || 0)
	const excerpt = post.content.replace(/<[^>]*>/g, '').slice(0, 160)

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
							<span className="inline-flex items-center"><User className="w-4 h-4 mr-1" />{post.author.name}</span>
							{post.readTime ? (<span className="inline-flex items-center"><Clock className="w-4 h-4 mr-1" />{post.readTime} min</span>) : null}
						</div>
						<div className="flex items-center gap-3">
							<span className="inline-flex items-center"><Eye className="w-4 h-4 mr-1" />{formatNumber(post.views || 0)}</span>
							<span className="inline-flex items-center"><Heart className="w-4 h-4 mr-1" />{formatNumber(totalReactions)}</span>
						</div>
					</div>
				</div>
			</Link>
		</article>
	)
}


