'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  Eye,
  Clock,
  User,
  Calendar,
  Tag,
  Sparkles,
  Twitter,
  Instagram
} from 'lucide-react'

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

export default function BlogViewPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [userReactions, setUserReactions] = useState<string[]>([])
  const [userSaved, setUserSaved] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  // Get user ID from session
  const userId = session?.user?.id || session?.user?.email || 'user123'

  useEffect(() => {
    fetchBlog()
  }, [params.id])

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${params.id}`)
      if (!response.ok) {
        throw new Error('Blog not found')
      }
      const data = await response.json()
      setBlog(data)
      setUserSaved(data.savedBy.includes(userId))
    } catch (error) {
      console.error('Error fetching blog:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReaction = async (reactionType: 'moved' | 'loved' | 'surprised') => {
    if (!blog) return

    try {
      const response = await fetch(`/api/blogs/${blog._id}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reactionType }),
      })

      if (response.ok) {
        const { reactions } = await response.json()
        setBlog(prev => prev ? { ...prev, reactions } : null)
        
        // Toggle user reaction
        setUserReactions(prev => 
          prev.includes(reactionType) 
            ? prev.filter(r => r !== reactionType)
            : [...prev, reactionType]
        )
      }
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }

  const handleSave = async () => {
    if (!blog) return

    try {
      const action = userSaved ? 'unsave' : 'save'
      const response = await fetch(`/api/blogs/${blog._id}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action }),
      })

      if (response.ok) {
        setUserSaved(!userSaved)
      }
    } catch (error) {
      console.error('Error saving blog:', error)
    }
  }

  const handleComment = async () => {
    if (!blog || !newComment.trim()) return

    setSubmittingComment(true)
    try {
      const response = await fetch(`/api/blogs/${blog._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          name: session?.user?.name || 'ARMY Commenter',
          content: newComment.trim()
        }),
      })

      if (response.ok) {
        const { comment } = await response.json()
        setBlog(prev => prev ? {
          ...prev,
          comments: [...prev.comments, comment]
        } : null)
        setNewComment('')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const shareToTwitter = () => {
    const url = window.location.href
    const text = blog?.title || 'Check out this BTS blog post!'
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)
  }

  const shareToInstagram = () => {
    // Instagram sharing would require a different approach
    // For now, just copy the URL
    navigator.clipboard.writeText(window.location.href)
    alert('Blog URL copied to clipboard! Share it on Instagram Stories.')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a082a] to-[#3a1d5c] flex items-center justify-center">
        <div className="text-white text-xl">Loading blog...</div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a082a] to-[#3a1d5c] flex items-center justify-center">
        <div className="text-white text-xl">Blog not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a082a] to-[#3a1d5c]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-purple-500/20"
        >
          {/* Cover Image */}
          {blog.coverImage && (
            <div className="mb-6">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {blog.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              {blog.author.name}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(blog.createdAt)}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {blog.readTime} min read
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              {blog.views} views
            </div>
            <div className="flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              {MOOD_EMOJIS[blog.mood as keyof typeof MOOD_EMOJIS]} {blog.mood}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {blog.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Reactions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleReaction('moved')}
                  className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                    userReactions.includes('moved')
                      ? 'bg-purple-500 text-white'
                      : 'bg-black/50 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  💜 {blog.reactions.moved}
                </button>
                <button
                  onClick={() => handleReaction('loved')}
                  className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                    userReactions.includes('loved')
                      ? 'bg-red-500 text-white'
                      : 'bg-black/50 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  😍 {blog.reactions.loved}
                </button>
                <button
                  onClick={() => handleReaction('surprised')}
                  className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                    userReactions.includes('surprised')
                      ? 'bg-yellow-500 text-white'
                      : 'bg-black/50 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  🤯 {blog.reactions.surprised}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Save */}
              <button
                onClick={handleSave}
                className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                  userSaved
                    ? 'bg-purple-500 text-white'
                    : 'bg-black/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                {userSaved ? 'Saved' : 'Save'}
              </button>

              {/* Share */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center px-3 py-2 bg-black/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
                
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-black/90 backdrop-blur-lg rounded-lg p-2 border border-purple-500/20">
                    <button
                      onClick={shareToTwitter}
                      className="flex items-center w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-all"
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </button>
                    <button
                      onClick={shareToInstagram}
                      className="flex items-center w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-all"
                    >
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram Story
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-purple-500/20"
        >
          <div 
            className="prose prose-invert prose-purple max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </motion.div>

        {/* Comments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <MessageCircle className="w-6 h-6 mr-2" />
            Comments ({blog.comments.length})
          </h3>

          {/* Add Comment */}
          <div className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts... 💜"
              className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none resize-none"
              rows={3}
            />
            <button
              onClick={handleComment}
              disabled={!newComment.trim() || submittingComment}
              className="mt-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all disabled:opacity-50"
            >
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {blog.comments.map((comment, index) => (
              <div
                key={index}
                className="bg-black/30 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">{comment.name}</span>
                  <span className="text-sm text-gray-400">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-300">{comment.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
} 