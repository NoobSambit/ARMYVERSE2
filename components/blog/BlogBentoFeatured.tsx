'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface BlogLite {
  _id: string
  title: string
  content?: string
  coverImage?: string | null
  createdAt: string
  author: { id: string; name: string; avatar?: string | null }
  readTime?: number
  tags: string[]
  mood: string
}

export default function BlogBentoFeatured() {
  const [items, setItems] = useState<BlogLite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const params = new URLSearchParams({ page: '1', limit: '6', sortBy: 'trending7d', status: 'published' })
        const res = await fetch(`/api/blogs?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to fetch featured')
        const data = await res.json()
        if (active) setItems(data.blogs || [])
      } catch (e) {
        console.error('Failed to fetch featured posts:', e)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  // Always show the bento grid layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 md:h-[400px] lg:h-[500px] mb-6 md:mb-12">
      {/* Hero Card */}
      {loading ? (
        <div className="md:col-span-2 md:row-span-2 rounded-2xl md:rounded-3xl h-48 md:h-auto bg-card-dark/60 animate-pulse" />
      ) : items[0] ? (
        <Link
          href={`/blogs/${items[0]._id}`}
          className="md:col-span-2 md:row-span-2 group relative rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer h-48 md:h-auto"
        >
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
               style={{ backgroundImage: items[0].coverImage ? `url(${items[0].coverImage})` : 'linear-gradient(135deg, #9054f8 0%, #f854a8 100%)' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent" />
          <div className="absolute top-3 left-3 md:top-4 md:left-4">
            <span className="bg-primary/90 text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
              Featured
            </span>
          </div>
          <div className="absolute bottom-0 left-0 p-4 md:p-8 w-full">
            <div className="flex items-center gap-1.5 md:gap-2 text-white/80 text-[10px] md:text-sm mb-2 md:mb-3">
              {items[0].author.avatar && (
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-cover flex-shrink-0" style={{ backgroundImage: `url(${items[0].author.avatar})` }} />
              )}
              <span className="truncate">By {items[0].author.name}</span>
              <span className="w-1 h-1 rounded-full bg-white/50 flex-shrink-0" />
              <span className="flex-shrink-0">{items[0].readTime || 5} min read</span>
            </div>
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-white leading-tight mb-1 md:mb-2 group-hover:text-primary transition-colors line-clamp-2 md:line-clamp-none">
              {items[0].title}
            </h2>
            {items[0].content && (
              <p className="text-white/70 text-xs md:text-sm line-clamp-2 mb-2 md:mb-4 max-w-lg hidden md:block">
                {items[0].content.replace(/<[^>]*>/g, '').slice(0, 150)}...
              </p>
            )}
          </div>
        </Link>
      ) : (
        <div className="md:col-span-2 md:row-span-2 rounded-2xl md:rounded-3xl h-48 md:h-auto bg-card-dark/30 border border-white/5 flex items-center justify-center">
          <p className="text-white/30 text-xs md:text-sm">No featured post</p>
        </div>
      )}

      {/* Secondary Card 1 (Vertical) */}
      {loading ? (
        <div className="md:col-span-1 md:row-span-2 rounded-2xl md:rounded-3xl h-48 md:h-auto bg-card-dark/60 animate-pulse" />
      ) : items[1] ? (
        <Link
          href={`/blogs/${items[1]._id}`}
          className="md:col-span-1 md:row-span-2 group relative rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer bg-card-dark border border-white/5 h-48 md:h-auto flex md:block"
        >
          <div className="w-1/3 md:w-full md:h-1/2 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 flex-shrink-0"
               style={{ backgroundImage: items[1].coverImage ? `url(${items[1].coverImage})` : 'linear-gradient(135deg, #f854a8 0%, #9054f8 100%)' }} />
          <div className="p-3 md:p-5 flex flex-col flex-1 md:h-1/2 justify-between relative z-10 bg-card-dark">
            <div>
              <span className="text-accent-pink text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 md:mb-2 block">
                {items[1].mood}
              </span>
              <h3 className="text-sm md:text-base lg:text-xl font-bold text-white mb-1 md:mb-2 group-hover:text-primary transition-colors line-clamp-2 md:line-clamp-3">
                {items[1].title}
              </h3>
            </div>
            <div className="flex items-center justify-between mt-2 md:mt-4 border-t border-white/10 pt-2 md:pt-4">
              <span className="text-[10px] md:text-xs text-white/50">
                {new Date(items[1].createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Link>
      ) : (
        <div className="md:col-span-1 md:row-span-2 rounded-2xl md:rounded-3xl h-48 md:h-auto bg-card-dark/30 border border-white/5 flex items-center justify-center">
          <p className="text-white/30 text-[10px] md:text-xs">No post</p>
        </div>
      )}

      {/* Secondary Card 2 */}
      {loading ? (
        <div className="md:col-span-1 md:row-span-1 rounded-2xl md:rounded-3xl h-32 md:h-auto bg-card-dark/60 animate-pulse" />
      ) : items[2] ? (
        <Link
          href={`/blogs/${items[2]._id}`}
          className="md:col-span-1 md:row-span-1 group relative rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer bg-card-dark border border-white/5 flex flex-col justify-end h-32 md:h-auto"
        >
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-40"
               style={{ backgroundImage: items[2].coverImage ? `url(${items[2].coverImage})` : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent" />
          <div className="relative p-3 md:p-5 z-10">
            <span className="bg-white/10 backdrop-blur-md text-white text-[8px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-full mb-1 md:mb-2 inline-block">
              {items[2].tags[0] || 'Article'}
            </span>
            <h3 className="text-sm md:text-base lg:text-lg font-bold text-white leading-tight line-clamp-2">
              {items[2].title}
            </h3>
          </div>
        </Link>
      ) : (
        <div className="md:col-span-1 md:row-span-1 rounded-2xl md:rounded-3xl h-32 md:h-auto bg-card-dark/30 border border-white/5 flex items-center justify-center">
          <p className="text-white/30 text-[10px] md:text-xs">No post</p>
        </div>
      )}

      {/* Secondary Card 3 - Fan Project (Static or from data) */}
      {loading ? (
        <div className="md:col-span-1 md:row-span-1 rounded-2xl md:rounded-3xl h-32 md:h-auto bg-card-dark/60 animate-pulse" />
      ) : items[3] ? (
        <Link
          href={`/blogs/${items[3]._id}`}
          className="md:col-span-1 md:row-span-1 group relative rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer bg-[#352554] border border-white/5 flex flex-col p-3 md:p-5 justify-center items-center text-center h-32 md:h-auto"
        >
          <div className="mb-2 md:mb-3 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center text-primary">
            <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <h3 className="text-sm md:text-lg font-bold text-white mb-0.5 md:mb-1">Fan Project</h3>
          <p className="text-white/60 text-[10px] md:text-sm hidden md:block">Join the global streaming party!</p>
        </Link>
      ) : (
        <div className="md:col-span-1 md:row-span-1 rounded-2xl md:rounded-3xl h-32 md:h-auto bg-[#352554] border border-white/5 flex flex-col p-3 md:p-5 justify-center items-center text-center opacity-60">
          <div className="mb-2 md:mb-3 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center text-primary">
            <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <h3 className="text-sm md:text-lg font-bold text-white mb-0.5 md:mb-1">Fan Project</h3>
          <p className="text-white/60 text-[10px] md:text-sm hidden md:block">Join the global streaming party!</p>
        </div>
      )}
    </div>
  )
}
