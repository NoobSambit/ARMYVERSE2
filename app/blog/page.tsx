'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  User, 
  ArrowRight, 
  Search,
  Clock,
  Eye,
  Heart,
  Plus
} from 'lucide-react'
import Link from 'next/link'

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

const MOOD_EMOJIS = {
  emotional: '🥹',
  fun: '🎉',
  hype: '🔥',
  chill: '😌',
  romantic: '💜',
  energetic: '⚡'
}

const MOODS = [
  { value: 'emotional', label: '🥹 Emotional' },
  { value: 'fun', label: '🎉 Fun' },
  { value: 'hype', label: '🔥 Hype' },
  { value: 'chill', label: '😌 Chill' },
  { value: 'romantic', label: '💜 Romantic' },
  { value: 'energetic', label: '⚡ Energetic' }
]

export default function Blog() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMood, setSelectedMood] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'mostReacted' | 'mostViewed'>('newest')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchBlogs()
  }, [selectedMood, selectedTags, searchQuery, sortBy, page])

  const fetchBlogs = async () => {
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
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getTotalReactions = (reactions: Blog['reactions']) => {
    return reactions.moved + reactions.loved + reactions.surprised
  }

  const allTags = Array.from(new Set(blogs.flatMap(blog => blog.tags)))

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = searchQuery === '' || 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesMood = selectedMood === '' || blog.mood === selectedMood
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => blog.tags.includes(tag))
    
    return matchesSearch && matchesMood && matchesTags
  })

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="w-8 h-8 text-purple-400 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
              ARMYVERSE Blog
            </h1>
            <BookOpen className="w-8 h-8 text-purple-400 ml-3" />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Discover in-depth articles about BTS, their music, and the global ARMY community
          </p>
          <Link
            href="/blogs/create"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Write Blog Post
          </Link>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-purple-500/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/80 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
              />
            </div>

            {/* Mood Filter */}
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="px-4 py-2 bg-black/80 border border-gray-700 rounded-lg text-white focus:border-purple-400 focus:outline-none"
              aria-label="Filter by mood"
            >
              <option value="">All Moods</option>
              {MOODS.map(mood => (
                <option key={mood.value} value={mood.value}>{mood.label}</option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'mostReacted' | 'mostViewed')}
              className="px-4 py-2 bg-black/80 border border-gray-700 rounded-lg text-white focus:border-purple-400 focus:outline-none"
              aria-label="Sort blogs by"
            >
              <option value="newest">Newest</option>
              <option value="mostReacted">Most Reacted</option>
              <option value="mostViewed">Most Viewed</option>
            </select>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 10).map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTags(prev => 
                    prev.includes(tag) 
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  )
                }}
                className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                  selectedTags.includes(tag)
                    ? 'bg-purple-500 text-white'
                    : 'bg-black/50 text-gray-300 border border-gray-600 hover:border-purple-400'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Blog Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading && page === 1 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog, index) => (
                <motion.article
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                >
                  {/* Cover Image */}
                  {blog.coverImage && (
                    <div className="mb-4">
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Mood Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full flex items-center">
                      {MOOD_EMOJIS[blog.mood as keyof typeof MOOD_EMOJIS]} {blog.mood}
                    </span>
                    <span className="text-gray-400 text-sm">{formatDate(blog.createdAt)}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 hover:text-purple-400 transition-colors cursor-pointer">
                    <Link href={`/blogs/${blog._id}`}>
                      {blog.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-400 mb-4 leading-relaxed line-clamp-3">
                    {blog.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {blog.author.name}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {blog.readTime} min read
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {formatNumber(blog.views)}
                      </span>
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {formatNumber(getTotalReactions(blog.reactions))}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link 
                      href={`/blogs/${blog._id}`}
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}