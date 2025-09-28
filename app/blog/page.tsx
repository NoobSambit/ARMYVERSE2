"use client"

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { BookOpen, Plus } from 'lucide-react'
import PostGrid from '@/components/blog/PostGrid'
import FilterBar from '@/components/blog/FilterBar'
import { buildApiParams, useBlogFilters } from '@/hooks/useBlogFilters'
import FeaturedPosts from '@/components/blog/FeaturedPosts'
import { track } from '@/lib/utils/analytics'
import MyBlogsPage from '@/app/blogs/my/page'
import CollectionsIndexPage from '@/app/blogs/collections/page'

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

  // remove duplicate legacy function
  /* const fetchBlogsLegacy = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        status: 'published'
      })

      if (searchQuery) params.append('search', searchQuery)
      if (selectedMood) params.append('mood', selectedMood)
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','))
      if (sortBy) params.append('sortBy', sortBy)

      const response = await fetch(`/api/blogs?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch blogs')
      }

      const data = await response.json()
      // Ensure we include both published and any legacy drafts the user might have
      // The API defaults to published, but if none are returned and filters are empty, try 'all'
      if ((!data.blogs || data.blogs.length === 0) && !searchQuery && !selectedMood && selectedTags.length === 0) {
        const fallback = await fetch(`/api/blogs?page=1&limit=12&status=all&sortBy=${sortBy}`)
        if (fallback.ok) {
          const f = await fallback.json()
          if (page === 1) setBlogs(f.blogs)
          else setBlogs(prev => [...prev, ...f.blogs])
          setHasMore(f.pagination?.hasNext ?? false)
          return
        }
      }
      
      if (page === 1) {
        setBlogs(data.blogs)
      } else {
        setBlogs(prev => [...prev, ...data.blogs])
      }
      
      setHasMore(data.pagination.hasNext)
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  } */


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

  return (
    <div className="min-h-screen page-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-[#A78BFA] to-[#D946EF] bg-clip-text text-transparent tracking-tight">
                ARMYVERSE Blog
              </h1>
              <p className="mt-2 text-[#B6B3C7]">In-depth writing on BTS, music, and the ARMY community.</p>
            </div>
            {/* Moved primary action to sub-navigation for better alignment */}
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="sticky top-[64px] z-30 mb-6">
          <div className="glass-panel px-3 sm:px-4 py-2 sm:py-2 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="overflow-x-auto">
              <div className="segmented min-w-[312px] sm:min-w-[360px]" role="tablist" aria-label="Blog sections">
                <div className="segmented-thumb" style={{ left: '2px', width: 'calc(33.33% - 3px)', transform: section === 'my' ? 'translateX(100%)' : section === 'collections' ? 'translateX(200%)' : 'translateX(0)' }} />
                <button role="tab" aria-selected={section==='explore'} className="segmented-item whitespace-nowrap px-4" onClick={() => onSelectSection('explore')}>Explore</button>
                <button role="tab" aria-selected={section==='my'} className="segmented-item whitespace-nowrap px-4" onClick={() => onSelectSection('my')}>My Blogs</button>
                <button role="tab" aria-selected={section==='collections'} className="segmented-item whitespace-nowrap px-4" onClick={() => onSelectSection('collections')}>Collections</button>
              </div>
            </div>
            <div className="ml-auto">
              <Link href="/blogs/create" className="btn-glass-primary hidden xs:inline-flex">
                <span className="inline-flex items-center gap-2"><Plus className="w-5 h-5" />Start writing</span>
              </Link>
            </div>
          </div>
        </div>

        {section === 'explore' && (
          <>
            <FeaturedPosts />
            <FilterBar filters={filters} allTags={allTags} />
            {/* Blog Posts */}
            <div>
              {loading && state.page === 1 ? (
                <div className="text-center py-12">
                  <div className="text-white text-xl">Loading blogs...</div>
                </div>
              ) : filteredBlogs.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No blogs found</h3>
                  <p className="text-gray-400">Try adjusting your search criteria or filters</p>
                </div>
              ) : (
                <PostGrid posts={filteredBlogs} view={state.view} />
              )}

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="btn-glass-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    onMouseDown={(e) => (e.currentTarget.classList.add('pulse-once'))}
                    onAnimationEnd={(e) => (e.currentTarget.classList.remove('pulse-once'))}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
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
    </div>
  )
}