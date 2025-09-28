'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface CollectionItem {
  _id: string
  slug: string
  title: string
  description?: string
  coverImage?: string
  visibility: 'public' | 'unlisted' | 'private'
  owner: { id: string; name: string; avatar?: string | null }
  posts?: string[]
}

export default function CollectionsIndexPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [collections, setCollections] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/collections?visibility=public&limit=24')
        const data = await res.json()
        if (!cancelled) setCollections(data?.collections || [])
      } catch (e) {
        if (!cancelled) setError('Failed to load collections')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Collections</h1>
          {user && (
            <button onClick={() => setCreating(true)} className="px-3 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500">New collection</button>
          )}
        </div>

        {creating && (
          <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="My favorite eras" className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button disabled={saving || !title.trim()} onClick={async () => {
                if (!user) return
                try {
                  setSaving(true)
                  const res = await fetch('/api/collections', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: title.trim(),
                      description: description.trim(),
                      owner: { id: user.uid, name: user.displayName || user.email || 'You' },
                      visibility: 'public'
                    })
                  })
                  const created = await res.json()
                  if (res.ok && created?.slug) {
                    setCollections(prev => [created, ...prev])
                    setCreating(false)
                    setTitle('')
                    setDescription('')
                    router.push(`/blog/collection/${encodeURIComponent(created.slug)}?ownerId=${encodeURIComponent(created.owner.id)}`)
                  } else {
                    setError(created?.error || 'Failed to create collection')
                  }
                } finally {
                  setSaving(false)
                }
              }} className="px-3 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50">{saving ? 'Creating…' : 'Create'}</button>
              <button disabled={saving} onClick={() => { setCreating(false); setTitle(''); setDescription('') }} className="px-3 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20">Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-gray-400">Loading…</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map(c => (
              <Link key={c._id} href={`/blog/collection/${encodeURIComponent(c.slug)}?ownerId=${encodeURIComponent(c.owner.id)}`} className="group block rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10">
                <div className="h-40 bg-gradient-to-tr from-[#8B5CF6]/30 to-[#D946EF]/30" style={{ backgroundImage: c.coverImage ? `url(${c.coverImage})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="p-4">
                  <h3 className="text-white font-semibold group-hover:text-[#A78BFA]">{c.title}</h3>
                  {c.description ? <p className="text-sm text-gray-400 line-clamp-2 mt-1">{c.description}</p> : null}
                  <div className="text-xs text-gray-500 mt-2">by {c.owner.name}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


