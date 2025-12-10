'use client'

import React, { useEffect, useMemo, useState, useCallback } from 'react'
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
import HorizontalRule from '@tiptap/extension-horizontal-rule'
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
  Users,
  Maximize2,
  Minimize2,
  Keyboard,
  Minus,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  MessageSquareQuote,
  Trash2,
  RotateCcw
} from 'lucide-react'
import { BLOG_TEMPLATES, fillVariables } from '../../lib/blog/templates'
import type { BlogTemplate } from '../../lib/blog/templates'

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
  const [templateSearch, setTemplateSearch] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<BlogTemplate | null>(null)
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({})

  // Medium-like features
  const [focusMode, setFocusMode] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [showFloatingMenu, setShowFloatingMenu] = useState(false)
  
  // Mobile-specific state
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [showToolbar, setShowToolbar] = useState(true)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-400 underline hover:text-purple-300 transition-colors'
        }
      }),
      Placeholder.configure({
        placeholder: 'Tell your story... Type "/" for commands',
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
          class: 'bg-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto'
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
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-8 border-t-2 border-purple-400/30'
        }
      }),
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

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + / to show keyboard shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setShowKeyboardShortcuts(true)
      }
      // Cmd/Ctrl + Shift + F for focus mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        setFocusMode(prev => !prev)
      }
      // Esc to exit focus mode or close modals
      if (e.key === 'Escape') {
        if (focusMode) {
          setFocusMode(false)
        } else if (showKeyboardShortcuts) {
          setShowKeyboardShortcuts(false)
        } else if (showPreview) {
          setShowPreview(false)
        } else if (showTemplates) {
          setShowTemplates(false)
        } else if (showSEO) {
          setShowSEO(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusMode, showKeyboardShortcuts, showPreview, showTemplates, showSEO])

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100
      setReadingProgress(Math.min(100, Math.max(0, scrollPercentage)))
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  // New Medium-like helper functions
  const addHorizontalRule = () => editor?.chain().focus().setHorizontalRule().run()
  const addPullQuote = () => {
    const quote = window.prompt('Enter your pull quote:') || 'Enter your pull quote here...'
    editor?.chain().focus().insertContent(`<div class="pull-quote"><p>${quote}</p></div>`).run()
  }
  const setHeading = (level: 1 | 2 | 3) => editor?.chain().focus().toggleHeading({ level }).run()
  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }
  const addImageWithCaption = async (file: File) => {
    const url = await uploadImage(file)
    if (url && editor) {
      const alt = window.prompt('Add alt text for accessibility:') || ''
      const caption = window.prompt('Add caption (optional):') || ''
      if (caption) {
        editor.chain().focus().insertContent(`<figure><img src="${url}" alt="${alt}" /><figcaption>${caption}</figcaption></figure>`).run()
      } else {
        editor.chain().focus().setImage({ src: url, alt }).run()
      }
    }
  }

  // Clear all content
  const clearAllContent = () => {
    const confirmed = window.confirm('Are you sure you want to clear all content? This action cannot be undone.')
    if (confirmed && editor) {
      editor.commands.clearContent()
      setTitle('')
      setTags([])
      setMood('fun')
      setCoverImage('')
      setCoverAlt('')
      setStatus('draft')
      setVisibility('public')
      setIsDirty(false)
    }
  }

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
    <div className="min-h-screen page-gradient md:p-6 p-0 relative">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-purple-400 via-purple-500 to-pink-400 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className={`max-w-6xl mx-auto transition-all duration-300 ${focusMode ? 'max-w-4xl' : ''}`}>
        {/* Mobile-Optimized Action Bar */}
        {!focusMode && (
          <div className="container-glass rounded-none md:rounded-2xl p-3 md:p-4 mb-0 md:mb-6 sticky top-0 z-40 backdrop-blur-xl">
            {/* Mobile Header */}
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-base md:text-xl font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                <span className="hidden sm:inline">Create Blog Post</span>
                <span className="sm:hidden">New Post</span>
              </h1>
              
              {/* Mobile: Show only essential actions */}
              <div className="flex items-center gap-2">
                {/* Desktop: Show all actions */}
                <div className="hidden lg:flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setFocusMode(true)}
                    className="btn-glass-secondary text-sm"
                    title="Focus mode (Ctrl+Shift+F)"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span className="hidden xl:inline">Focus</span>
                  </button>
                  <button
                    onClick={() => setShowTemplates(v => !v)}
                    className="btn-glass-secondary text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden xl:inline">Templates</span>
                  </button>
                  <button
                    onClick={() => setShowHistory(v => !v)}
                    className="btn-glass-secondary text-sm"
                  >
                    <History className="w-4 h-4" />
                    <span className="hidden xl:inline">History</span>
                  </button>
                  <button
                    onClick={() => setShowSEO(v => !v)}
                    className={`btn-glass-secondary text-sm ${showSEO ? 'neon-glow' : ''}`}
                  >
                    <Search className="w-4 h-4" />
                    <span className="hidden xl:inline">SEO</span>
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium ${
                      seoScore >= 80 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                      seoScore >= 60 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {seoScore}
                    </span>
                  </button>
                  <button
                    onClick={() => setShowPreview(true)}
                    className="btn-glass-secondary text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden xl:inline">Preview</span>
                  </button>
                </div>

                {/* Mobile: Hamburger menu */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="lg:hidden btn-glass-secondary"
                  aria-label="Menu"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Save/Publish buttons - always visible */}
                <button
                  onClick={() => {
                    const data: BlogData = { title, content: editor.getHTML(), tags, mood, coverImage, coverAlt, status: 'draft', visibility }
                    onSave(data)
                  }}
                  className="btn-glass-secondary text-sm hidden md:inline-flex"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden lg:inline">Draft</span>
                </button>
                <button
                  onClick={() => {
                    const data: BlogData = { title, content: editor.getHTML(), tags, mood, coverImage, coverAlt, status: 'published', visibility }
                    onSave(data)
                  }}
                  disabled={isSaving}
                  className="btn-glass-primary text-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">{status === 'published' ? 'Update' : 'Publish'}</span>
                </button>
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {showMobileMenu && (
              <div className="lg:hidden mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                <button onClick={() => { setFocusMode(true); setShowMobileMenu(false) }} className="btn-glass-secondary text-sm justify-start">
                  <Maximize2 className="w-4 h-4" /> Focus
                </button>
                <button onClick={() => { setShowTemplates(true); setShowMobileMenu(false) }} className="btn-glass-secondary text-sm justify-start">
                  <FileText className="w-4 h-4" /> Templates
                </button>
                <button onClick={() => { setShowHistory(true); setShowMobileMenu(false) }} className="btn-glass-secondary text-sm justify-start">
                  <History className="w-4 h-4" /> History
                </button>
                <button onClick={() => { setShowSEO(true); setShowMobileMenu(false) }} className="btn-glass-secondary text-sm justify-start">
                  <Search className="w-4 h-4" /> SEO {seoScore}
                </button>
                <button onClick={() => { setShowPreview(true); setShowMobileMenu(false) }} className="btn-glass-secondary text-sm justify-start">
                  <Eye className="w-4 h-4" /> Preview
                </button>
                <button onClick={() => { clearAllContent(); setShowMobileMenu(false) }} className="btn-glass-secondary text-sm justify-start hover:bg-red-500/20">
                  <Trash2 className="w-4 h-4" /> Clear
                </button>
                <button onClick={() => { setShowKeyboardShortcuts(true); setShowMobileMenu(false) }} className="btn-glass-secondary text-sm justify-start">
                  <Keyboard className="w-4 h-4" /> Shortcuts
                </button>
                <button
                  onClick={() => {
                    const data: BlogData = { title, content: editor.getHTML(), tags, mood, coverImage, coverAlt, status: 'draft', visibility }
                    onSave(data)
                    setShowMobileMenu(false)
                  }}
                  className="btn-glass-secondary text-sm justify-start md:hidden"
                >
                  <Save className="w-4 h-4" /> Save Draft
                </button>
              </div>
            )}
          </div>
        )}

        {/* Focus Mode Exit Button */}
        {focusMode && (
          <div className="fixed top-6 right-6 z-40">
            <button
              onClick={() => setFocusMode(false)}
              className="btn-glass-primary"
              title="Exit focus mode (Esc)"
              aria-label="Exit focus mode"
            >
              <Minimize2 className="w-4 h-4" />
              Exit Focus
            </button>
          </div>
        )}

        {/* Main Content Grid */}
        <div id="main-content" className={`grid gap-6 mobile-grid ${focusMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]'}`}>
          {/* Left: Title + Toolbar + Editor */}
          <div>
            {/* Title */}
            <div className="container-glass container-glass-hover rounded-none md:rounded-2xl p-4 md:p-6 mb-4">
              <input
                type="text"
                placeholder="Enter your blog title..."
                value={title}
                onChange={(e) => { setTitle(e.target.value); setIsDirty(true) }}
                className="w-full text-2xl md:text-4xl font-extrabold bg-transparent border-none outline-none text-white placeholder-white/50 mb-2 focus:outline-none"
              />
              <div className="flex items-center justify-between text-xs text-white/60 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isDirty ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                  <span className="text-xs">
                    {isDirty ? 'Unsaved changes' : (lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Not saved yet')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="hidden sm:inline text-white/40">/{slug || 'untitled'}</span>
                  <span className="text-white/40 hidden sm:inline">•</span>
                  <span className="text-white/60">{readingTime} min read</span>
                </div>
              </div>
            </div>

            {/* Editor Toolbar */}
            {!focusMode && (
              <div className="container-glass rounded-none md:rounded-2xl p-3 md:p-4 mb-4 md:mb-6">
                {/* Mobile: Collapsible toolbar with toggle */}
                <div className="flex items-center justify-between mb-2 md:hidden">
                  <button
                    onClick={() => setShowToolbar(!showToolbar)}
                    className="btn-glass-secondary text-sm w-full justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Formatting Tools
                    </span>
                    {showToolbar ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Toolbar Content - Collapsible on mobile */}
                <div className={`${showToolbar ? 'block' : 'hidden md:block'}`}>
                  <div className="flex items-center gap-2 overflow-x-auto md:flex-wrap pb-2 md:pb-0 scrollbar-hide">
                    {/* Typography Group */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs text-white/40 font-medium mr-1 hidden md:inline">Typography</span>
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

                    <div className="w-px h-6 bg-white/10 hidden md:block" />

                    {/* Headings & Lists Group */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs text-white/40 font-medium mr-1 hidden md:inline">Structure</span>
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

                    <div className="w-px h-6 bg-white/10 hidden md:block" />

                    {/* Alignment Group */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs text-white/40 font-medium mr-1 hidden lg:inline">Align</span>
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

                    <div className="w-px h-6 bg-white/10 hidden md:block" />

                    {/* Special Elements Group */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs text-white/40 font-medium mr-1 hidden lg:inline">Elements</span>
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
                  <button
                    onClick={addHorizontalRule}
                    className="btn-toolbar"
                    title="Horizontal divider"
                    aria-label="Insert horizontal rule"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={addPullQuote}
                    className={`btn-toolbar ${editor.isActive('pullQuote') ? 'is-active' : ''}`}
                    title="Pull quote"
                    aria-label="Insert pull quote"
                  >
                    <MessageSquareQuote className="w-4 h-4" />
                  </button>
                </div>

                    <div className="w-px h-6 bg-white/10 hidden md:block" />

                    {/* Media & Tables Group */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs text-white/40 font-medium mr-1 hidden lg:inline">Insert</span>
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

                    <div className="w-px h-6 bg-white/10 hidden lg:block" />

                    {/* Image Controls Group - Hidden on small screens */}
                    <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs text-white/40 font-medium mr-1">Image</span>
                      <button onClick={() => resizeImage('25%')} className="btn-toolbar text-xs" title="Small image">S</button>
                      <button onClick={() => resizeImage('50%')} className="btn-toolbar text-xs" title="Medium image">M</button>
                      <button onClick={() => resizeImage('75%')} className="btn-toolbar text-xs" title="Large image">L</button>
                      <button onClick={() => resizeImage('100%')} className="btn-toolbar text-xs" title="Full width">Full</button>
                    </div>

                    <div className="w-px h-6 bg-white/10 hidden md:block" />

                    {/* AI Assist */}
                    <button 
                      onClick={() => setShowAIAssist(true)} 
                      className="btn-glass-primary text-sm flex-shrink-0"
                      title="AI writing assist"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline">AI Assist</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Editor */}
            <div className="container-glass rounded-none md:rounded-2xl p-4 md:p-6 relative">
              <EditorContent
                editor={editor}
                className={`prose prose-invert prose-purple prose-base md:prose-lg max-w-none min-h-[400px] md:min-h-[600px] focus:outline-none text-white caret-purple-400 selection:bg-purple-600/40 ${
                  focusMode ? 'prose-xl leading-relaxed' : ''
                }`}
                style={{
                  fontSize: focusMode ? '1.125rem' : undefined,
                  lineHeight: focusMode ? '1.8' : undefined,
                }}
              />
            </div>
          </div>

          {/* Desktop: Sidebar - Hidden on mobile */}
          {!focusMode && (
            <aside className="hidden lg:block space-y-4">
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
          )}

          {/* Mobile: Floating Action Button for Sidebar */}
          {!focusMode && (
            <>
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="lg:hidden fixed bottom-6 right-6 z-40 btn-glass-primary w-14 h-14 rounded-full shadow-2xl"
                aria-label="Open settings"
              >
                <Settings className="w-6 h-6" />
              </button>

              {/* Mobile: Bottom Sheet Sidebar */}
              {showMobileSidebar && (
                <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={() => setShowMobileSidebar(false)}>
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-[#0f0b16]/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl max-h-[85vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Handle bar */}
                    <div className="sticky top-0 bg-[#0f0b16]/95 backdrop-blur-xl z-10 p-4 pb-3 border-b border-white/5">
                      <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3" />
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Post Settings</h2>
                        <button
                          onClick={() => setShowMobileSidebar(false)}
                          className="btn-glass-ghost w-8 h-8 p-0"
                          aria-label="Close settings"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-4 pb-8">
                      {/* All sidebar content will go here - same as desktop */}
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
                              className="absolute -top-2 -right-2 bg-red-500/90 backdrop-blur-sm text-white rounded-full p-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                              aria-label="Remove cover image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="w-full h-40 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-white/60 hover:border-purple-400/50 hover:text-purple-400 transition-all mb-3 cursor-pointer group container-glass-hover">
                            <Upload className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">Drop image or click to upload</span>
                            <span className="text-xs text-white/40 mt-1">JPG, PNG, WebP</span>
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
                            <span key={tag} className="chip-glass selected">
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="ml-2 text-white/60 hover:text-white transition-colors"
                                aria-label={`Remove tag ${tag}`}
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
                              if (e.key === 'Enter') { e.preventDefault(); addTag() }
                              if (e.key === 'Escape') { setIsTagInputFocused(false); (e.target as HTMLInputElement).blur() }
                            }}
                            onFocus={() => setIsTagInputFocused(true)}
                            onBlur={() => setTimeout(() => setIsTagInputFocused(false), 150)}
                            className="input-glass flex-1"
                          />
                          <button onClick={addTag} className="btn-glass-secondary" aria-label="Add tag">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-3">
                          <p className="text-xs text-white/70 mb-2">Suggested tags:</p>
                          <div className="flex flex-wrap gap-1.5">
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
                                className="chip-glass disabled:opacity-50 text-xs"
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
                              >
                                <IconComponent className="w-4 h-4" />
                                {moodOption.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Publish Controls */}
                      <div className="container-glass container-glass-hover rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm text-white flex items-center gap-2">
                            <Globe className="w-4 h-4 text-purple-400" />
                            Publish
                          </p>
                        </div>
                        <div className="space-y-3">
                          {status === 'published' && (
                            <div className="space-y-2">
                              <label className="text-xs text-white/60">Visibility</label>
                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  onClick={() => setVisibility('public')}
                                  className={`btn-glass-secondary text-xs ${visibility === 'public' ? 'neon-glow' : ''}`}
                                >
                                  <Globe className="w-3 h-3" />
                                  Public
                                </button>
                                <button
                                  onClick={() => setVisibility('unlisted')}
                                  className={`btn-glass-secondary text-xs ${visibility === 'unlisted' ? 'neon-glow' : ''}`}
                                >
                                  <Users className="w-3 h-3" />
                                  Unlisted
                                </button>
                                <button
                                  onClick={() => setVisibility('private')}
                                  className={`btn-glass-secondary text-xs ${visibility === 'private' ? 'neon-glow' : ''}`}
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
                              className="btn-glass-primary flex-1 disabled:opacity-50"
                            >
                              <Save className="w-4 h-4" />
                              {isSaving ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-6">
            <div className="modal-glass rounded-2xl p-4 md:p-6 w-full max-w-4xl max-h-[85vh] md:max-h-[80vh] overflow-auto">
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
              <div className="mb-4">
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Search templates..."
                  className="input-glass w-full"
                  aria-label="Search templates"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {BLOG_TEMPLATES
                  .filter(t => {
                    const q = templateSearch.toLowerCase()
                    if (!q) return true
                    return t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
                  })
                  .map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTemplate(t)
                      if (t.fields && t.fields.length > 0) {
                        const initVars: Record<string, string> = {}
                        t.fields.forEach(f => { initVars[f.name] = '' })
                        setTemplateVars(initVars)
                      } else {
                        const content = t.content
                        const hasContent = (editor.getText() || '').trim().length > 0
                        if (hasContent) {
                          const choice = window.prompt('Replace current content? Type R for Replace, A for Append, or Cancel')
                          if (choice?.toLowerCase() === 'r') {
                            editor.commands.setContent(content)
                          } else if (choice?.toLowerCase() === 'a') {
                            editor.chain().focus().setHorizontalRule().insertContent(content).run()
                          } else {
                            return
                          }
                        } else {
                          editor.commands.setContent(content)
                        }
                        if (t.defaults?.mood) setMood(t.defaults.mood)
                        if (t.defaults?.tags?.length) setTags(prev => Array.from(new Set([...(prev || []), ...t.defaults!.tags!])))
                        localStorage.setItem('lastUsedTemplateId', t.id)
                        setShowTemplates(false)
                      }
                    }}
                    className="container-glass container-glass-hover rounded-xl p-4 text-left group"
                    aria-label={`Insert ${t.label} template`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{t.icon}</span>
                      <h3 className="font-semibold text-white">{t.label}</h3>
                      <span className="ml-auto text-xs text-white/40">v{t.version}</span>
                    </div>
                    <p className="text-sm text-white/60 mb-3">{t.description}</p>
                    <div className="btn-glass-secondary w-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-4 h-4" />
                      Insert Template
                    </div>
                  </button>
                ))}
              </div>

              {selectedTemplate && selectedTemplate.fields && selectedTemplate.fields.length > 0 && (
                <div className="mt-6 container-glass rounded-xl p-4">
                  <h3 className="text-white font-medium mb-3">Fill Template Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedTemplate.fields.map(f => (
                      <div key={f.name} className="flex flex-col gap-1">
                        <label className="text-xs text-white/70">{f.label}{f.required ? ' *' : ''}</label>
                        <input
                          type="text"
                          value={templateVars[f.name] ?? ''}
                          onChange={(e) => setTemplateVars(v => ({ ...v, [f.name]: e.target.value }))}
                          placeholder={f.placeholder || ''}
                          className="input-glass"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button className="btn-glass-ghost" onClick={() => { setSelectedTemplate(null); setTemplateVars({}) }}>Cancel</button>
                    <button
                      className="btn-glass-primary"
                      onClick={() => {
                        if (!selectedTemplate) return
                        const missing = (selectedTemplate.fields || []).filter(f => f.required && !(templateVars[f.name] || '').trim())
                        if (missing.length > 0) {
                          alert(`Please fill: ${missing.map(m => m.label).join(', ')}`)
                          return
                        }
                        const content = fillVariables(selectedTemplate.content, templateVars)
                        const hasContent = (editor.getText() || '').trim().length > 0
                        if (hasContent) {
                          const choice = window.prompt('Replace current content? Type R for Replace, A for Append, or Cancel')
                          if (choice?.toLowerCase() === 'r') {
                            editor.commands.setContent(content)
                          } else if (choice?.toLowerCase() === 'a') {
                            editor.chain().focus().setHorizontalRule().insertContent(content).run()
                          } else {
                            return
                          }
                        } else {
                          editor.commands.setContent(content)
                        }
                        if (selectedTemplate.defaults?.mood) setMood(selectedTemplate.defaults.mood)
                        if (selectedTemplate.defaults?.tags?.length) setTags(prev => Array.from(new Set([...(prev || []), ...selectedTemplate.defaults!.tags!])))
                        localStorage.setItem('lastUsedTemplateId', selectedTemplate.id)
                        setShowTemplates(false)
                        setSelectedTemplate(null)
                        setTemplateVars({})
                      }}
                    >
                      Insert
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Version History */}
        {showHistory && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-6">
            <div className="modal-glass rounded-2xl p-4 md:p-6 w-full max-w-2xl max-h-[85vh] md:max-h-[80vh] overflow-auto">
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
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-6">
            <div className="modal-glass rounded-2xl p-4 md:p-6 w-full max-w-3xl max-h-[85vh] md:max-h-[80vh] overflow-auto">
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
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-6">
            <div className="relative w-full max-w-4xl modal-glass rounded-2xl p-4 md:p-6 overflow-auto max-h-[90vh]">
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
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-6">
            <div className="modal-glass rounded-2xl p-4 md:p-6 w-full max-w-md max-h-[85vh] overflow-auto">
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

        {/* Keyboard Shortcuts Modal */}
        {showKeyboardShortcuts && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-6">
            <div className="modal-glass rounded-2xl p-4 md:p-6 w-full max-w-2xl max-h-[85vh] md:max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-purple-400" />
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setShowKeyboardShortcuts(false)}
                  className="btn-glass-ghost"
                  aria-label="Close keyboard shortcuts"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Formatting Shortcuts */}
                <div className="container-glass rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-purple-300 mb-3">Formatting</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Bold</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">Ctrl+B</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Italic</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">Ctrl+I</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Underline</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">Ctrl+U</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Code</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">Ctrl+E</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Link</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">Ctrl+K</kbd>
                    </div>
                  </div>
                </div>

                {/* Structure Shortcuts */}
                <div className="container-glass rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-purple-300 mb-3">Structure</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Heading 1</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">Ctrl+Alt+1</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Heading 2</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">Ctrl+Alt+2</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Heading 3</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">Ctrl+Alt+3</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Bullet List</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">Ctrl+Shift+8</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Numbered List</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">Ctrl+Shift+7</kbd>
                    </div>
                  </div>
                </div>

                {/* Editor Actions */}
                <div className="container-glass rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-purple-300 mb-3">Editor Actions</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Focus Mode</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">Ctrl+Shift+F</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Shortcuts</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">Ctrl+/</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Save Draft</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">Ctrl+S</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Undo</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">Ctrl+Z</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Redo</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">Ctrl+Shift+Z</kbd>
                    </div>
                  </div>
                </div>

                {/* Insert Elements */}
                <div className="container-glass rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-purple-300 mb-3">Insert</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Slash Commands</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">/</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Horizontal Rule</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">---</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Code Block</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">```</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Quote</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs">&gt;</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-purple-500/10 border border-purple-400/30 rounded-xl">
                <p className="text-sm text-white/70">
                  <span className="font-semibold text-purple-300">Tip:</span> Type <kbd className="px-2 py-1 bg-white/10 rounded text-white/90 font-mono text-xs mx-1">/</kbd> at the start of a line to see all available block commands!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 