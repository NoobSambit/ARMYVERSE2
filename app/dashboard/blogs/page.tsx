'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Plus,
  Bookmark,
  Clock,
  User,
  Sparkles,
  Search
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

export default function UserBlogsDashboard() {
  const { user } = useAuth()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [savedBlogs, setSavedBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'published' | 'drafts' | 'saved'>('published')
  const [searchQuery, setSearchQuery] = useState('')

  // Get user ID from Firebase auth
  const userId = user?.uid || user?.email || 'user123'

  useEffect(() => {
    fetchUserBlogs()
  }, [activeTab])

  const fetchUserBlogs = async () => {
    try {
      setLoading(true)
      
      if (activeTab === 'saved') {
        // Fetch saved blogs
        const response = await fetch(`/api/blogs?status=published&savedBy=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setSavedBlogs(data.blogs)
        }
      } else {
        // Fetch user's blogs
        const response = await fetch(`/api/blogs?status=${activeTab}&authorId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setBlogs(data.blogs)
        }
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return

    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove from state
        if (activeTab === 'saved') {
          setSavedBlogs(prev => prev.filter(blog => blog._id !== blogId))
        } else {
          setBlogs(prev => prev.filter(blog => blog._id !== blogId))
        }
      }
    } catch (error) {
      console.error('Error deleting blog:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTotalReactions = (reactions: Blog['reactions']) => {
    return reactions.moved + reactions.loved + reactions.surprised
  }

  const filteredBlogs = (activeTab === 'saved' ? savedBlogs : blogs).filter(blog => {
    if (!searchQuery) return true
    return blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a082a] to-[#3a1d5c]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">My Blog Dashboard</h1>
          <p className="text-xl text-gray-300">Manage your BTS blog posts</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-purple-500/20"
        >
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/80 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
              />
            </div>
            <Link
              href="/blogs/create"
              className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Blog
            </Link>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-purple-500/20"
        >
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('published')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'published'
                  ? 'bg-purple-500 text-white'
                  : 'bg-black/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Eye className="w-4 h-4 mr-2 inline" />
              Published ({blogs.filter(b => b.status === 'published').length})
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'drafts'
                  ? 'bg-purple-500 text-white'
                  : 'bg-black/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <EyeOff className="w-4 h-4 mr-2 inline" />
              Drafts ({blogs.filter(b => b.status === 'draft').length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'saved'
                  ? 'bg-purple-500 text-white'
                  : 'bg-black/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Bookmark className="w-4 h-4 mr-2 inline" />
              Saved ({savedBlogs.length})
            </button>
          </div>

          {/* Blog List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-white text-xl">Loading...</div>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {activeTab === 'published' && 'No published blogs'}
                {activeTab === 'drafts' && 'No draft blogs'}
                {activeTab === 'saved' && 'No saved blogs'}
              </h3>
              <p className="text-gray-400 mb-4">
                {activeTab === 'published' && 'Start writing to see your published blogs here'}
                {activeTab === 'drafts' && 'Your draft blogs will appear here'}
                {activeTab === 'saved' && 'Blogs you save will appear here'}
              </p>
              {activeTab !== 'saved' && (
                <Link
                  href="/blogs/create"
                  className="inline-flex items-center px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Blog
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog, index) => (
                <motion.article
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-black/30 rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                >
                  {/* Cover Image */}
                  {blog.coverImage && (
                    <div className="mb-4">
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm flex items-center ${
                      blog.status === 'published' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {blog.status === 'published' ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                      {blog.status}
                    </span>
                    <span className="text-gray-400 text-sm">{formatDate(blog.createdAt)}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
                    {blog.title}
                  </h3>

                  {/* Mood */}
                  <div className="flex items-center mb-4">
                    <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
                    <span className="text-sm text-gray-300">
                      {MOOD_EMOJIS[blog.mood as keyof typeof MOOD_EMOJIS]} {blog.mood}
                    </span>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {blog.readTime} min
                      </span>
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {blog.views} views
                      </span>
                    </div>
                    <span className="flex items-center">
                      <Bookmark className="w-4 h-4 mr-1" />
                      {getTotalReactions(blog.reactions)} reactions
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {blog.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Link
                        href={`/blogs/${blog._id}`}
                        className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all text-sm"
                      >
                        View
                      </Link>
                      {activeTab !== 'saved' && (
                        <Link
                          href={`/blogs/${blog._id}/edit`}
                          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all text-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                                         {activeTab !== 'saved' && (
                       <button
                         onClick={() => handleDeleteBlog(blog._id)}
                         className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                         title="Delete blog"
                         aria-label={`Delete blog: ${blog.title}`}
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     )}
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
} 