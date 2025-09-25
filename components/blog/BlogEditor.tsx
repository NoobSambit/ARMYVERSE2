'use client'

import React, { useEffect, useMemo, useState } from 'react'
import NextImage from 'next/image'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import CodeBlock from '@tiptap/extension-code-block'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
  Highlighter,
  Table as TableIcon,
  CheckSquare,
  Save,
  Eye,
  Sparkles,
  Upload,
  X,
  Plus
} from 'lucide-react'

interface BlogEditorProps {
  initialContent?: string
  initialData?: Partial<BlogData>
  onSave: (data: BlogData) => void
  onAutoSave?: (data: BlogData) => void
  isSaving?: boolean
  versionsKey?: string
}

interface BlogData {
  title: string
  content: string
  tags: string[]
  mood: string
  coverImage?: string
  coverAlt?: string
  status: 'draft' | 'published'
}

const MOODS = [
  { value: 'emotional', label: '🥹 Emotional', emoji: '🥹' },
  { value: 'fun', label: '🎉 Fun', emoji: '🎉' },
  { value: 'hype', label: '🔥 Hype', emoji: '🔥' },
  { value: 'chill', label: '😌 Chill', emoji: '😌' },
  { value: 'romantic', label: '💜 Romantic', emoji: '💜' },
  { value: 'energetic', label: '⚡ Energetic', emoji: '⚡' }
]

const SUGGESTED_TAGS = [
  '#RunEra', '#Jimin', '#Emotional', '#BTS', '#ARMY', 
  '#Kpop', '#Music', '#Fashion', '#Dance', '#Vocal',
  '#Rap', '#Performance', '#Concert', '#Album', '#MV'
]

