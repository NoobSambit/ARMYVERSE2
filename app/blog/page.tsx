"use client"

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { BookOpen, Edit, ArrowUp } from 'lucide-react'
import PostGrid from '@/components/blog/PostGrid'
import { buildApiParams, useBlogFilters } from '@/hooks/useBlogFilters'
import { track } from '@/lib/utils/analytics'
import MyBlogsPage from '@/app/blogs/my/page'
import CollectionsIndexPage from '@/app/blogs/collections/page'
import BlogBentoFeatured from '@/components/blog/BlogBentoFeatured'
import AuthorSpotlight from '@/components/blog/AuthorSpotlight'
import TrendingTopics from '@/components/blog/TrendingTopics'
import BlogStatsDashboard from '@/components/blog/BlogStatsDashboard'

interface Blog {
  _id: string
  title: string
  content: string
  tags: string[]
  mood: string
  coverImage?: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
  status: 'draft' | 'published'
  reactions: {
    moved: number
    loved: number
    surprised: number
  }
  comments: Array<{
    userId: string
    name: string
    content: string
    createdAt: string
  }>
  savedBy: string[]
  readTime: number
  views: number
}

export default function Blog() {
  const router = useRouter()
  const sp = useSearchParams()
  const section = (sp.get('section') || 'explore') as 'explore' | 'my' | 'collections'
  const filters = useBlogFilters()
  const { state, set } = filters
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const fetchBlogs = useCallback(async () => {
    if (section !== 'explore') return
    try {
      const params = buildApiParams(state)
      params.set('limit', '12')
      params.set('status', 'published')

      const response = await fetch(`/api/blogs?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch blogs')
      }

      const data = await response.json()
      if ((!data.blogs || data.blogs.length === 0) && !state.q && state.tags.length === 0 && state.moods.length === 0) {
        const fallback = await fetch(`/api/blogs?page=1&limit=12&status=all&sortBy=${state.sort}`)
        if (fallback.ok) {
          const f = await fallback.json()
          if (state.page === 1) setBlogs(f.blogs)
          else setBlogs(prev => [...prev, ...f.blogs])
          setHasMore(f.pagination?.hasNext ?? false)
          return
        }
      }

      if (state.page === 1) setBlogs(data.blogs)
      else setBlogs(prev => [...prev, ...data.blogs])
      setHasMore(data.pagination.hasNext)
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }, [section, state])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  const allTags = useMemo(() => Array.from(new Set(blogs.flatMap(blog => blog.tags))), [blogs])
  const filteredBlogs = blogs

  const loadMore = () => {
    if (hasMore && !loading) {
      set({ page: state.page + 1 })
      track('pagination_load_more', { page: state.page + 1 })
    }
  }

  const onSelectSection = (next: 'explore' | 'my' | 'collections') => {
    const params = new URLSearchParams(sp.toString())
    if (next === 'explore') params.delete('section')
    else params.set('section', next)
    router.replace(`/blog?${params.toString()}`)
  }

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="relative min-h-screen pb-20">
      {/* Background Gradient Mesh */}
      <div className="fixed top-0 left-0 w-full h-[400px] md:h-[600px] bg-gradient-to-b from-primary/10 via-background-dark to-background-dark -z-10 pointer-events-none" />
      <div className="fixed top-[-10%] right-[-5%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed top-[20%] left-[-10%] w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-accent-pink/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8">
        {/* Breadcrumbs & Stats Dashboard Row */}
        <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-primary/70 mb-1.5 md:mb-2">
              <Link className="hover:text-white" href="/">Home</Link>
              <span className="text-white/50">›</span>
              <span className="text-white font-medium">The Archive</span>
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-white mb-1.5 md:mb-2">
              The BTS Archive
            </h1>
            <p className="text-white/60 text-sm md:text-base max-w-lg">Explore fan theories, concert reviews, and deep dives into the lore.</p>
          </div>
          <BlogStatsDashboard />
        </div>

        {/* Sticky Sub-Nav */}
        <div className="sticky top-16 z-40 bg-background-dark/80 backdrop-blur-xl border-b border-white/5 py-2 md:py-3 mb-6 md:mb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide flex-1 -mx-2 px-2">
              <button
                onClick={() => onSelectSection('explore')}
                className={`text-xs md:text-sm font-medium px-1 py-2 transition-colors border-b-2 whitespace-nowrap ${
                  section === 'explore'
                    ? 'text-white border-primary'
                    : 'text-white/60 hover:text-white border-transparent'
                }`}
              >
                Discover
              </button>
              <button
                onClick={() => onSelectSection('my')}
                className={`text-xs md:text-sm font-medium px-1 py-2 transition-colors border-b-2 flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${
                  section === 'my'
                    ? 'text-white border-primary'
                    : 'text-white/60 hover:text-white border-transparent'
                }`}
              >
                My Saved
                <span className="bg-white/10 text-white text-[8px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded-full">4</span>
              </button>
              <button
                onClick={() => onSelectSection('collections')}
                className={`text-xs md:text-sm font-medium px-1 py-2 transition-colors border-b-2 whitespace-nowrap ${
                  section === 'collections'
                    ? 'text-white border-primary'
                    : 'text-white/60 hover:text-white border-transparent'
                }`}
              >
                Following
              </button>
            </div>
            <Link
              href="/blogs/create"
              className="hidden md:flex bg-primary hover:bg-primary-dark text-white rounded-full pl-4 pr-5 py-2 items-center gap-2 text-sm font-bold transition-all shadow-lg shadow-primary/25"
            >
              <Edit className="w-5 h-5" />
              Start Writing
            </Link>
          </div>
        </div>

        {section === 'explore' && (
          <>
            {/* Bento Grid Featured Section */}
            <BlogBentoFeatured />

            {/* Author Spotlight Carousel */}
            <AuthorSpotlight />

            {/* Trending Topics & Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8 mb-6 md:mb-8 items-start">
              <TrendingTopics filters={filters} allTags={allTags} />
            </div>

            {/* Main Post Grid */}
            <div>
              {loading && state.page === 1 ? (
                <div className="text-center py-8 md:py-12">
                  <div className="flex flex-col items-center justify-center gap-3 opacity-60">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs font-medium text-white/50 tracking-widest uppercase">Loading stories</span>
                  </div>
                </div>
              ) : filteredBlogs.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-2">No blogs found</h3>
                  <p className="text-gray-400 text-sm md:text-base">Try adjusting your search criteria or filters</p>
                </div>
              ) : (
                <PostGrid posts={filteredBlogs} view={state.view} />
              )}

              {/* Load More */}
              {hasMore && (
                <div className="flex flex-col items-center justify-center py-8 md:py-12 gap-3">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="btn-glass-secondary w-full max-w-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    onMouseDown={(e) => e.currentTarget.classList.add('pulse-once')}
                    onAnimationEnd={(e) => e.currentTarget.classList.remove('pulse-once')}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                  <div className="flex gap-1 opacity-60">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs font-medium text-white/50 tracking-widest uppercase">Loading more stories</span>
                </div>
              )}
            </div>
          </>
        )}

        {section === 'my' && (
          <div className="py-2">
            <MyBlogsPage />
          </div>
        )}

        {section === 'collections' && (
          <div className="py-2">
            <CollectionsIndexPage />
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-12 h-12 md:w-14 md:h-14 bg-white text-background-dark rounded-full shadow-lg shadow-white/20 flex items-center justify-center hover:scale-110 transition-transform z-50 group"
        >
          <ArrowUp className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </main>
  )
}
