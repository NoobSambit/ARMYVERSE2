'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import ProfileViewModal from '@/components/profile/ProfileViewModal'
import { 
  MessageCircle, 
  Share2, 
  Bookmark,
  Eye,
  Clock,
  User,
  Calendar,
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
  const router = useRouter()
  const { user } = useAuth()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [userReactions, setUserReactions] = useState<string[]>([])
  const [userSaved, setUserSaved] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // Get user ID from Firebase auth
  const userId = user?.uid || user?.email || 'user123'

  useEffect(() => {
    fetchBlog()
  }, [params.id])

  useEffect(() => {
    if (!blog?.content) return
    if (!blog.content.includes('twitter-tweet')) return

    const scriptId = 'twitter-widgets'
    if (document.getElementById(scriptId)) return

    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://platform.twitter.com/widgets.js'
    script.async = true
    document.body.appendChild(script)
  }, [blog?.content])

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
          name: user?.displayName || user?.email || 'ARMY Commenter',
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
      <div className="min-h-screen editor-light-mode flex items-center justify-center">
        <div className="text-gray-700 text-xl">Loading blog...</div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen editor-light-mode flex items-center justify-center">
        <div className="text-gray-700 text-xl">Blog not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen editor-light-mode">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-light p-8 mb-8"
        >
          {/* Cover Image */}
          {blog.coverImage && (
            <div className="mb-6">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-64 object-cover rounded-xl"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">
            {blog.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
            <button 
              onClick={() => setSelectedUserId(blog.author.id)}
              className="flex items-center hover:text-purple-600 transition-colors"
            >
              <User className="w-4 h-4 mr-2" />
              {blog.author.name}
            </button>
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
                className="tag-chip-light selected text-sm"
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
                  className={`flex items-center px-3 py-2 rounded-xl transition-all ${
                    userReactions.includes('moved')
                      ? 'btn-primary-light text-white'
                      : 'btn-secondary-light text-gray-700'
                  }`}
                >
                  💜 {blog.reactions.moved}
                </button>
                <button
                  onClick={() => handleReaction('loved')}
                  className={`flex items-center px-3 py-2 rounded-xl transition-all ${
                    userReactions.includes('loved')
                      ? 'bg-red-500 text-white'
                      : 'btn-secondary-light text-gray-700'
                  }`}
                >
                  😍 {blog.reactions.loved}
                </button>
                <button
                  onClick={() => handleReaction('surprised')}
                  className={`flex items-center px-3 py-2 rounded-xl transition-all ${
                    userReactions.includes('surprised')
                      ? 'bg-yellow-500 text-white'
                      : 'btn-secondary-light text-gray-700'
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
                className={`flex items-center px-3 py-2 rounded-xl transition-all ${
                  userSaved
                    ? 'btn-primary-light text-white'
                    : 'btn-secondary-light text-gray-700'
                }`}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                {userSaved ? 'Saved' : 'Save'}
              </button>

              {/* Share */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center px-3 py-2 btn-secondary-light text-gray-700 rounded-xl transition-all"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
                
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl p-2 border border-gray-200 shadow-lg">
                    <button
                      onClick={shareToTwitter}
                      className="flex items-center w-full px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-all"
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </button>
                    <button
                      onClick={shareToInstagram}
                      className="flex items-center w-full px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-all"
                    >
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram Story
                    </button>
                    {user && user.uid === blog.author.id && (
                      <button
                        onClick={() => router.push(`/blogs/${blog._id}/edit`)}
                        className="flex items-center w-full px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-all"
                      >
                        Edit
                      </button>
                    )}
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
          className="card-light p-8 mb-8"
        >
          <div 
            className="editor-content-light max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </motion.div>

        {/* Comments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-light p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <MessageCircle className="w-6 h-6 mr-2" />
            Comments ({blog.comments.length})
          </h3>

          {/* Add Comment */}
          <div className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts... 💜"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
              rows={3}
            />
            <button
              onClick={handleComment}
              disabled={!newComment.trim() || submittingComment}
              className="mt-2 px-6 py-2 btn-primary-light text-white rounded-xl transition-all disabled:opacity-50"
            >
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {blog.comments.map((comment, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{comment.name}</span>
                  <span className="text-sm text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Profile View Modal */}
      <ProfileViewModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </div>
  )
} 