export default function BlogEditor({ 
  initialContent = '', 
  initialData,
  onSave, 
  onAutoSave,
  isSaving = false,
  versionsKey,
}: BlogEditorProps) {
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [mood, setMood] = useState('fun')
  const [coverImage, setCoverImage] = useState<string>('')
  const [coverAlt, setCoverAlt] = useState<string>('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [newTag, setNewTag] = useState('')
  // Cover upload handled directly by input; no extra toggle state needed
  const [, setIsUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSEO, setShowSEO] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<Array<{ ts: number; data: BlogData }>>([])
  const [showAIAssist, setShowAIAssist] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isTagInputFocused, setIsTagInputFocused] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-400 underline'
        }
      }),
      Placeholder.configure({
        placeholder: 'Start writing your BTS blog post... 💜',
      }),
      Typography,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-800 rounded-lg p-4 font-mono text-sm'
        }
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      // Track dirty state when content changes
      setIsDirty(true)
      if (onAutoSave) {
        const data = {
          title,
          content: editor.getHTML(),
          tags,
          mood,
          coverImage,
          coverAlt,
          status
        }
        onAutoSave(data)
        setLastSavedAt(Date.now())
        setIsDirty(false)
      }
    },
  })

  // Initialize from initialData
  useEffect(() => {
    if (!initialData) return
    if (initialData.title) setTitle(initialData.title)
    if (initialData.tags) setTags(initialData.tags)
    if (initialData.mood) setMood(initialData.mood)
    if (initialData.coverImage) setCoverImage(initialData.coverImage)
    if (initialData.coverAlt) setCoverAlt(initialData.coverAlt)
    if (initialData.status) setStatus(initialData.status)
    if (initialData.content && editor) {
      editor.commands.setContent(initialData.content)
    }
  }, [initialData, editor])

  // Auto-save effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (editor && onAutoSave) {
        const data = {
          title,
          content: editor.getHTML(),
          tags,
          mood,
          coverImage,
          coverAlt,
          status
        }
        onAutoSave(data)
        setLastSavedAt(Date.now())
        setIsDirty(false)
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [editor, title, tags, mood, coverImage, coverAlt, status, onAutoSave])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const uploadImage = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const url = await uploadImage(file)
    if (url && editor) {
      const alt = window.prompt('Add alt text for accessibility (optional):') || ''
      editor.chain().focus().setImage({ src: url, alt }).run()
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 8) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
      setIsDirty(true)
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
    setIsDirty(true)
  }

  const handleSave = () => {
    if (!editor) return

    const data: BlogData = {
      title,
      content: editor.getHTML(),
      tags,
      mood,
      coverImage,
      coverAlt,
      status
    }
    onSave(data)
    setIsDirty(false)
  }

  const toggleBold = () => editor?.chain().focus().toggleBold().run()
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run()
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run()
  const toggleStrike = () => editor?.chain().focus().toggleStrike().run()
  const toggleCode = () => editor?.chain().focus().toggleCode().run()
  const toggleCodeBlock = () => editor?.chain().focus().toggleCodeBlock().run()
  const toggleBlockquote = () => editor?.chain().focus().toggleBlockquote().run()
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run()
  const setTextAlign = (align: 'left' | 'center' | 'right' | 'justify') => 
    editor?.chain().focus().setTextAlign(align).run()
  const toggleHighlight = () => editor?.chain().focus().toggleHighlight().run()
  const addTable = () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  const addTaskList = () => editor?.chain().focus().toggleTaskList().run()

  const slug = useMemo(() =>
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 80),
  [title])

  const readingTime = useMemo(() => {
    const text = editor?.getText() || ''
    const words = text.trim().split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(words / 200))
  }, [editor])

  const seoScore = useMemo(() => {
    // Very lightweight heuristic scoring 0-100
    let score = 0
    const text = editor?.getText() || ''
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length
    const titleLen = title.trim().length
    const hasCover = Boolean(coverImage)
    const hasAlt = Boolean(coverAlt && coverAlt.trim().length > 0)
    const tagCount = tags.length

    if (titleLen >= 45 && titleLen <= 60) score += 20
    else if (titleLen >= 30 && titleLen <= 70) score += 12

    if (wordCount >= 600) score += 20
    else if (wordCount >= 300) score += 12

    if (hasCover) score += 12
    if (hasAlt) score += 8
    if (tagCount >= 3 && tagCount <= 8) score += 12

    // Basic link presence
    const hasLink = /https?:\/\//i.test(editor?.getHTML() || '')
    if (hasLink) score += 8

    // Slug present
    if (titleLen > 0) score += 8

    return Math.min(100, score)
  }, [title, editor, coverImage, coverAlt, tags])

  const filteredTagSuggestions = useMemo(() => {
    const query = newTag.toLowerCase()
    return SUGGESTED_TAGS.filter(t =>
      !tags.includes(t) && (!query || t.toLowerCase().includes(query))
    ).slice(0, 6)
  }, [newTag, tags])

  // Load history when history panel opens
  useEffect(() => {
    if (!showHistory || !versionsKey) return
    try {
      const raw = localStorage.getItem(versionsKey)
      const parsed = raw ? (JSON.parse(raw) as Array<{ ts: number; data: BlogData }>) : []
      setHistory(parsed)
    } catch {
      setHistory([])
    }
  }, [showHistory, versionsKey])

  if (!editor) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a082a] to-[#3a1d5c] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Sticky Action Bar */}
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-purple-500/20">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h1 className="text-xl font-semibold text-white">✍️ Create Blog Post</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowTemplates(v => !v)}
                className="px-3 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600"
                title="Insert template"
              >
                Templates
              </button>
              <button
                onClick={() => setShowHistory(v => !v)}
                className="px-3 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600"
                title="View version history"
              >
                History
              </button>
              <button
                onClick={() => setShowSEO(v => !v)}
                className={`px-3 py-2 rounded-lg ${showSEO ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
                title="Open SEO preview"
              >
                SEO <span className="ml-2 inline-flex items-center justify-center w-7 h-5 rounded bg-gray-800 text-xs text-purple-300 border border-purple-500/30">{seoScore}</span>
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center px-3 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600"
                title="Open live preview"
                aria-label="Open preview"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
              <button
                onClick={() => setStatus(status === 'draft' ? 'published' : 'draft')}
                className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                  status === 'published' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-600 text-gray-300'
                }`}
                title={status === 'published' ? 'Switch to draft' : 'Publish blog'}
                aria-label={status === 'published' ? 'Switch to draft' : 'Publish blog'}
              >
                {status === 'published' ? 'Published' : 'Draft'}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center px-5 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all disabled:opacity-50"
                title="Save blog post"
                aria-label="Save blog post"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
          {/* Left: Title + Toolbar + Editor */}
          <div>
            {/* Title */}
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 mb-4 border border-purple-500/20">
              <input
                type="text"
                placeholder="Enter your blog title..."
                value={title}
                onChange={(e) => { setTitle(e.target.value); setIsDirty(true) }}
                className="w-full text-4xl font-extrabold bg-transparent border-none outline-none text-white placeholder-gray-400 mb-2"
              />
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div>
                  {isDirty ? 'Unsaved changes' : (lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Not saved yet')}
                </div>
                <div className="hidden md:block">Slug: <span className="text-purple-300">/{slug}</span> • {readingTime} min read</div>
              </div>
            </div>

            {/* Editor Toolbar */}
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-purple-500/20">
              <div className="flex items-center gap-2 overflow-x-auto md:flex-wrap whitespace-nowrap">
            {/* Text Formatting */}
                <div className="flex items-center space-x-1">
               <button
                 onClick={toggleBold}
                 className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('bold') ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
                 title="Bold"
                 aria-label="Bold text"
               >
                 <Bold className="w-4 h-4" />
               </button>
               <button
                 onClick={toggleItalic}
                 className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('italic') ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
                 title="Italic"
                 aria-label="Italic text"
               >
                 <Italic className="w-4 h-4" />
               </button>
               <button
                 onClick={toggleUnderline}
                 className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('underline') ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
                 title="Underline"
                 aria-label="Underline text"
               >
                 <UnderlineIcon className="w-4 h-4" />
               </button>
               <button
                 onClick={toggleStrike}
                 className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('strike') ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
                 title="Strikethrough"
                 aria-label="Strikethrough text"
               >
                 <Strikethrough className="w-4 h-4" />
               </button>
             </div>

            <div className="w-px h-6 bg-gray-600" />

            {/* Headings and Lists */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('heading', { level: 1 }) ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
                title="Heading 1"
              >
                H1
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
                title="Heading 2"
              >
                H2
              </button>
              <button
                onClick={toggleBulletList}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('bulletList') ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
                title="Toggle bullet list"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={toggleOrderedList}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('orderedList') ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
                title="Toggle ordered list"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-600" />

            {/* Alignment */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setTextAlign('left')}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive({ textAlign: 'left' }) ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
                title="Align left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTextAlign('center')}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive({ textAlign: 'center' }) ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
                title="Align center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTextAlign('right')}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive({ textAlign: 'right' }) ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
                title="Align right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTextAlign('justify')}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
                title="Justify"
              >
                <AlignJustify className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-600" />

            {/* Special Elements */}
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleBlockquote}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('blockquote') ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
                title="Blockquote"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                onClick={toggleCode}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('code') ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
                title="Inline code"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                onClick={toggleCodeBlock}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('codeBlock') ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
                title="Code block"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                onClick={toggleHighlight}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('highlight') ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
                title="Highlight"
              >
                <Highlighter className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-600" />

            {/* Media and Tables */}
            <div className="flex items-center space-x-1">
              <label className="p-2 rounded hover:bg-gray-700 text-gray-300 cursor-pointer" title="Insert image" aria-label="Insert image">
                <ImageIcon className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Insert image file"
                  title="Insert image file"
                />
              </label>
              <button
                onClick={addTable}
                className="p-2 rounded hover:bg-gray-700 text-gray-300"
                title="Insert table"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={addTaskList}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('taskList') ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
                title="Toggle checklist"
              >
                <CheckSquare className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-600" />

            {/* AI Assist */}
                <button onClick={() => setShowAIAssist(true)} className="flex items-center px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all" title="AI writing assist">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Assist
                </button>
              </div>
            </div>

            {/* Editor */}
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
              <EditorContent 
                editor={editor} 
                className="prose prose-invert prose-purple max-w-none min-h-[600px] focus:outline-none text-white caret-purple-400 selection:bg-purple-600/40"
              />
            </div>
          </div>

          {/* Right: Sidebar */}
          <aside className="space-y-4">
            {/* Cover Image */}
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-4 border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Cover Image</label>
                <span className="text-[10px] text-gray-400">16:9 • ≥ 1200×675</span>
              </div>
              {coverImage ? (
                <div className="relative mb-3">
                  <NextImage 
                    src={coverImage}
                    alt={coverAlt || 'Cover image'}
                    width={600}
                    height={338}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => { setCoverImage(''); setIsDirty(true) }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    aria-label="Remove cover image"
                    title="Remove cover image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="w-full h-40 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-400 transition-all mb-3 cursor-pointer" title="Upload cover image">
                  <Upload className="w-6 h-6" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const url = await uploadImage(file)
                        if (url) { setCoverImage(url); setIsDirty(true) }
                      }
                    }}
                    className="hidden"
                    aria-label="Select cover image file"
                  />
                </label>
              )}
              {coverImage && (
                <input
                  type="text"
                  placeholder="Describe the cover (alt text)"
                  value={coverAlt}
                  onChange={(e) => { setCoverAlt(e.target.value); setIsDirty(true) }}
                  className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                />
              )}
            </div>

            {/* Tags */}
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-4 border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Tags</label>
                <span className="text-[10px] text-gray-400">{tags.length}/8</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-purple-400 hover:text-purple-300"
                      aria-label={`Remove tag ${tag}`}
                      title={`Remove tag ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative flex space-x-2">
                <input
                  type="text"
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                    if (e.key === 'Escape') {
                      setIsTagInputFocused(false)
                      ;(e.target as HTMLInputElement).blur()
                    }
                  }}
                  onFocus={() => setIsTagInputFocused(true)}
                  onBlur={() => setTimeout(() => setIsTagInputFocused(false), 150)}
                  className="flex-1 px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                  aria-label="Add tag"
                  title="Add tag"
                >
                  <Plus className="w-4 h-4" />
                </button>
                {isTagInputFocused && newTag && filteredTagSuggestions.length > 0 && (
                  <div className="absolute left-0 top-11 z-20 w-full bg-black/90 border border-gray-700 rounded-lg shadow-lg">
                    {filteredTagSuggestions.map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          setTags(prev => [...prev, s])
                          setNewTag('')
                          setIsDirty(true)
                          setIsTagInputFocused(false)
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-1">Suggested tags:</p>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (!tags.includes(tag) && tags.length < 8) {
                          setTags([...tags, tag])
                          setIsDirty(true)
                        }
                      }}
                      disabled={tags.includes(tag) || tags.length >= 8}
                      className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mood */}
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-4 border border-purple-500/20">
              <label className="block text-sm font-medium text-gray-300 mb-2">Mood</label>
              <div className="grid grid-cols-2 gap-2">
                {MOODS.map(moodOption => (
                  <button
                    key={moodOption.value}
                    onClick={() => { setMood(moodOption.value); setIsDirty(true) }}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg transition-all ${
                      mood === moodOption.value
                        ? 'bg-purple-500 text-white'
                        : 'bg-black/50 text-gray-300 hover:bg-gray-700'
                    }`}
                    title={`Set mood to ${moodOption.label}`}
                  >
                    <span className="mr-2">{moodOption.emoji}</span>
                    {moodOption.label.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* SEO Snippet */}
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-4 border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white">SEO Snippet</p>
                <span className="text-xs text-purple-300">Score {seoScore}</span>
              </div>
              <div className="text-[10px] text-gray-400 mb-1">URL preview</div>
              <div className="text-purple-300 text-xs">armyverse.app/blogs/{slug || 'untitled'}</div>
              <div className="mt-2 space-y-1">
                <div className="text-sm text-white font-semibold line-clamp-2">{title || 'Add an SEO-friendly title'}</div>
                <div className="text-xs text-gray-300 line-clamp-3">{(editor?.getText() || '').slice(0, 160) || 'Your description will appear here.'}</div>
              </div>
              <button onClick={() => setShowSEO(true)} className="mt-3 w-full px-3 py-2 text-xs bg-gray-700 text-gray-200 rounded hover:bg-gray-600">Open detailed checks</button>
            </div>

            {/* Publish Controls */}
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-4 border border-purple-500/20">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-white">Publish</p>
                <span className="text-xs text-gray-400">Status</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setStatus(status === 'draft' ? 'published' : 'draft')}
                  className={`flex-1 px-3 py-2 rounded-lg ${status === 'published' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200'}`}
                >
                  {status === 'published' ? 'Published' : 'Draft'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Templates dropdown */}
        {showTemplates && (
          <div className="fixed right-6 top-24 z-40 w-72 bg-black/95 border border-gray-700 rounded-xl shadow-xl p-3 space-y-2">
            <p className="text-gray-300 text-sm mb-2">Insert a template</p>
            {[
              { key: 'news', label: 'News Recap', content: `<h2>What happened</h2><p>—</p><h2>Why it matters</h2><p>—</p><h2>Official sources</h2><ul><li></li></ul>` },
              { key: 'review', label: 'Track Review', content: `<h2>First impressions</h2><p>—</p><h2>Lyrics that hit</h2><blockquote>—</blockquote><h2>Final thoughts</h2><p>—</p>` },
              { key: 'concert', label: 'Concert Diary', content: `<h2>Venue & vibe</h2><p>—</p><h2>Setlist highlights</h2><ul><li></li></ul><h2>Personal moment</h2><p>—</p>` },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => {
                  editor?.chain().focus().insertContent(t.content).run()
                  setShowTemplates(false)
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-200"
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Version History */}
        {showHistory && (
          <div className="fixed right-6 top-24 z-40 w-80 max-h-[70vh] overflow-auto bg-black/95 border border-gray-700 rounded-xl shadow-xl p-3 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-medium">Draft History</p>
              <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-200" title="Close history">Close</button>
            </div>
            {history.length === 0 && <p className="text-gray-400 text-sm">No versions yet.</p>}
            {history.map((v, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (!editor) return
                  setTitle(v.data.title)
                  setTags(v.data.tags)
                  setMood(v.data.mood)
                  setCoverImage(v.data.coverImage || '')
                  setCoverAlt(v.data.coverAlt || '')
                  setStatus(v.data.status)
                  editor.commands.setContent(v.data.content)
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-200"
                title={new Date(v.ts).toLocaleString()}
              >
                {new Date(v.ts).toLocaleString()}
              </button>
            ))}
          </div>
        )}

        {/* SEO panel */}
        {showSEO && (
          <div className="fixed right-6 bottom-6 z-40 w-96 bg-black/95 border border-gray-700 rounded-xl shadow-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-white font-medium">SEO Preview</p>
              <button onClick={() => setShowSEO(false)} className="text-gray-400 hover:text-gray-200">Close</button>
            </div>
            <div className="text-xs text-gray-400">URL preview</div>
            <div className="text-purple-300 text-sm">armyverse.app/blogs/{slug || 'untitled'}</div>
            <div className="mt-2 space-y-2">
              <div className="text-lg text-white font-semibold line-clamp-2">{title || 'Add an SEO-friendly title'}</div>
              <div className="text-sm text-gray-300 line-clamp-3">{(editor?.getText() || '').slice(0, 160) || 'Your description will appear here.'}</div>
            </div>
            <div className="rounded-lg overflow-hidden border border-gray-700">
              {coverImage ? (
                <NextImage src={coverImage} alt={coverAlt || 'Open Graph image'} width={1200} height={480} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gray-800 flex items-center justify-center text-gray-400">OG image preview</div>
              )}
            </div>
          </div>
        )}

        {/* Live Preview Overlay */}
        {showPreview && (
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="relative w-full max-w-4xl bg-black/90 border border-purple-500/30 rounded-2xl p-6 overflow-auto max-h-[90vh]">
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
                aria-label="Close preview"
                title="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="space-y-4">
                {coverImage && (
                  <NextImage src={coverImage} alt={coverAlt || 'Cover image'} width={1200} height={480} className="w-full h-48 object-cover rounded-xl" />
                )}
                <h1 className="text-3xl font-bold text-white">{title || 'Untitled post'}</h1>
                <div className="flex flex-wrap gap-2">
                  {tags.map(t => (
                    <span key={t} className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full">{t}</span>
                  ))}
                </div>
                <div className="text-xs text-gray-400">/{slug} • {readingTime} min read • Mood: {mood}</div>
                <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
              </div>
            </div>
          </div>
        )}

        {/* AI Assist Docked Panel */}
        {showAIAssist && (
          <div className="fixed right-6 top-24 z-40 w-96 bg-black/95 border border-gray-700 rounded-xl shadow-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-white font-medium">AI Assist</p>
              <button onClick={() => setShowAIAssist(false)} className="text-gray-400 hover:text-gray-200" aria-label="Close AI panel">Close</button>
            </div>
            <div className="space-y-2 text-sm">
              <button
                onClick={() => {
                  editor?.chain().focus().insertContent('<p>Summarize the above in 3 bullets…</p>').run()
                  setShowAIAssist(false)
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-200"
              >
                Insert summary prompt
              </button>
              <button
                onClick={() => {
                  editor?.chain().focus().insertContent('<h2>Key Takeaways</h2><ul><li>—</li><li>—</li><li>—</li></ul>').run()
                  setShowAIAssist(false)
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 text-gray-200"
              >
                Outline: Key Takeaways
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 