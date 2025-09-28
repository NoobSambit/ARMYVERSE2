'use client'

import React, { useEffect, useMemo, useState } from 'react'
import PostCard from '@/components/blog/PostCard'
import { track } from '@/lib/utils/analytics'
import { useAuth } from '@/contexts/AuthContext'

type BlogStatus = 'all' | 'published' | 'drafts' | 'trash'

interface BlogItem {
  _id: string
  title: string
  content: string
  coverImage?: string | null
  mood: string
  tags: string[]
  createdAt: string
  readTime?: number
  views?: number
  reactions?: { moved?: number; loved?: number; surprised?: number }
  author: { id?: string; name: string; avatar?: string | null }
  status?: 'draft' | 'published'
  isDeleted?: boolean
}

export default function MyBlogsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [blogs, setBlogs] = useState<BlogItem[]>([])
  const [tab, setTab] = useState<BlogStatus>('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  const selectedIds = useMemo(() => Object.keys(selected).filter(id => selected[id]), [selected])

  useEffect(() => {
    let cancelled = false
    async function fetchBlogs() {
      if (!user) return
      setLoading(true)
      setError('')
      try {
        const url = `/api/blogs?authorId=${encodeURIComponent(user.uid)}&status=all&includeDeleted=true&limit=200`
        const res = await fetch(url)
        const data = await res.json()
        if (!cancelled) setBlogs((data?.blogs || []).map((b: BlogItem) => ({ ...b })))
      } catch (e) {
        if (!cancelled) setError('Failed to load your blogs')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchBlogs()
    return () => { cancelled = true }
  }, [user])

  const filtered = useMemo(() => {
    switch (tab) {
      case 'published':
        return blogs.filter(b => b.status === 'published' && !b.isDeleted)
      case 'drafts':
        return blogs.filter(b => b.status === 'draft' && !b.isDeleted)
      case 'trash':
        return blogs.filter(b => b.isDeleted)
      default:
        return blogs.filter(b => !b.isDeleted)
    }
  }, [blogs, tab])

  const toggleSelect = (id: string) => setSelected(s => ({ ...s, [id]: !s[id] }))
  const clearSelection = () => setSelected({})

  async function batchDelete() {
    await Promise.all(selectedIds.map(id => fetch(`/api/blogs/${id}`, { method: 'DELETE' })))
    setBlogs(prev => prev.map(b => selectedIds.includes(b._id) ? { ...b, isDeleted: true } : b))
    selectedIds.forEach(id => track('blog_deleted', { id }))
    clearSelection()
  }

  async function batchRestore() {
    await Promise.all(selectedIds.map(id => fetch(`/api/blogs/${id}/restore`, { method: 'POST' })))
    setBlogs(prev => prev.map(b => selectedIds.includes(b._id) ? { ...b, isDeleted: false, deletedAt: null as any } : b))
    selectedIds.forEach(id => track('blog_restored', { id }))
    clearSelection()
  }

  async function batchPublish(published: boolean) {
    await Promise.all(selectedIds.map(id => fetch(`/api/blogs/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: published ? 'published' : 'draft' }) })))
    setBlogs(prev => prev.map(b => selectedIds.includes(b._id) ? { ...b, status: (published ? 'published' : 'draft') } : b))
    selectedIds.forEach(id => track(published ? 'blog_published' : 'blog_unpublished', { id }))
    clearSelection()
  }

  // Move to collection: simple prompt for now; owner menu has per-card add already
  async function batchAddToCollection() {
    const slug = prompt('Add to which collection? Enter slug')
    if (!slug) return
    await fetch(`/api/collections/${encodeURIComponent(slug)}/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'addMany', postIds: selectedIds }) })
    selectedIds.forEach(id => track('blog_added_to_collection', { id, collection: slug }))
    clearSelection()
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">My Blogs</h1>
          <div className="segmented w-40" role="tablist" aria-label="View toggle">
            <div className="segmented-thumb" style={{ left: '2px', width: 'calc(50% - 3px)', transform: view === 'list' ? 'translateX(100%)' : 'translateX(0)' }} />
            <button role="tab" aria-selected={view !== 'list'} onClick={() => setView('grid')} className="segmented-item">Grid</button>
            <button role="tab" aria-selected={view === 'list'} onClick={() => setView('list')} className="segmented-item">List</button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          {(['all','published','drafts','trash'] as BlogStatus[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-full text-sm ${tab===t ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>{t[0].toUpperCase()+t.slice(1)}</button>
          ))}
        </div>

        {selectedIds.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white flex flex-wrap gap-2 items-center">
            <span>{selectedIds.length} selected</span>
            <span className="opacity-50">•</span>
            {tab !== 'trash' ? (
              <>
                <button onClick={() => batchPublish(true)} className="px-2 py-1 rounded-lg bg-green-600/80 hover:bg-green-600">Publish</button>
                <button onClick={() => batchPublish(false)} className="px-2 py-1 rounded-lg bg-yellow-600/80 hover:bg-yellow-600">Unpublish</button>
                <button onClick={batchAddToCollection} className="px-2 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600">Add to collection</button>
                <button onClick={batchDelete} className="px-2 py-1 rounded-lg bg-red-600/80 hover:bg-red-600">Delete</button>
              </>
            ) : (
              <button onClick={batchRestore} className="px-2 py-1 rounded-lg bg-green-600/80 hover:bg-green-600">Restore</button>
            )}
            <button onClick={clearSelection} className="ml-auto px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20">Clear</button>
          </div>
        )}

        {loading ? (
          <div className="text-gray-400">Loading…</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : (
          <div>
            {filtered.length === 0 ? (
              <div className="text-gray-300">No posts here yet.</div>
            ) : (
              <>
                {view === 'list' ? (
                  <div className="flex flex-col gap-3">
                    {filtered.map(p => (
                      <label key={p._id} className="flex items-start gap-3">
                        <input type="checkbox" className="mt-2" checked={!!selected[p._id]} onChange={() => toggleSelect(p._id)} />
                        <div className="flex-1"><PostCard post={p as any} variant="list" /></div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div className="mb-3 flex items-center gap-3 text-sm text-gray-300">
                      <label className="inline-flex items-center gap-2"><input type="checkbox" onChange={(e) => setSelected(Object.fromEntries(filtered.map(f => [f._id, e.target.checked])))} /> Select all</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filtered.map(p => (
                        <div key={p._id} className="relative">
                          <input type="checkbox" className="absolute left-2 top-2 z-10" checked={!!selected[p._id]} onChange={() => toggleSelect(p._id)} />
                          <PostCard post={p as any} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


