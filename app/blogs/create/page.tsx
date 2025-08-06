'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import BlogEditor from '@/components/blog/BlogEditor'

interface BlogData {
  title: string
  content: string
  tags: string[]
  mood: string
  coverImage?: string
  status: 'draft' | 'published'
}

export default function CreateBlogPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isSaving, setIsSaving] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a082a] to-[#3a1d5c] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  const handleSave = async (data: BlogData) => {
    setIsSaving(true)
    try {
      // Get user data from Firebase auth
      const author = {
        id: user.uid || user.email || 'user123',
        name: user.displayName || user.email || 'ARMY Writer',
        avatar: user.photoURL || null
      }

      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          author
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save blog')
      }

      const savedBlog = await response.json()
      
      // Redirect to the blog view page
      router.push(`/blogs/${savedBlog._id}`)
    } catch (error) {
      console.error('Error saving blog:', error)
      alert('Failed to save blog. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAutoSave = async (data: BlogData) => {
    // Auto-save functionality - could save to localStorage or make API call
    console.log('Auto-saving:', data)
  }

  return (
    <BlogEditor
      onSave={handleSave}
      onAutoSave={handleAutoSave}
      isSaving={isSaving}
    />
  )
} 