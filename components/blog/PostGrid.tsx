'use client'

import PostCard from './PostCard'

export interface PostGridProps {
	posts: any[]
	view?: 'grid' | 'list'
}

export default function PostGrid({ posts, view = 'grid' }: PostGridProps) {
	if (!posts?.length) return null
	if (view === 'list') {
		return (
			<div className="flex flex-col gap-3">
				{posts.map((p) => (
					<PostCard key={p._id} post={p} variant="list" />
				))}
			</div>
		)
	}
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{posts.map((p) => (
				<PostCard key={p._id} post={p} />
			))}
		</div>
	)
}


