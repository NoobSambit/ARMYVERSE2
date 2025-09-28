'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
// import Link from 'next/link'
import PostCard from '@/components/blog/PostCard'
import { useAuth } from '@/contexts/AuthContext'

interface CollectionData {
  _id: string
  slug: string
  title: string
  description?: string
  coverImage?: string
  visibility: 'public' | 'unlisted' | 'private'
  owner: { id: string; name: string; avatar?: string | null }
  posts: Array<{
    _id: string
    title: string
    content?: string
    coverImage?: string | null
    mood: string
    tags: string[]
    createdAt: string
    readTime?: number
    views?: number
    reactions?: { moved?: number; loved?: number; surprised?: number }
    author?: { id?: string; name?: string; avatar?: string | null }
  }>
}

export default function CollectionDetailPage() {
  const params = useParams()
  const search = useSearchParams()
  const ownerId = search.get('ownerId') || ''
  const slug = params?.slug as string
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<CollectionData | null>(null)
  const isOwner = !!user && data?.owner?.id && user.uid === data.owner.id
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [banner, setBanner] = useState('')
  const [saving, setSaving] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerLoading, setPickerLoading] = useState(false)
  const [pickerItems, setPickerItems] = useState<Array<{ _id: string; title: string; createdAt: string; author?: { name?: string } }>>([])
  const [pickerQuery, setPickerQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const url = `/api/collections/${encodeURIComponent(slug)}${ownerId ? `?ownerId=${encodeURIComponent(ownerId)}` : ''}`
        const res = await fetch(url)
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch (e) {
        if (!cancelled) setError('Failed to load collection')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (slug) load()
    return () => { cancelled = true }
  }, [slug, ownerId])

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-gray-400">Loading…</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : data ? (
          <>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              <div className="h-56 bg-gradient-to-tr from-[#8B5CF6]/30 to-[#D946EF]/30" style={{ backgroundImage: data.coverImage ? `url(${data.coverImage})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div className="p-5">
                <h1 className="text-2xl font-bold text-white">{data.title}</h1>
                {data.description ? <p className="text-gray-300 mt-2">{data.description}</p> : null}
                <div className="text-sm text-gray-400 mt-2">by {data.owner.name}</div>
                {isOwner && !editing && (
                  <div className="mt-3 flex items-center gap-2">
                    <button className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white" onClick={() => { setEditing(true); setTitle(data.title); setDescription(data.description || ''); setBanner(data.coverImage || '') }}>Edit</button>
                    <button className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white" onClick={() => setPickerOpen(true)}>Add post</button>
                  </div>
                )}
                {isOwner && editing && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-300 mb-1">Description</label>
                        <input value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white" />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-sm text-gray-300 mb-1">Banner URL</label>
                        <input value={banner} onChange={e => setBanner(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button disabled={saving} className="px-3 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50" onClick={async () => {
                        try {
                          setSaving(true)
                          const res = await fetch(`/api/collections/${encodeURIComponent(data.slug)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, coverImage: banner, renameSlug: true }) })
                          const updated = await res.json()
                          if (res.ok) setData(updated)
                          setEditing(false)
                        } finally {
                          setSaving(false)
                        }
                      }}>{saving ? 'Saving…' : 'Save'}</button>
                      <button disabled={saving} className="px-3 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6">
              {data.posts?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.posts.map((p) => (
                    <div key={p._id} className="relative group">
                      {isOwner && (
                        <button className="absolute right-2 top-2 z-10 px-2 py-1 text-xs rounded-lg bg-black/50 border border-white/10 text-white hover:bg-white/10" onClick={async () => {
                          await fetch(`/api/collections/${encodeURIComponent(data.slug)}/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'remove', postId: p._id }) })
                          const res = await fetch(`/api/collections/${encodeURIComponent(slug)}${ownerId ? `?ownerId=${encodeURIComponent(ownerId)}` : ''}`)
                          const json = await res.json()
                          setData(json)
                        }}>Remove</button>
                      )}
                      <PostCard post={p} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400">No posts in this collection yet.</div>
              )}
            </div>

            {pickerOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/60" onClick={() => setPickerOpen(false)} />
                <div className="relative w-full max-w-2xl mx-auto rounded-2xl bg-[#0B0912] border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white text-lg font-semibold">Add posts to collection</h3>
                    <button className="text-gray-300 hover:text-white" onClick={() => setPickerOpen(false)}>Close</button>
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <input value={pickerQuery} onChange={(e) => setPickerQuery(e.target.value)} placeholder="Search blogs…" className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white" />
                    <button className="px-3 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20" onClick={async () => {
                      setPickerLoading(true)
                      try {
                        const params = new URLSearchParams()
                        if (pickerQuery) params.set('search', pickerQuery)
                        params.set('status', 'published')
                        params.set('limit', '20')
                        params.set('compact', 'true')
                        const res = await fetch(`/api/blogs?${params.toString()}`)
                        const json = await res.json()
                        setPickerItems(json.blogs || [])
                      } finally {
                        setPickerLoading(false)
                      }
                    }}>{pickerLoading ? 'Searching…' : 'Search'}</button>
                    <button className="px-3 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500" onClick={async () => {
                      if (!user) return
                      setPickerLoading(true)
                      try {
                        const params = new URLSearchParams()
                        params.set('authorId', user.uid)
                        params.set('status', 'all')
                        params.set('limit', '50')
                        params.set('includeDeleted', 'false')
                        params.set('compact', 'true')
                        const res = await fetch(`/api/blogs?${params.toString()}`)
                        const json = await res.json()
                        setPickerItems(json.blogs || [])
                      } finally {
                        setPickerLoading(false)
                      }
                    }}>My posts</button>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pickerItems.map((b) => (
                      <div key={b._id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-white font-medium line-clamp-1">{b.title}</div>
                        <div className="text-xs text-gray-400">by {b.author?.name || 'Unknown'}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</span>
                          <button className="px-2 py-1 text-xs rounded-lg bg-purple-600 text-white hover:bg-purple-500" onClick={async () => {
                            await fetch(`/api/collections/${encodeURIComponent(data!.slug)}/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add', postId: b._id }) })
                            const res = await fetch(`/api/collections/${encodeURIComponent(slug)}${ownerId ? `?ownerId=${encodeURIComponent(ownerId)}` : ''}`)
                            const json = await res.json()
                            setData(json)
                          }}>Add</button>
                        </div>
                      </div>
                    ))}
                    {!pickerItems.length && !pickerLoading && (
                      <div className="text-gray-400">No results. Try searching or click &quot;My posts&quot;.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}


