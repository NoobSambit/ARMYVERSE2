'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { BlogEditorLight } from '@/components/blog/editor'

interface BlogData {
  title: string
  content: string
  tags: string[]
  mood: string
  coverImage?: string
  coverAlt?: string
  status: 'draft' | 'published'
  visibility?: 'public' | 'unlisted' | 'private'
  excerpt?: string
}

export default function CreateBlogPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const draftKey = useMemo(() => (user ? `blog_draft_${user.uid || user.email}` : 'blog_draft_anon'), [user])
  const versionsKey = useMemo(() => `${draftKey}_versions`, [draftKey])
  const [initialData, setInitialData] = useState<Partial<BlogData> | undefined>(undefined)

  // Redirect if not authenticated
  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  // Restore draft on mount
  useEffect(() => {
    if (!user) return
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        setInitialData(parsed)
      }
    } catch (e) {
      console.warn('Failed to restore draft', e)
    }
  }, [user, draftKey])

  if (loading) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
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

      // Clear draft after successful save
      try {
        localStorage.removeItem(draftKey)
        localStorage.removeItem(versionsKey)
      } catch {}
    } catch (error) {
      console.error('Error saving blog:', error)
      alert('Failed to save blog. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAutoSave = async (data: BlogData) => {
    try {
      // Save lightweight draft
      localStorage.setItem(draftKey, JSON.stringify(data))
      // Append to version history (keep last 20)
      const versionsRaw = localStorage.getItem(versionsKey)
      const versions = versionsRaw ? JSON.parse(versionsRaw) as Array<{ ts: number; data: BlogData }> : []
      const last = versions[versions.length - 1]
      const now = Date.now()
      // Save at most every 60s into history
      if (!last || now - last.ts > 60000) {
        const next = [...versions, { ts: now, data }]
        const trimmed = next.slice(-20)
        localStorage.setItem(versionsKey, JSON.stringify(trimmed))
      }
    } catch (e) {
      console.warn('Autosave failed', e)
    }
  }

  return (
    <BlogEditorLight
      initialData={initialData}
      onSave={handleSave}
      onAutoSave={handleAutoSave}
      isSaving={isSaving}
      versionsKey={versionsKey}
    />
  )
} 
