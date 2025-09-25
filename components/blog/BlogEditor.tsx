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
  Plus,
  Theater,
  Zap,
  Moon,
  Heart,
  Flame,
  FileText,
  History,
  Search,
  Settings,
  Globe,
  Lock,
  Users
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
  visibility?: 'public' | 'unlisted' | 'private'
}

const MOODS = [
  { value: 'emotional', label: 'Emotional', icon: Theater },
  { value: 'fun', label: 'Fun', icon: Sparkles },
  { value: 'hype', label: 'Hype', icon: Flame },
  { value: 'chill', label: 'Chill', icon: Moon },
  { value: 'romantic', label: 'Romantic', icon: Heart },
  { value: 'energetic', label: 'Energetic', icon: Zap }
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
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public')
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
    immediatelyRender: false,
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
          status,
          visibility
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
    if (initialData.visibility) setVisibility(initialData.visibility)
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
          status,
          visibility
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

  // Add paste and drop event listeners for images
  useEffect(() => {
    if (!editor) return

    const editorElement = editor.view.dom
    const pasteHandler = (e: Event) => handlePasteImage(e as ClipboardEvent)
    const dropHandler = (e: Event) => handleDropImage(e as unknown as React.DragEvent)

    editorElement.addEventListener('paste', pasteHandler)
    editorElement.addEventListener('drop', dropHandler)

    return () => {
      editorElement.removeEventListener('paste', pasteHandler)
      editorElement.removeEventListener('drop', dropHandler)
    }
  }, [editor])

  const uploadImage = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      if (preset) {
        formData.append('uploadPreset', preset)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let message = 'Upload failed'
        try {
          const err = await response.json()
          if (err?.error) message = err.error
        } catch {}
        throw new Error(message)
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
      const caption = window.prompt('Add caption (optional):') || ''
      editor.chain().focus().setImage({ 
        src: url, 
        alt,
        title: caption
      }).run()
    }
  }

  const handlePasteImage = async (event: ClipboardEvent) => {
    const items = event.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile()
        if (file && editor) {
          event.preventDefault()
          const url = await uploadImage(file)
          if (url) {
            editor.chain().focus().setImage({ 
              src: url, 
              alt: 'Pasted image'
            }).run()
          }
        }
      }
    }
  }

  const handleDropImage = async (event: React.DragEvent) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files.length > 0 && editor) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        const url = await uploadImage(file)
        if (url) {
          editor.chain().focus().setImage({ 
            src: url, 
            alt: 'Dropped image'
          }).run()
        }
      }
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
      status,
      visibility
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
  
  // Image functions
  const resizeImage = (width: string) => {
    if (!editor) return
    const { state } = editor
    const { selection } = state
    const { $from } = selection
    
    // Find the image node
    const imageNode = $from.node()
    if (imageNode && imageNode.type.name === 'image') {
      editor.chain().focus().updateAttributes('image', { width }).run()
    }
  }

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
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="max-w-6xl mx-auto">
        {/* Sticky Action Bar */}
        <div className="container-glass container-glass-hover rounded-2xl p-4 mb-6 mobile-action-bar">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Create Blog Post
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowTemplates(v => !v)}
                className="btn-glass-secondary"
                title="Insert template"
                aria-label="Insert template"
              >
                <FileText className="w-4 h-4" />
                Templates
              </button>
              <button
                onClick={() => setShowHistory(v => !v)}
                className="btn-glass-secondary"
                title="View version history"
                aria-label="View version history"
              >
                <History className="w-4 h-4" />
                History
              </button>
              <button
                onClick={() => setShowSEO(v => !v)}
                className={`btn-glass-secondary ${showSEO ? 'neon-glow' : ''}`}
                title="Open SEO preview"
                aria-label="Open SEO preview"
              >
                <Search className="w-4 h-4" />
                SEO 
                <span className={`inline-flex items-center justify-center w-6 h-5 rounded-full text-xs font-medium ${
                  seoScore >= 80 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                  seoScore >= 60 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                  'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {seoScore}
                </span>
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="btn-glass-secondary"
                title="Open live preview"
                aria-label="Open preview"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setStatus(status === 'draft' ? 'published' : 'draft')}
                className={`btn-glass-secondary ${status === 'published' ? 'neon-glow-pink' : ''}`}
                title={status === 'published' ? 'Switch to draft' : 'Publish blog'}
                aria-label={status === 'published' ? 'Switch to draft' : 'Publish blog'}
              >
                {status === 'published' ? (
                  <>
                    <Globe className="w-4 h-4" />
                    Published
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Draft
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-glass-primary disabled:opacity-50 disabled:cursor-not-allowed"
                title="Save blog post"
                aria-label="Save blog post"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div id="main-content" className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 mobile-grid">
          {/* Left: Title + Toolbar + Editor */}
          <div>
            {/* Title */}
            <div className="container-glass container-glass-hover rounded-2xl p-6 mb-4">
              <input
                type="text"
                placeholder="Enter your blog title..."
                value={title}
                onChange={(e) => { setTitle(e.target.value); setIsDirty(true) }}
                className="w-full text-4xl font-extrabold bg-transparent border-none outline-none text-white placeholder-white/50 mb-2 focus:outline-none"
              />
              <div className="flex items-center justify-between text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isDirty ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                  {isDirty ? 'Unsaved changes' : (lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Not saved yet')}
                </div>
                <div className="hidden md:block flex items-center gap-2">
                  <span className="text-white/40">Slug:</span>
                  <span className="text-purple-300 font-mono">/{slug}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/60">{readingTime} min read</span>
                </div>
              </div>
            </div>

            {/* Editor Toolbar */}
            <div className="container-glass container-glass-hover rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3 overflow-x-auto md:flex-wrap">
                {/* Typography Group */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-white/40 font-medium mr-2">Typography</span>
                  <button
                    onClick={toggleBold}
                    className={`btn-toolbar ${editor.isActive('bold') ? 'is-active' : ''}`}
                    title="Bold"
                    aria-label="Bold text"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleItalic}
                    className={`btn-toolbar ${editor.isActive('italic') ? 'is-active' : ''}`}
                    title="Italic"
                    aria-label="Italic text"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleUnderline}
                    className={`btn-toolbar ${editor.isActive('underline') ? 'is-active' : ''}`}
                    title="Underline"
                    aria-label="Underline text"
                  >
                    <UnderlineIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleStrike}
                    className={`btn-toolbar ${editor.isActive('strike') ? 'is-active' : ''}`}
                    title="Strikethrough"
                    aria-label="Strikethrough text"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-px h-6 bg-white/10" />

                {/* Headings & Lists Group */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-white/40 font-medium mr-2">Structure</span>
                  <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`btn-toolbar ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
                    title="Heading 1"
                    aria-label="Heading 1"
                  >
                    H1
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`btn-toolbar ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
                    title="Heading 2"
                    aria-label="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    onClick={toggleBulletList}
                    className={`btn-toolbar ${editor.isActive('bulletList') ? 'is-active' : ''}`}
                    title="Bullet list"
                    aria-label="Toggle bullet list"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleOrderedList}
                    className={`btn-toolbar ${editor.isActive('orderedList') ? 'is-active' : ''}`}
                    title="Numbered list"
                    aria-label="Toggle ordered list"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-px h-6 bg-white/10" />

                {/* Alignment Group */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-white/40 font-medium mr-2">Align</span>
                  <button
                    onClick={() => setTextAlign('left')}
                    className={`btn-toolbar ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
                    title="Align left"
                    aria-label="Align left"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTextAlign('center')}
                    className={`btn-toolbar ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
                    title="Align center"
                    aria-label="Align center"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTextAlign('right')}
                    className={`btn-toolbar ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
                    title="Align right"
                    aria-label="Align right"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTextAlign('justify')}
                    className={`btn-toolbar ${editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}`}
                    title="Justify"
                    aria-label="Justify text"
                  >
                    <AlignJustify className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-px h-6 bg-white/10" />

                {/* Special Elements Group */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-white/40 font-medium mr-2">Elements</span>
                  <button
                    onClick={toggleBlockquote}
                    className={`btn-toolbar ${editor.isActive('blockquote') ? 'is-active' : ''}`}
                    title="Blockquote"
                    aria-label="Insert blockquote"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleCode}
                    className={`btn-toolbar ${editor.isActive('code') ? 'is-active' : ''}`}
                    title="Inline code"
                    aria-label="Inline code"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleCodeBlock}
                    className={`btn-toolbar ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
                    title="Code block"
                    aria-label="Code block"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleHighlight}
                    className={`btn-toolbar ${editor.isActive('highlight') ? 'is-active' : ''}`}
                    title="Highlight"
                    aria-label="Highlight text"
                  >
                    <Highlighter className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-px h-6 bg-white/10" />

                {/* Media & Tables Group */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-white/40 font-medium mr-2">Insert</span>
                  <label className="btn-toolbar cursor-pointer" title="Insert image" aria-label="Insert image">
                    <ImageIcon className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      aria-label="Insert image file"
                    />
                  </label>
                  <button
                    onClick={addTable}
                    className="btn-toolbar"
                    title="Insert table"
                    aria-label="Insert table"
                  >
                    <TableIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={addTaskList}
                    className={`btn-toolbar ${editor.isActive('taskList') ? 'is-active' : ''}`}
                    title="Task list"
                    aria-label="Toggle task list"
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-px h-6 bg-white/10" />

                {/* Image Controls Group */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-white/40 font-medium mr-2">Image</span>
                  <button
                    onClick={() => resizeImage('25%')}
                    className="btn-toolbar"
                    title="Small image"
                    aria-label="Resize image to small"
                  >
                    S
                  </button>
                  <button
                    onClick={() => resizeImage('50%')}
                    className="btn-toolbar"
                    title="Medium image"
                    aria-label="Resize image to medium"
                  >
                    M
                  </button>
                  <button
                    onClick={() => resizeImage('75%')}
                    className="btn-toolbar"
                    title="Large image"
                    aria-label="Resize image to large"
                  >
                    L
                  </button>
                  <button
                    onClick={() => resizeImage('100%')}
                    className="btn-toolbar"
                    title="Full width image"
                    aria-label="Resize image to full width"
                  >
                    Full
                  </button>
                </div>

                <div className="w-px h-6 bg-white/10" />

                {/* AI Assist */}
                <button 
                  onClick={() => setShowAIAssist(true)} 
                  className="btn-glass-primary"
                  title="AI writing assist"
                  aria-label="AI writing assist"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Assist
                </button>
              </div>
            </div>

            {/* Editor */}
            <div className="container-glass container-glass-hover rounded-2xl p-6">
              <EditorContent 
                editor={editor} 
                className="prose prose-invert prose-purple max-w-none min-h-[600px] mobile-editor focus:outline-none text-white caret-purple-400 selection:bg-purple-600/40"
              />
            </div>
          </div>

          {/* Right: Sidebar */}
          <aside className="space-y-4 mobile-sidebar">
            {/* Cover Image */}
            <div className="container-glass container-glass-hover rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  Cover Image
                </label>
                <span className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded-full">16:9 • ≥ 1200×675</span>
              </div>
              {coverImage ? (
                <div className="relative mb-3 group">
                  <NextImage 
                    src={coverImage}
                    alt={coverAlt || 'Cover image'}
                    width={600}
                    height={338}
                    className="w-full h-40 object-cover rounded-xl border border-white/10"
                  />
                  <button
                    onClick={() => { setCoverImage(''); setIsDirty(true) }}
                    className="absolute -top-2 -right-2 bg-red-500/90 backdrop-blur-sm text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove cover image"
                    title="Remove cover image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="w-full h-40 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-white/60 hover:border-purple-400/50 hover:text-purple-400 transition-all mb-3 cursor-pointer group container-glass-hover" title="Upload cover image">
                  <Upload className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Drop image or click to upload</span>
                  <span className="text-xs text-white/40 mt-1">Supports JPG, PNG, WebP</span>
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
                  className="input-glass"
                />
              )}
            </div>

            {/* Tags */}
            <div className="container-glass container-glass-hover rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <span className="text-purple-400">#</span>
                  Tags
                </label>
                <span className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full">{tags.length}/8</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="chip-glass selected"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-white/60 hover:text-white transition-colors"
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
                  className="input-glass flex-1"
                />
                <button
                  onClick={addTag}
                  className="btn-glass-secondary"
                  aria-label="Add tag"
                  title="Add tag"
                >
                  <Plus className="w-4 h-4" />
                </button>
                {isTagInputFocused && newTag && filteredTagSuggestions.length > 0 && (
                  <div className="absolute left-0 top-11 z-20 w-full modal-glass rounded-xl shadow-xl">
                    {filteredTagSuggestions.map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          setTags(prev => [...prev, s])
                          setNewTag('')
                          setIsDirty(true)
                          setIsTagInputFocused(false)
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-3">
                <p className="text-xs text-white/70 mb-2">Suggested tags:</p>
                <div className="flex flex-wrap gap-1 mobile-chip-scroll">
                  {SUGGESTED_TAGS.slice(0, 12).map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (!tags.includes(tag) && tags.length < 8) {
                          setTags([...tags, tag])
                          setIsDirty(true)
                        }
                      }}
                      disabled={tags.includes(tag) || tags.length >= 8}
                      className="chip-glass disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mood */}
            <div className="container-glass container-glass-hover rounded-2xl p-4">
              <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Mood
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MOODS.map(moodOption => {
                  const IconComponent = moodOption.icon
                  return (
                    <button
                      key={moodOption.value}
                      onClick={() => { setMood(moodOption.value); setIsDirty(true) }}
                      className={`btn-glass-secondary ${mood === moodOption.value ? 'neon-glow' : ''}`}
                      title={`Set mood to ${moodOption.label}`}
                      aria-label={`Set mood to ${moodOption.label}`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {moodOption.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* SEO Snippet */}
            <div className="container-glass container-glass-hover rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-purple-400" />
                  SEO Preview
                </p>
                <span className={`inline-flex items-center justify-center w-8 h-6 rounded-full text-xs font-medium ${
                  seoScore >= 80 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                  seoScore >= 60 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                  'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {seoScore}
                </span>
              </div>
              <div className="text-xs text-white/50 mb-2">URL preview</div>
              <div className="text-purple-300 text-sm font-mono mb-3">armyverse.app/blogs/{slug || 'untitled'}</div>
              <div className="space-y-2 mb-3">
                <div className="text-sm text-white font-semibold line-clamp-2">{title || 'Add an SEO-friendly title'}</div>
                <div className="text-xs text-white/60 line-clamp-3">{(editor?.getText() || '').slice(0, 160) || 'Your description will appear here.'}</div>
              </div>
              <button 
                onClick={() => setShowSEO(true)} 
                className="btn-glass-secondary w-full"
                aria-label="Open detailed SEO checks"
              >
                <Settings className="w-4 h-4" />
                Detailed Analysis
              </button>
            </div>

            {/* Publish Controls */}
            <div className="container-glass container-glass-hover rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  Publish
                </p>
                <span className="text-xs text-white/50">Status</span>
              </div>
              <div className="space-y-3">
                {/* Visibility Controls */}
                {status === 'published' && (
                  <div className="space-y-2">
                    <label className="text-xs text-white/60">Visibility</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setVisibility('public')}
                        className={`btn-glass-secondary text-xs ${visibility === 'public' ? 'neon-glow' : ''}`}
                        aria-label="Set to public"
                      >
                        <Globe className="w-3 h-3" />
                        Public
                      </button>
                      <button
                        onClick={() => setVisibility('unlisted')}
                        className={`btn-glass-secondary text-xs ${visibility === 'unlisted' ? 'neon-glow' : ''}`}
                        aria-label="Set to unlisted"
                      >
                        <Users className="w-3 h-3" />
                        Unlisted
                      </button>
                      <button
                        onClick={() => setVisibility('private')}
                        className={`btn-glass-secondary text-xs ${visibility === 'private' ? 'neon-glow' : ''}`}
                        aria-label="Set to private"
                      >
                        <Lock className="w-3 h-3" />
                        Private
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => setStatus(status === 'draft' ? 'published' : 'draft')}
                    className={`btn-glass-secondary flex-1 ${status === 'published' ? 'neon-glow-pink' : ''}`}
                    aria-label={status === 'published' ? 'Switch to draft' : 'Publish blog'}
                  >
                    {status === 'published' ? (
                      <>
                        <Globe className="w-4 h-4" />
                        Published
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Draft
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-glass-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Save blog post"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
                <div className="text-xs text-white/50 text-center">
                  {status === 'published' ? 
                    (visibility === 'public' ? 'Post is live and visible to everyone' :
                     visibility === 'unlisted' ? 'Post is live but not listed publicly' :
                     'Post is live but only visible to you') : 
                    'Post is saved as draft'}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="modal-glass rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Blog Templates
                </h2>
                <button 
                  onClick={() => setShowTemplates(false)} 
                  className="btn-glass-ghost"
                  aria-label="Close templates"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { 
                    key: 'news', 
                    label: 'News Recap', 
                    description: 'Perfect for breaking news and updates',
                    content: `<h2>What happened</h2><p>—</p><h2>Why it matters</h2><p>—</p><h2>Official sources</h2><ul><li></li></ul>`,
                    icon: '📰'
                  },
                  { 
                    key: 'review', 
                    label: 'Track Review', 
                    description: 'Analyze and review BTS tracks',
                    content: `<h2>First impressions</h2><p>—</p><h2>Lyrics that hit</h2><blockquote>—</blockquote><h2>Final thoughts</h2><p>—</p>`,
                    icon: '🎵'
                  },
                  { 
                    key: 'concert', 
                    label: 'Concert Diary', 
                    description: 'Share your concert experience',
                    content: `<h2>Venue & vibe</h2><p>—</p><h2>Setlist highlights</h2><ul><li></li></ul><h2>Personal moment</h2><p>—</p>`,
                    icon: '🎤'
                  },
                  { 
                    key: 'theory', 
                    label: 'Fan Theory', 
                    description: 'Share your theories and analysis',
                    content: `<h2>The theory</h2><p>—</p><h2>Evidence</h2><ul><li></li></ul><h2>What do you think?</h2><p>—</p>`,
                    icon: '💭'
                  },
                  { 
                    key: 'guide', 
                    label: 'How-to Guide', 
                    description: 'Helpful guides for ARMY',
                    content: `<h2>What you'll need</h2><ul><li></li></ul><h2>Step by step</h2><ol><li></li></ol><h2>Tips & tricks</h2><p>—</p>`,
                    icon: '📖'
                  },
                  { 
                    key: 'opinion', 
                    label: 'Opinion Piece', 
                    description: 'Share your thoughts and opinions',
                    content: `<h2>My take</h2><p>—</p><h2>Why I think this</h2><p>—</p><h2>What's your view?</h2><p>—</p>`,
                    icon: '💬'
                  }
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => {
                      editor?.chain().focus().insertContent(t.content).run()
                      setShowTemplates(false)
                    }}
                    className="container-glass container-glass-hover rounded-xl p-4 text-left group"
                    aria-label={`Insert ${t.label} template`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{t.icon}</span>
                      <h3 className="font-semibold text-white">{t.label}</h3>
                    </div>
                    <p className="text-sm text-white/60 mb-3">{t.description}</p>
                    <div className="btn-glass-secondary w-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-4 h-4" />
                      Insert Template
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Version History */}
        {showHistory && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="modal-glass rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  Draft History
                </h2>
                <button 
                  onClick={() => setShowHistory(false)} 
                  className="btn-glass-ghost"
                  aria-label="Close history"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/60">No versions yet.</p>
                  <p className="text-xs text-white/40 mt-1">Your changes will be saved automatically</p>
                </div>
              ) : (
                <div className="space-y-3">
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
                        setShowHistory(false)
                      }}
                      className="container-glass container-glass-hover rounded-xl p-4 w-full text-left group"
                      title={new Date(v.ts).toLocaleString()}
                      aria-label={`Restore version from ${new Date(v.ts).toLocaleString()}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">
                          {new Date(v.ts).toLocaleString()}
                        </span>
                        <span className="text-xs text-white/50">
                          {v.data.title ? v.data.title.slice(0, 30) + '...' : 'Untitled'}
                        </span>
                      </div>
                      <div className="text-xs text-white/60">
                        {v.data.tags.length} tags • {v.data.mood} mood
                      </div>
                      <div className="btn-glass-secondary w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <History className="w-4 h-4" />
                        Restore This Version
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEO Panel */}
        {showSEO && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="modal-glass rounded-2xl p-6 w-full max-w-3xl max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-400" />
                  SEO Analysis
                </h2>
                <button 
                  onClick={() => setShowSEO(false)} 
                  className="btn-glass-ghost"
                  aria-label="Close SEO panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* SEO Score */}
              <div className="container-glass rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Overall Score</h3>
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${
                    seoScore >= 80 ? 'bg-green-500/20 text-green-300 border-2 border-green-500/30' :
                    seoScore >= 60 ? 'bg-yellow-500/20 text-yellow-300 border-2 border-yellow-500/30' :
                    'bg-red-500/20 text-red-300 border-2 border-red-500/30'
                  }`}>
                    {seoScore}
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      seoScore >= 80 ? 'bg-green-400' :
                      seoScore >= 60 ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`}
                    style={{ width: `${seoScore}%` }}
                  ></div>
                </div>
                <p className="text-sm text-white/60">
                  {seoScore >= 80 ? 'Excellent! Your post is well-optimized.' :
                   seoScore >= 60 ? 'Good, but there are some improvements to make.' :
                   'Your post needs more optimization for better SEO.'}
                </p>
              </div>

              {/* SEO Suggestions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Suggestions</h3>
                
                {/* Title Analysis */}
                <div className="container-glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">Title Length</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      title.length >= 45 && title.length <= 60 ? 'bg-green-500/20 text-green-300' :
                      title.length >= 30 && title.length <= 70 ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {title.length} characters
                    </span>
                  </div>
                  <p className="text-sm text-white/60">
                    {title.length < 30 ? 'Title is too short. Aim for 45-60 characters.' :
                     title.length > 70 ? 'Title is too long. Keep it under 70 characters.' :
                     'Perfect length for SEO!'}
                  </p>
                </div>

                {/* Content Analysis */}
                <div className="container-glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">Content Length</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      readingTime >= 3 ? 'bg-green-500/20 text-green-300' :
                      readingTime >= 2 ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {readingTime} min read
                    </span>
                  </div>
                  <p className="text-sm text-white/60">
                    {readingTime < 2 ? 'Content is too short. Aim for at least 2-3 minutes of reading time.' :
                     'Good content length for engagement!'}
                  </p>
                </div>

                {/* Cover Image Analysis */}
                <div className="container-glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">Cover Image</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      coverImage && coverAlt ? 'bg-green-500/20 text-green-300' :
                      coverImage ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {coverImage && coverAlt ? 'Complete' : coverImage ? 'Missing alt text' : 'Missing'}
                    </span>
                  </div>
                  <p className="text-sm text-white/60">
                    {!coverImage ? 'Add a cover image to improve social sharing and SEO.' :
                     !coverAlt ? 'Add alt text to your cover image for accessibility.' :
                     'Great! Your cover image has proper alt text.'}
                  </p>
                </div>

                {/* Tags Analysis */}
                <div className="container-glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">Tags</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tags.length >= 3 && tags.length <= 8 ? 'bg-green-500/20 text-green-300' :
                      tags.length > 0 ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {tags.length} tags
                    </span>
                  </div>
                  <p className="text-sm text-white/60">
                    {tags.length === 0 ? 'Add 3-8 relevant tags to help with discoverability.' :
                     tags.length > 8 ? 'Too many tags. Keep it between 3-8 for best results.' :
                     'Good tag count for SEO!'}
                  </p>
                </div>

                {/* URL Preview */}
                <div className="container-glass rounded-xl p-4">
                  <h4 className="font-medium text-white mb-2">URL Preview</h4>
                  <div className="text-purple-300 text-sm font-mono bg-black/20 rounded-lg p-2">
                    armyverse.app/blogs/{slug || 'untitled'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Preview Overlay */}
        {showPreview && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="relative w-full max-w-4xl modal-glass rounded-2xl p-6 overflow-auto max-h-[90vh]">
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-4 right-4 btn-glass-ghost"
                aria-label="Close preview"
                title="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="space-y-6">
                {coverImage && (
                  <NextImage src={coverImage} alt={coverAlt || 'Cover image'} width={1200} height={480} className="w-full h-48 object-cover rounded-xl" />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-white mb-4">{title || 'Untitled post'}</h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map(t => (
                      <span key={t} className="chip-glass selected">{t}</span>
                    ))}
                  </div>
                  <div className="text-sm text-white/60 mb-6">
                    /{slug} • {readingTime} min read • Mood: {mood}
                  </div>
                </div>
                <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
              </div>
            </div>
          </div>
        )}

        {/* AI Assist Panel */}
        {showAIAssist && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="modal-glass rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  AI Writing Assist
                </h2>
                <button 
                  onClick={() => setShowAIAssist(false)} 
                  className="btn-glass-ghost"
                  aria-label="Close AI panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    editor?.chain().focus().insertContent('<p>Summarize the above in 3 bullets…</p>').run()
                    setShowAIAssist(false)
                  }}
                  className="container-glass container-glass-hover rounded-xl p-4 w-full text-left group"
                  aria-label="Insert summary prompt"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📝</span>
                    <h3 className="font-semibold text-white">Summary Prompt</h3>
                  </div>
                  <p className="text-sm text-white/60">Insert a prompt to summarize your content</p>
                </button>
                
                <button
                  onClick={() => {
                    editor?.chain().focus().insertContent('<h2>Key Takeaways</h2><ul><li>—</li><li>—</li><li>—</li></ul>').run()
                    setShowAIAssist(false)
                  }}
                  className="container-glass container-glass-hover rounded-xl p-4 w-full text-left group"
                  aria-label="Insert key takeaways template"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🎯</span>
                    <h3 className="font-semibold text-white">Key Takeaways</h3>
                  </div>
                  <p className="text-sm text-white/60">Add a structured takeaways section</p>
                </button>

                <button
                  onClick={() => {
                    editor?.chain().focus().insertContent('<h2>Discussion Questions</h2><p>What are your thoughts on this? Share your opinion in the comments below!</p>').run()
                    setShowAIAssist(false)
                  }}
                  className="container-glass container-glass-hover rounded-xl p-4 w-full text-left group"
                  aria-label="Insert discussion questions"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">💬</span>
                    <h3 className="font-semibold text-white">Engagement</h3>
                  </div>
                  <p className="text-sm text-white/60">Add questions to encourage discussion</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 