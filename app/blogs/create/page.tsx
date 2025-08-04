'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
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
  const { data: session, status } = useSession()
  const [isSaving, setIsSaving] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a082a] to-[#3a1d5c] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  const handleSave = async (data: BlogData) => {
    setIsSaving(true)
    try {
      // Get user data from session
      const author = {
        id: session.user?.id || session.user?.email || 'user123',
        name: session.user?.name || 'ARMY Writer',
        avatar: session.user?.image || null
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