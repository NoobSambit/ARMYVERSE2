'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { BlogEditorLight } from '@/components/blog/editor'

interface BlogDoc {
  _id: string
  title: string
  content: string
  tags: string[]
  mood: string
  coverImage?: string
  coverAlt?: string
  status: 'draft' | 'published'
  visibility?: 'public' | 'unlisted' | 'private'
  author: { id: string; name: string }
}

export default function EditBlogPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [doc, setDoc] = useState<BlogDoc | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch(`/api/blogs/${id}`)
        if (!res.ok) throw new Error('Failed to load blog')
        const data = (await res.json()) as BlogDoc
        if (!cancelled) setDoc(data)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load blog')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (id) load()
    return () => { cancelled = true }
  }, [id])

  const isOwner = !!user && !!doc && user.uid === doc.author.id

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/90">Loading editor…</div>
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-300">{error || 'Blog not found'}</div>
      </div>
    )
  }

  if (!isOwner) {
    // Not owner; send them to view page
    router.replace(`/blogs/${id}`)
    return null
  }

  return (
    <BlogEditorLight
      initialContent={doc.content}
      initialData={{
        title: doc.title,
        tags: doc.tags,
        mood: doc.mood,
        coverImage: doc.coverImage,
        coverAlt: doc.coverAlt,
        status: doc.status,
        visibility: doc.visibility || 'public',
      }}
      isSaving={saving}
      onSave={async (data) => {
        try {
          setSaving(true)
          const res = await fetch(`/api/blogs/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: data.title,
              content: data.content,
              tags: data.tags,
              mood: data.mood,
              coverImage: data.coverImage,
              coverAlt: data.coverAlt,
              status: data.status,
              visibility: data.visibility,
            }),
          })
          if (!res.ok) throw new Error('Failed to save blog')
          router.push(`/blogs/${id}`)
        } catch (e) {
          console.error(e)
          alert('Failed to save blog')
        } finally {
          setSaving(false)
        }
      }}
    />
  )
}

