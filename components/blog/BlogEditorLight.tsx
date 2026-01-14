'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import NextImage from 'next/image'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
// @ts-ignore - lowlight exports are available at runtime but not in types
import { createLowlight, common } from 'lowlight'
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
  Image as ImageIcon,
  Save,
  Eye,
  Sparkles,
  Upload,
  X,
  Plus,
  Settings,
  Globe,
  Lock,
  Users,
  Maximize2,
  Minimize2,
  HelpCircle,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  Minus,
  Link as LinkIcon,
  FileText,
  History,
  Search,
  ChevronDown,
  Type,
  Table as TableIcon
} from 'lucide-react'
import { BLOG_TEMPLATES, fillVariables } from '@/lib/blog/templates'
import type { BlogTemplate } from '@/lib/blog/templates'
import { BubbleMenu } from '@/components/blog/editor/BubbleMenu'
import { SlashCommand, getSuggestion } from '@/components/blog/editor/SlashCommandMenu'
import { TableOfContents, useTableOfContents } from '@/components/blog/editor/TableOfContents'
import { Embed } from '@/components/blog/editor/Embed'
import { LyricsBlock } from '@/components/blog/editor/LyricsBlock'
import { ImageFigure } from '@/components/blog/editor/ImageFigure'
import { HeadingWithCollapse } from '@/components/blog/editor/HeadingWithCollapse'
import { OutlineCollapse } from '@/components/blog/editor/OutlineCollapse'
import { FloatingInsertMenu } from '@/components/blog/editor/FloatingInsertMenu'
import { BlockMenu } from '@/components/blog/editor/BlockMenu'

interface BlogEditorLightProps {
  initialContent?: string
  initialData?: Partial<BlogData>
  onSave: (data: BlogData) => void
  onAutoSave?: (data: BlogData) => void
  isSaving?: boolean
  versionsKey?: string
}

export interface BlogData {
  title: string
  content: string
  tags: string[]
  mood: string
  coverImage?: string
  coverAlt?: string
  status: 'draft' | 'published'
  visibility?: 'public' | 'unlisted' | 'private'
  excerpt?: string
  seoMeta?: {
    description?: string
    slug?: string
  }
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

// Import icons for moods
import { Theater, Flame, Moon, Heart, Zap } from 'lucide-react'

export default function BlogEditorLight({
  initialContent = '',
  initialData,
  onSave,
  onAutoSave,
  isSaving = false,
  versionsKey,
}: BlogEditorLightProps) {
  // State
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [mood, setMood] = useState('fun')
  const [coverImage, setCoverImage] = useState<string>('')
  const [coverAlt, setCoverAlt] = useState<string>('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public')
  const [newTag, setNewTag] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSEO, setShowSEO] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const [lastEditAt, setLastEditAt] = useState<number | null>(null)
  const [history, setHistory] = useState<Array<{ ts: number; data: BlogData }>>([])
  const [isDirty, setIsDirty] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [showTOC, setShowTOC] = useState(true)

  // Mobile state
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [showMobileTools, setShowMobileTools] = useState(false)
  const [showMobileInsert, setShowMobileInsert] = useState(false)
  const [mobileEmbedUrl, setMobileEmbedUrl] = useState('')

  // Templates
  const [templateSearch, setTemplateSearch] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<BlogTemplate | null>(null)
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({})

  // Refs
  const editorRef = useRef<HTMLDivElement>(null)
  const mobileImageInputRef = useRef<HTMLInputElement>(null)

  // Create lowlight instance for code highlighting
  const lowlight = useMemo(() => createLowlight(common), [])

  // Editor initialization
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      HeadingWithCollapse.configure({
        levels: [1, 2, 3],
      }),
      ImageFigure,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-600 underline hover:text-purple-700 transition-colors',
        },
      }),
      Placeholder.configure({
        placeholder: 'Tell your story... Type "/" for commands',
      }),
      Typography,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      LyricsBlock,
      Embed,
      OutlineCollapse,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      SlashCommand.configure({
        suggestion: getSuggestion(),
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'not-prose pl-6',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start my-1',
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-8 border-t border-gray-300',
        },
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      setIsDirty(true)
      setLastEditAt(Date.now())
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror-light',
      },
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

  const tocItems = useTableOfContents(editor)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for link
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const url = window.prompt('Enter URL:')
        if (url && editor) {
          editor.chain().focus().setLink({ href: url }).run()
        }
      }
      // Cmd/Ctrl + Shift + F for focus mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        setFocusMode(prev => !prev)
      }
      // Cmd/Ctrl + / for shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setShowKeyboardShortcuts(true)
      }
      // Escape to exit modes
      if (e.key === 'Escape') {
        if (focusMode) setFocusMode(false)
        if (showKeyboardShortcuts) setShowKeyboardShortcuts(false)
        if (showPreview) setShowPreview(false)
        if (showTemplates) setShowTemplates(false)
        if (showSEO) setShowSEO(false)
        if (showGuide) setShowGuide(false)
        if (showMobileSidebar) setShowMobileSidebar(false)
        if (showMobileTools) setShowMobileTools(false)
        if (showMobileInsert) setShowMobileInsert(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    focusMode,
    showKeyboardShortcuts,
    showPreview,
    showTemplates,
    showSEO,
    showGuide,
    showMobileSidebar,
    showMobileTools,
    showMobileInsert,
    editor,
  ])

  // Autosave (debounced)
  useEffect(() => {
    if (!editor || !onAutoSave || !lastEditAt) return

    const timeout = setTimeout(() => {
      const data = {
        title,
        content: editor.getHTML(),
        tags,
        mood,
        coverImage,
        coverAlt,
        status,
        visibility,
      }
      onAutoSave(data)
      setLastSavedAt(Date.now())
      setIsDirty(false)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [
    editor,
    title,
    tags,
    mood,
    coverImage,
    coverAlt,
    status,
    visibility,
    onAutoSave,
    lastEditAt,
  ])

  // Warn before leaving
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // Load history
  useEffect(() => {
    if (!showHistory || !versionsKey) return
    try {
      const raw = localStorage.getItem(versionsKey)
      const parsed = raw ? JSON.parse(raw) : []
      setHistory(parsed)
    } catch {
      setHistory([])
    }
  }, [showHistory, versionsKey])

  const closeMobileSheets = () => {
    setShowMobileSidebar(false)
    setShowMobileTools(false)
    setShowMobileInsert(false)
  }

  const openMobileSidebar = () => {
    setShowMobileSidebar(prev => !prev)
    setShowMobileTools(false)
    setShowMobileInsert(false)
  }

  const openMobileTools = () => {
    setShowMobileTools(prev => !prev)
    setShowMobileSidebar(false)
    setShowMobileInsert(false)
  }

  const openMobileInsert = () => {
    setShowMobileInsert(prev => !prev)
    setShowMobileSidebar(false)
    setShowMobileTools(false)
  }

  useEffect(() => {
    const hasOverlay =
      showMobileSidebar ||
      showMobileTools ||
      showMobileInsert ||
      showTemplates ||
      showGuide ||
      showPreview ||
      showSEO
    document.body.classList.toggle('modal-open', hasOverlay)
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [showMobileSidebar, showMobileTools, showMobileInsert, showTemplates, showGuide, showPreview, showSEO])

  // Image upload
  const uploadImage = async (file: File): Promise<string | null> => {
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
      editor.chain().focus().setImageFigure({
        src: url,
        alt,
        caption,
        width: '100%',
      }).run()
    }
  }

  const parseIframe = (html: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const iframe = doc.querySelector('iframe')
    if (!iframe) return null
    return {
      src: iframe.getAttribute('src') || '',
      height: iframe.getAttribute('height') || '360',
    }
  }

  const getEmbedProvider = (url: string) => {
    const lower = url.toLowerCase()
    if (lower.includes('spotify.com')) return 'spotify'
    if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter'
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube'
    return 'generic'
  }

  const handleMobileEmbedInsert = async () => {
    const url = mobileEmbedUrl.trim()
    if (!url || !editor) return
    try {
      const res = await fetch(`/api/oembed?url=${encodeURIComponent(url)}`)
      if (!res.ok) throw new Error('Embed failed')
      const oembed = await res.json()
      if (!oembed?.html) throw new Error('Embed not supported')
      const provider = getEmbedProvider(url)
      if (provider === 'twitter') {
        editor.chain().focus().insertContent(oembed.html).run()
      } else {
        const iframe = parseIframe(oembed.html)
        if (!iframe?.src) throw new Error('Embed not supported')
        editor.chain().focus().setEmbed({
          src: iframe.src,
          provider,
          title: oembed.title || 'Embed',
          height: iframe.height,
        }).run()
      }
      setMobileEmbedUrl('')
      setShowMobileInsert(false)
    } catch (error) {
      console.error('Embed error:', error)
      alert('Could not embed that link')
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
            editor.chain().focus().setImageFigure({
              src: url,
              alt: 'Pasted image',
              width: '100%',
            }).run()
          }
        }
      }
    }
  }

  const handleDropImage = async (event: DragEvent) => {
    event.preventDefault()
    const files = event.dataTransfer?.files
    if (!files || files.length === 0 || !editor) return

    const file = files[0]
    if (file.type.startsWith('image/')) {
      const url = await uploadImage(file)
      if (url) {
        editor.chain().focus().setImageFigure({
          src: url,
          alt: 'Dropped image',
          width: '100%',
        }).run()
      }
    }
  }

  // Add paste and drop handlers
  useEffect(() => {
    if (!editor) return

    const editorElement = editor.view.dom
    const pasteHandler = (e: Event) => handlePasteImage(e as ClipboardEvent)
    const dropHandler = (e: Event) => handleDropImage(e as DragEvent)
    const dragOverHandler = (e: Event) => e.preventDefault()

    editorElement.addEventListener('paste', pasteHandler)
    editorElement.addEventListener('drop', dropHandler)
    editorElement.addEventListener('dragover', dragOverHandler)

    return () => {
      editorElement.removeEventListener('paste', pasteHandler)
      editorElement.removeEventListener('drop', dropHandler)
      editorElement.removeEventListener('dragover', dragOverHandler)
    }
  }, [editor])

  // Tag management
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 8) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
      setIsDirty(true)
      setLastEditAt(Date.now())
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
    setIsDirty(true)
    setLastEditAt(Date.now())
  }

  // Save handler
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
      visibility,
      excerpt: editor.getText().slice(0, 160),
      seoMeta: {
        slug: title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 80),
      },
    }
    onSave(data)
    setIsDirty(false)
  }

  // Formatting commands
  const toggleBold = () => editor?.chain().focus().toggleBold().run()
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run()
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run()
  const toggleStrike = () => editor?.chain().focus().toggleStrike().run()
  const toggleCode = () => editor?.chain().focus().toggleCode().run()
  const toggleCodeBlock = () => editor?.chain().focus().toggleCodeBlock().run()
  const toggleBlockquote = () => editor?.chain().focus().toggleBlockquote().run()
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run()
  const toggleTaskList = () => editor?.chain().focus().toggleTaskList().run()
  const setTextAlign = (align: 'left' | 'center' | 'right') =>
    editor?.chain().focus().setTextAlign(align).run()
  const addHorizontalRule = () => editor?.chain().focus().setHorizontalRule().run()
  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }
  const resizeImage = (width: '25%' | '50%' | '75%' | '100%') => {
    if (!editor) return
    if (editor.isActive('imageFigure')) {
      editor.chain().focus().updateAttributes('imageFigure', { width }).run()
    }
  }
  const toggleHeadingCollapse = (item: { pos: number }) => {
    if (!editor) return
    editor.commands.command(({ tr, state, dispatch }) => {
      const node = state.doc.nodeAt(item.pos)
      if (!node || node.type.name !== 'heading') return false
      tr.setNodeMarkup(item.pos, undefined, {
        ...node.attrs,
        collapsed: !node.attrs.collapsed,
      })
      tr.setMeta('outline-collapse', true)
      if (dispatch) dispatch(tr)
      return true
    })
  }

  // Computed values
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

  const wordCount = useMemo(() => {
    const text = editor?.getText() || ''
    return text.trim().split(/\s+/).filter(Boolean).length
  }, [editor])

  const seoScore = useMemo(() => {
    let score = 0
    const titleLen = title.trim().length
    const hasCover = Boolean(coverImage)
    const hasAlt = Boolean(coverAlt && coverAlt.trim().length > 0)
    const tagCount = tags.length

    // Title length (30 points)
    if (titleLen >= 45 && titleLen <= 60) score += 30
    else if (titleLen >= 30 && titleLen <= 70) score += 20

    // Content length (25 points)
    if (wordCount >= 600) score += 25
    else if (wordCount >= 300) score += 15

    // Cover image (20 points)
    if (hasCover) score += 20
    if (hasAlt) score += 10

    // Tags (15 points)
    if (tagCount >= 3 && tagCount <= 8) score += 15

    return Math.min(100, score)
  }, [title, wordCount, coverImage, coverAlt, tags])

  const filteredTagSuggestions = useMemo(() => {
    const query = newTag.toLowerCase()
    return SUGGESTED_TAGS.filter(t =>
      !tags.includes(t) && (!query || t.toLowerCase().includes(query))
    ).slice(0, 6)
  }, [newTag, tags])

  if (!editor) return null

  return (
    <div className={`editor-light-mode min-h-screen overflow-x-hidden ${focusMode ? 'focus-mode-light' : ''}`}>
      {/* Skip link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>

      <div className={`max-w-7xl mx-auto transition-all duration-300 px-3 sm:px-4 lg:px-8 pb-28 lg:pb-10 ${focusMode ? 'max-w-4xl' : ''}`}>
        {/* Top Action Bar */}
        {!focusMode && (
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 py-2 md:py-3 mb-4 md:mb-6 safe-top -mx-3 sm:-mx-4 lg:-mx-8 px-3 sm:px-4 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-3 max-w-full overflow-hidden">
              {/* Logo/Title */}
              <div className="flex items-center gap-2 shrink-0 min-w-0">
                <FileText className="w-5 h-5 text-purple-600 shrink-0" />
                <span className="text-sm font-semibold text-gray-900 sm:hidden truncate">Editor</span>
                <h1 className="text-base lg:text-lg font-semibold text-gray-900 hidden sm:block truncate">
                  Create Blog Post
                </h1>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 sm:gap-2 ml-auto shrink-0">
                <button
                  onClick={() => setFocusMode(true)}
                  className="btn-ghost-light px-2 lg:px-3 py-2 rounded-xl text-sm font-medium hidden lg:flex items-center gap-2"
                  title="Focus mode (Ctrl+Shift+F)"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="hidden xl:inline">Focus</span>
                </button>

                <button
                  onClick={() => setShowHistory(true)}
                  className="btn-ghost-light px-2 lg:px-3 py-2 rounded-xl text-sm font-medium hidden lg:flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden xl:inline">History</span>
                </button>

                <button
                  onClick={() => setShowTemplates(true)}
                  className="btn-ghost-light px-2 lg:px-3 py-2 rounded-xl text-sm font-medium hidden lg:flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden xl:inline">Templates</span>
                </button>

                <button
                  onClick={() => setShowSEO(true)}
                  className="btn-ghost-light px-2 py-2 rounded-xl text-sm font-medium hidden sm:flex items-center gap-1"
                >
                  <Search className="w-4 h-4" />
                  <span className={`seo-badge-light ${seoScore >= 80 ? 'good' : seoScore >= 60 ? 'fair' : 'poor'}`}>
                    {seoScore}
                  </span>
                </button>

                <button
                  onClick={() => setShowGuide(true)}
                  className="btn-ghost-light px-2 lg:px-3 py-2 rounded-xl text-sm font-medium hidden lg:flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="hidden xl:inline">Guide</span>
                </button>

                <button
                  onClick={() => setShowPreview(true)}
                  className="btn-ghost-light px-2 lg:px-3 py-2 rounded-xl text-sm font-medium hidden lg:flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden xl:inline">Preview</span>
                </button>

                <div className="w-px h-6 bg-gray-300 hidden lg:block" />

                <button
                  onClick={() => {
                    const data: BlogData = {
                      title,
                      content: editor.getHTML(),
                      tags,
                      mood,
                      coverImage,
                      coverAlt,
                      status: 'draft',
                      visibility,
                    }
                    onSave(data)
                  }}
                  className="btn-secondary-light px-3 py-2 rounded-xl text-sm font-medium hidden lg:block"
                >
                  Save Draft
                </button>

                <button
                  onClick={() => {
                    const data: BlogData = {
                      title,
                      content: editor.getHTML(),
                      tags,
                      mood,
                      coverImage,
                      coverAlt,
                      status: 'published',
                      visibility,
                    }
                    onSave(data)
                  }}
                  disabled={isSaving}
                  className="btn-primary-light px-3 py-2 rounded-xl text-sm font-medium hidden lg:block"
                >
                  {isSaving ? 'Publishing...' : 'Publish'}
                </button>

                {/* Mobile menu - Show only below lg */}
                <button
                  onClick={openMobileSidebar}
                  className="btn-ghost-light p-2 rounded-xl lg:hidden"
                  aria-label="Open settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Focus Mode Exit */}
        {focusMode && (
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={() => setFocusMode(false)}
              className="btn-primary-light px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Minimize2 className="w-4 h-4" />
              Exit Focus
            </button>
          </div>
        )}

        {/* Main Content */}
        <div id="main-content" className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_320px] min-w-0" ref={editorRef}>
          {/* Editor Column */}
          <div className="space-y-4 min-w-0 overflow-hidden">
            {/* Title Card */}
            <div className="card-light card-light-hover p-3 sm:p-4 md:p-6">
              <input
                type="text"
                placeholder="Give your post a title..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setIsDirty(true)
                  setLastEditAt(Date.now())
                }}
                className="w-full text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 font-serif leading-tight"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-3 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isDirty ? 'bg-yellow-400' : 'bg-green-400'}`} />
                  <span>
                    {isDirty ? 'Unsaved changes' : (lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Not saved yet')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="hidden sm:inline">/{slug || 'untitled'}</span>
                  <span>{wordCount} words</span>
                  <span>{readingTime} min read</span>
                </div>
              </div>
            </div>

            {/* Formatting Toolbar */}
            {!focusMode && (
              <div className="toolbar-light hidden lg:block">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
                  {/* Text Formatting */}
                  <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
                    <button
                      onClick={toggleBold}
                      className={`toolbar-btn-light ${editor.isActive('bold') ? 'is-active' : ''}`}
                      title="Bold"
                      aria-label="Bold text"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      onClick={toggleItalic}
                      className={`toolbar-btn-light ${editor.isActive('italic') ? 'is-active' : ''}`}
                      title="Italic"
                      aria-label="Italic text"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      onClick={toggleUnderline}
                      className={`toolbar-btn-light ${editor.isActive('underline') ? 'is-active' : ''}`}
                      title="Underline"
                      aria-label="Underline text"
                    >
                      <UnderlineIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={toggleStrike}
                      className={`toolbar-btn-light ${editor.isActive('strike') ? 'is-active' : ''}`}
                      title="Strikethrough"
                      aria-label="Strikethrough text"
                    >
                      <Strikethrough className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Headings */}
                  <div className="flex items-center gap-1 px-3 border-r border-gray-200">
                    <button
                      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                      className={`toolbar-btn-light ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
                      title="Heading 1"
                      aria-label="Heading 1"
                    >
                      <Heading1 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                      className={`toolbar-btn-light ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
                      title="Heading 2"
                      aria-label="Heading 2"
                    >
                      <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                      className={`toolbar-btn-light ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
                      title="Heading 3"
                      aria-label="Heading 3"
                    >
                      <Heading3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Lists */}
                  <div className="flex items-center gap-1 px-3 border-r border-gray-200">
                    <button
                      onClick={toggleBulletList}
                      className={`toolbar-btn-light ${editor.isActive('bulletList') ? 'is-active' : ''}`}
                      title="Bullet list"
                      aria-label="Toggle bullet list"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={toggleOrderedList}
                      className={`toolbar-btn-light ${editor.isActive('orderedList') ? 'is-active' : ''}`}
                      title="Numbered list"
                      aria-label="Toggle ordered list"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </button>
                    <button
                      onClick={toggleTaskList}
                      className={`toolbar-btn-light ${editor.isActive('taskList') ? 'is-active' : ''}`}
                      title="Task list"
                      aria-label="Toggle task list"
                    >
                      <CheckSquare className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Alignment */}
                  <div className="flex items-center gap-1 px-3 border-r border-gray-200">
                    <button
                      onClick={() => setTextAlign('left')}
                      className={`toolbar-btn-light ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
                      title="Align left"
                      aria-label="Align left"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTextAlign('center')}
                      className={`toolbar-btn-light ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
                      title="Align center"
                      aria-label="Align center"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTextAlign('right')}
                      className={`toolbar-btn-light ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
                      title="Align right"
                      aria-label="Align right"
                    >
                      <AlignRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Elements */}
                  <div className="flex items-center gap-1 px-3">
                    <button
                      onClick={toggleBlockquote}
                      className={`toolbar-btn-light ${editor.isActive('blockquote') ? 'is-active' : ''}`}
                      title="Blockquote"
                      aria-label="Insert blockquote"
                    >
                      <Quote className="w-4 h-4" />
                    </button>
                    <button
                      onClick={toggleCodeBlock}
                      className={`toolbar-btn-light ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
                      title="Code block"
                      aria-label="Code block"
                    >
                      <Code className="w-4 h-4" />
                    </button>
                    <button
                      onClick={addLink}
                      className={`toolbar-btn-light ${editor.isActive('link') ? 'is-active' : ''}`}
                      title="Add link"
                      aria-label="Add link"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={addHorizontalRule}
                      className="toolbar-btn-light"
                      title="Horizontal rule"
                      aria-label="Insert horizontal rule"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <label className="toolbar-btn-light cursor-pointer" title="Insert image" aria-label="Insert image">
                      <ImageIcon className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        aria-label="Insert image file"
                      />
                    </label>
                  </div>

                  {/* Image size */}
                  <div className="flex items-center gap-1 pl-3 border-l border-gray-200">
                    <button
                      onClick={() => resizeImage('25%')}
                      className="toolbar-btn-light text-xs font-semibold"
                      title="Small image"
                      aria-label="Set image to small width"
                    >
                      S
                    </button>
                    <button
                      onClick={() => resizeImage('50%')}
                      className="toolbar-btn-light text-xs font-semibold"
                      title="Medium image"
                      aria-label="Set image to medium width"
                    >
                      M
                    </button>
                    <button
                      onClick={() => resizeImage('75%')}
                      className="toolbar-btn-light text-xs font-semibold"
                      title="Large image"
                      aria-label="Set image to large width"
                    >
                      L
                    </button>
                    <button
                      onClick={() => resizeImage('100%')}
                      className="toolbar-btn-light text-xs font-semibold"
                      title="Full width image"
                      aria-label="Set image to full width"
                    >
                      Full
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!focusMode && (
              <>
                <div className="card-light p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between hidden lg:flex">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">Quick tips:</span>{' '}
                    Type <span className="font-mono text-gray-800">/</span> for blocks, select text for the quick menu,
                    paste images or links, and use the Lyrics block for BTS lines.
                  </div>
                  <button
                    onClick={() => setShowGuide(true)}
                    className="btn-secondary-light px-3 py-2 rounded-lg text-sm font-medium"
                  >
                    View full guide
                  </button>
                </div>
                <div className="card-light p-3 flex flex-col gap-2 lg:hidden overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-gray-600 min-w-0 flex-1">
                      Tap <span className="font-semibold text-gray-800">Format</span> or <span className="font-semibold text-gray-800">Insert</span> below. Type <span className="font-mono text-gray-800">/</span> for blocks.
                    </div>
                    <button
                      onClick={() => setShowGuide(true)}
                      className="btn-secondary-light px-3 py-1.5 rounded-xl text-xs font-medium shrink-0"
                    >
                      Guide
                    </button>
                  </div>
                  <div className="mobile-chip-scroll -mx-3 px-3">
                    <span className="tag-chip-light text-xs whitespace-nowrap">Embeds</span>
                    <span className="tag-chip-light text-xs whitespace-nowrap">Lyrics</span>
                    <span className="tag-chip-light text-xs whitespace-nowrap">Tables</span>
                    <span className="tag-chip-light text-xs whitespace-nowrap">Images</span>
                    <span className="tag-chip-light text-xs whitespace-nowrap">Outline</span>
                  </div>
                </div>
              </>
            )}

            {/* Main Editor */}
            <div className="card-light p-3 sm:p-4 md:p-8 min-h-[420px] lg:min-h-[600px] overflow-hidden">
              <EditorContent
                editor={editor}
                className="editor-content-light max-w-none mobile-editor pb-24 lg:pb-0"
              />
              <BubbleMenu editor={editor} />
              <BlockMenu editor={editor} />
              <FloatingInsertMenu editor={editor} />
            </div>
          </div>

          {/* Sidebar */}
          {!focusMode && (
            <aside className="hidden lg:block space-y-4">
              {/* Cover Image */}
              <div className="card-light card-light-hover p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    Cover Image
                  </label>
                  <span className="text-xs text-gray-500">16:9</span>
                </div>
                {coverImage ? (
                  <div className="relative mb-3 group">
                    <NextImage
                      src={coverImage}
                      alt={coverAlt || 'Cover image'}
                      width={600}
                      height={338}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setCoverImage('')
                        setIsDirty(true)
                        setLastEditAt(Date.now())
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove cover image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="cover-upload-light block">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm font-medium block">Click to upload</span>
                    <span className="text-xs">or drag and drop</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const url = await uploadImage(file)
                          if (url) {
                            setCoverImage(url)
                            setIsDirty(true)
                            setLastEditAt(Date.now())
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
                {coverImage && (
                  <input
                    type="text"
                    placeholder="Alt text for accessibility..."
                    value={coverAlt}
                  onChange={(e) => {
                    setCoverAlt(e.target.value)
                    setIsDirty(true)
                    setLastEditAt(Date.now())
                  }}
                    className="input-light px-3 py-2 rounded-lg text-sm w-full"
                  />
                )}
              </div>

              {/* Tags */}
              <div className="card-light card-light-hover p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-purple-600">#</span>
                    Tags
                  </label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{tags.length}/8</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="tag-chip-light selected"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-white/20 rounded p-0.5"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); addTag() }
                    }}
                    className="input-light px-3 py-2 rounded-lg text-sm flex-1"
                  />
                  <button
                    onClick={addTag}
                    className="btn-secondary-light px-3 rounded-lg"
                    aria-label="Add tag"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {newTag && filteredTagSuggestions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {filteredTagSuggestions.map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          setTags(prev => [...prev, s])
                          setNewTag('')
                          setIsDirty(true)
                          setLastEditAt(Date.now())
                        }}
                        className="tag-chip-light text-xs"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mood */}
              <div className="card-light card-light-hover p-4">
                <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Mood
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MOODS.map(moodOption => {
                    const IconComponent = moodOption.icon
                    return (
                      <button
                        key={moodOption.value}
                        onClick={() => {
                          setMood(moodOption.value)
                          setIsDirty(true)
                          setLastEditAt(Date.now())
                        }}
                        className={`tag-chip-light justify-center ${mood === moodOption.value ? 'selected' : ''}`}
                      >
                        <IconComponent className="w-4 h-4" />
                        {moodOption.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Table of Contents */}
              {tocItems.length > 0 && (
                <div className="card-light card-light-hover p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <List className="w-4 h-4 text-purple-600" />
                      Outline
                    </label>
                    <button
                      onClick={() => setShowTOC(!showTOC)}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label={showTOC ? 'Collapse outline' : 'Expand outline'}
                    >
                      <ChevronDown className={`w-4 h-4 ${showTOC ? '' : 'rotate-180'}`} />
                    </button>
                  </div>
                  {showTOC && (
                    <TableOfContents
                      editor={editor}
                      items={tocItems}
                      showHeader={false}
                      onToggleCollapse={toggleHeadingCollapse}
                    />
                  )}
                </div>
              )}

              {/* Editor Guide */}
              <div className="card-light card-light-hover p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    Editor Features
                  </label>
                  <button
                    onClick={() => setShowGuide(true)}
                    className="text-xs text-purple-600 hover:text-purple-700"
                  >
                    Open guide
                  </button>
                </div>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li>Type <span className="font-mono text-gray-800">/</span> to insert blocks (image, embeds, lyrics).</li>
                  <li>Select text to open the quick formatting menu.</li>
                  <li>Paste or drop images directly into the editor.</li>
                  <li>Paste YouTube/Spotify/Twitter links via the embed menu.</li>
                  <li>Use headings to build the outline and TOC.</li>
                </ul>
              </div>

              {/* Publish Controls */}
              <div className="card-light card-light-hover p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-600" />
                    Publish
                  </label>
                  <span className="text-xs text-gray-500">Status</span>
                </div>
                <div className="space-y-3">
                  {status === 'published' && (
                    <div className="space-y-2">
                      <label className="text-xs text-gray-600">Visibility</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            setVisibility('public')
                            setIsDirty(true)
                            setLastEditAt(Date.now())
                          }}
                          className={`tag-chip-light justify-center text-xs ${visibility === 'public' ? 'selected' : ''}`}
                        >
                          <Globe className="w-3 h-3" />
                          Public
                        </button>
                        <button
                          onClick={() => {
                            setVisibility('unlisted')
                            setIsDirty(true)
                            setLastEditAt(Date.now())
                          }}
                          className={`tag-chip-light justify-center text-xs ${visibility === 'unlisted' ? 'selected' : ''}`}
                        >
                          <Users className="w-3 h-3" />
                          Unlisted
                        </button>
                        <button
                          onClick={() => {
                            setVisibility('private')
                            setIsDirty(true)
                            setLastEditAt(Date.now())
                          }}
                          className={`tag-chip-light justify-center text-xs ${visibility === 'private' ? 'selected' : ''}`}
                        >
                          <Lock className="w-3 h-3" />
                          Private
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setStatus(status === 'draft' ? 'published' : 'draft')
                        setIsDirty(true)
                        setLastEditAt(Date.now())
                      }}
                      className={`tag-chip-light flex-1 justify-center ${status === 'published' ? 'selected' : ''}`}
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
                      className="btn-primary-light px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {isSaving ? '...' : 'Save'}
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
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
        </div>

        {!focusMode && (
          <div className="mobile-action-bar-light lg:hidden" role="toolbar" aria-label="Editor actions">
            <button
              type="button"
              onClick={openMobileTools}
              className={`mobile-action-btn ${showMobileTools ? 'is-active' : ''}`}
              aria-pressed={showMobileTools}
            >
              <Type className="w-5 h-5" />
              <span>Format</span>
            </button>
            <button
              type="button"
              onClick={openMobileInsert}
              className={`mobile-action-btn ${showMobileInsert ? 'is-active' : ''}`}
              aria-pressed={showMobileInsert}
            >
              <Plus className="w-5 h-5" />
              <span>Insert</span>
            </button>
            <button
              type="button"
              onClick={() => {
                closeMobileSheets()
                handleSave()
              }}
              className="mobile-action-btn"
            >
              <Save className="w-5 h-5" />
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={() => { closeMobileSheets(); setShowPreview(true) }}
              className="mobile-action-btn"
            >
              <Eye className="w-5 h-5" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={openMobileSidebar}
              className={`mobile-action-btn ${showMobileSidebar ? 'is-active' : ''}`}
              aria-pressed={showMobileSidebar}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        )}

        {/* Mobile Sidebar */}
        {showMobileSidebar && (
          <div
            className="fixed inset-0 z-50 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={closeMobileSheets}
          >
            <div
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white overflow-y-auto rounded-l-3xl shadow-2xl transition-transform duration-300"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Post settings"
            >
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-5 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-gray-900">Post Settings</h2>
                <button
                  onClick={closeMobileSheets}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setShowTemplates(true); closeMobileSheets() }}
                    className="btn-secondary-light px-3 py-2 rounded-lg text-xs font-medium"
                  >
                    Templates
                  </button>
                  <button
                    onClick={() => { setShowPreview(true); closeMobileSheets() }}
                    className="btn-secondary-light px-3 py-2 rounded-lg text-xs font-medium"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => { setShowSEO(true); closeMobileSheets() }}
                    className="btn-secondary-light px-3 py-2 rounded-lg text-xs font-medium"
                  >
                    SEO
                  </button>
                  <button
                    onClick={() => { setShowHistory(true); closeMobileSheets() }}
                    className="btn-secondary-light px-3 py-2 rounded-lg text-xs font-medium"
                  >
                    History
                  </button>
                </div>
                <button
                  onClick={() => { setFocusMode(prev => !prev); closeMobileSheets() }}
                  className="btn-ghost-light w-full px-3 py-2 rounded-lg text-xs font-medium border border-gray-200"
                >
                  {focusMode ? 'Exit focus mode' : 'Enter focus mode'}
                </button>
                {/* Same content as desktop sidebar */}
                {/* Cover Image */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">Cover Image</label>
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
                        onClick={() => {
                          setCoverImage('')
                          setIsDirty(true)
                          setLastEditAt(Date.now())
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="cover-upload-light">
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <span className="text-sm">Upload Cover</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const url = await uploadImage(file)
                            if (url) {
                              setCoverImage(url)
                              setIsDirty(true)
                              setLastEditAt(Date.now())
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                  {coverImage && (
                    <input
                      type="text"
                      placeholder="Alt text..."
                      value={coverAlt}
                      onChange={(e) => {
                        setCoverAlt(e.target.value)
                        setIsDirty(true)
                        setLastEditAt(Date.now())
                      }}
                      className="input-light px-3 py-2 rounded-lg text-sm w-full"
                    />
                  )}
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-900 block">Tags</label>
                    <span className="text-xs text-gray-500">{tags.length}/8</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <span key={tag} className="tag-chip-light selected text-sm">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                    className="input-light px-3 py-2 rounded-lg text-sm w-full"
                  />
                  {newTag && filteredTagSuggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {filteredTagSuggestions.map(s => (
                        <button
                          key={s}
                          onClick={() => {
                            setTags(prev => [...prev, s])
                            setNewTag('')
                            setIsDirty(true)
                            setLastEditAt(Date.now())
                          }}
                          className="tag-chip-light text-xs"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mood */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">Mood</label>
                  <div className="grid grid-cols-2 gap-2">
                    {MOODS.map(moodOption => {
                      const IconComponent = moodOption.icon
                      return (
                        <button
                          key={moodOption.value}
                          onClick={() => {
                            setMood(moodOption.value)
                            setIsDirty(true)
                            setLastEditAt(Date.now())
                          }}
                          className={`tag-chip-light justify-center ${mood === moodOption.value ? 'selected' : ''}`}
                        >
                          <IconComponent className="w-4 h-4" />
                          {moodOption.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {tocItems.length > 0 && (
                  <div className="card-light p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-900">Outline</label>
                      <button
                        onClick={() => setShowTOC(!showTOC)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label={showTOC ? 'Collapse outline' : 'Expand outline'}
                      >
                        <ChevronDown className={`w-4 h-4 ${showTOC ? '' : 'rotate-180'}`} />
                      </button>
                    </div>
                    {showTOC && (
                      <TableOfContents
                        editor={editor}
                        items={tocItems}
                        showHeader={false}
                        onToggleCollapse={toggleHeadingCollapse}
                      />
                    )}
                  </div>
                )}

                {/* Editor Guide */}
                <div className="card-light p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-900">Editor Features</label>
                    <button
                      onClick={() => setShowGuide(true)}
                      className="text-xs text-purple-600"
                    >
                      Guide
                    </button>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>Type <span className="font-mono text-gray-800">/</span> for blocks.</li>
                    <li>Select text for the quick menu.</li>
                    <li>Paste/drop images to insert.</li>
                  </ul>
                </div>

                {/* Publish */}
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">Publish</label>
                  {status === 'published' && (
                    <div className="space-y-2 mb-3">
                      <label className="text-xs text-gray-600">Visibility</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            setVisibility('public')
                            setIsDirty(true)
                            setLastEditAt(Date.now())
                          }}
                          className={`tag-chip-light justify-center text-xs ${visibility === 'public' ? 'selected' : ''}`}
                        >
                          <Globe className="w-3 h-3" />
                          Public
                        </button>
                        <button
                          onClick={() => {
                            setVisibility('unlisted')
                            setIsDirty(true)
                            setLastEditAt(Date.now())
                          }}
                          className={`tag-chip-light justify-center text-xs ${visibility === 'unlisted' ? 'selected' : ''}`}
                        >
                          <Users className="w-3 h-3" />
                          Unlisted
                        </button>
                        <button
                          onClick={() => {
                            setVisibility('private')
                            setIsDirty(true)
                            setLastEditAt(Date.now())
                          }}
                          className={`tag-chip-light justify-center text-xs ${visibility === 'private' ? 'selected' : ''}`}
                        >
                          <Lock className="w-3 h-3" />
                          Private
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setStatus(status === 'draft' ? 'published' : 'draft')
                        setIsDirty(true)
                        setLastEditAt(Date.now())
                      }}
                      className={`tag-chip-light flex-1 justify-center ${status === 'published' ? 'selected' : ''}`}
                    >
                      {status === 'published' ? 'Published' : 'Draft'}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="btn-primary-light px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Save
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-2">
                    {status === 'published' ?
                      (visibility === 'public' ? 'Post is live and visible to everyone' :
                       visibility === 'unlisted' ? 'Post is live but not listed publicly' :
                       'Post is live but only visible to you') :
                      'Post is saved as draft'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showMobileTools && (
          <div className="mobile-sheet-overlay lg:hidden" onClick={closeMobileSheets}>
            <div
              className="mobile-sheet-light"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Formatting options"
            >
              <div className="mobile-sheet-handle" />
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Formatting</h2>
                <button
                  onClick={closeMobileSheets}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Close formatting"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Text</div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={toggleBold}
                  className={`mobile-tool-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
                  aria-label="Bold"
                >
                  <Bold />
                  <span>Bold</span>
                </button>
                <button
                  onClick={toggleItalic}
                  className={`mobile-tool-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
                  aria-label="Italic"
                >
                  <Italic />
                  <span>Italic</span>
                </button>
                <button
                  onClick={toggleUnderline}
                  className={`mobile-tool-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
                  aria-label="Underline"
                >
                  <UnderlineIcon />
                  <span>Underline</span>
                </button>
                <button
                  onClick={toggleStrike}
                  className={`mobile-tool-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
                  aria-label="Strike"
                >
                  <Strikethrough />
                  <span>Strike</span>
                </button>
              </div>

              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4 mb-2">Headings</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`mobile-tool-btn ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
                  aria-label="Heading 1"
                >
                  <Heading1 />
                  <span>H1</span>
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`mobile-tool-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
                  aria-label="Heading 2"
                >
                  <Heading2 />
                  <span>H2</span>
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={`mobile-tool-btn ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
                  aria-label="Heading 3"
                >
                  <Heading3 />
                  <span>H3</span>
                </button>
              </div>

              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4 mb-2">Lists</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={toggleBulletList}
                  className={`mobile-tool-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
                  aria-label="Bullet list"
                >
                  <List />
                  <span>Bullets</span>
                </button>
                <button
                  onClick={toggleOrderedList}
                  className={`mobile-tool-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
                  aria-label="Numbered list"
                >
                  <ListOrdered />
                  <span>Numbered</span>
                </button>
                <button
                  onClick={toggleTaskList}
                  className={`mobile-tool-btn ${editor.isActive('taskList') ? 'is-active' : ''}`}
                  aria-label="Task list"
                >
                  <CheckSquare />
                  <span>Tasks</span>
                </button>
              </div>

              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4 mb-2">Layout</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTextAlign('left')}
                  className={`mobile-tool-btn ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
                  aria-label="Align left"
                >
                  <AlignLeft />
                  <span>Left</span>
                </button>
                <button
                  onClick={() => setTextAlign('center')}
                  className={`mobile-tool-btn ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
                  aria-label="Align center"
                >
                  <AlignCenter />
                  <span>Center</span>
                </button>
                <button
                  onClick={() => setTextAlign('right')}
                  className={`mobile-tool-btn ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
                  aria-label="Align right"
                >
                  <AlignRight />
                  <span>Right</span>
                </button>
              </div>

              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4 mb-2">Blocks</div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={toggleBlockquote}
                  className={`mobile-tool-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
                  aria-label="Blockquote"
                >
                  <Quote />
                  <span>Quote</span>
                </button>
                <button
                  onClick={toggleCodeBlock}
                  className={`mobile-tool-btn ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
                  aria-label="Code block"
                >
                  <Code />
                  <span>Code</span>
                </button>
                <button
                  onClick={addLink}
                  className={`mobile-tool-btn ${editor.isActive('link') ? 'is-active' : ''}`}
                  aria-label="Link"
                >
                  <LinkIcon />
                  <span>Link</span>
                </button>
                <button
                  onClick={addHorizontalRule}
                  className="mobile-tool-btn"
                  aria-label="Divider"
                >
                  <Minus />
                  <span>Divider</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {showMobileInsert && (
          <div className="mobile-sheet-overlay lg:hidden" onClick={closeMobileSheets}>
            <div
              className="mobile-sheet-light"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Insert options"
            >
              <div className="mobile-sheet-handle" />
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Insert</h2>
                <button
                  onClick={closeMobileSheets}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Close insert"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    mobileImageInputRef.current?.click()
                    setShowMobileInsert(false)
                  }}
                  className="mobile-tool-btn"
                  aria-label="Insert image"
                >
                  <ImageIcon />
                  <span>Image</span>
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().insertLyricsBlock().run()
                    setShowMobileInsert(false)
                  }}
                  className="mobile-tool-btn"
                  aria-label="Insert lyrics block"
                >
                  <Sparkles />
                  <span>Lyrics</span>
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                    setShowMobileInsert(false)
                  }}
                  className="mobile-tool-btn"
                  aria-label="Insert table"
                >
                  <TableIcon />
                  <span>Table</span>
                </button>
                <button
                  onClick={() => {
                    addHorizontalRule()
                    setShowMobileInsert(false)
                  }}
                  className="mobile-tool-btn"
                  aria-label="Insert divider"
                >
                  <Minus />
                  <span>Divider</span>
                </button>
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold text-gray-700">Embed media</label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste YouTube, Spotify, or Twitter link"
                    value={mobileEmbedUrl}
                    onChange={(e) => setMobileEmbedUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleMobileEmbedInsert() } }}
                    className="input-light px-3 py-2 rounded-lg text-sm flex-1"
                  />
                  <button
                    onClick={handleMobileEmbedInsert}
                    className="btn-primary-light px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-50"
                    disabled={!mobileEmbedUrl.trim()}
                  >
                    Embed
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  Supports YouTube, Spotify, and Twitter/X.
                </p>
              </div>

              <input
                ref={mobileImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay-light"
          onClick={() => setShowTemplates(false)}
        >
          <div
            className="modal-light max-w-5xl w-full max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Blog Templates</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Close templates"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              placeholder="Search templates..."
              className="input-light px-4 py-2 rounded-lg w-full mb-4"
              aria-label="Search templates"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        setIsDirty(true)
                        setLastEditAt(Date.now())
                        if (t.defaults?.mood) setMood(t.defaults.mood)
                        if (t.defaults?.tags?.length) setTags(prev => Array.from(new Set([...(prev || []), ...t.defaults!.tags!])))
                        localStorage.setItem('lastUsedTemplateId', t.id)
                        setShowTemplates(false)
                      }
                    }}
                    className="card-light card-light-hover p-4 text-left"
                    aria-label={`Insert ${t.label} template`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{t.icon}</span>
                      <h3 className="font-semibold text-gray-900">{t.label}</h3>
                      <span className="ml-auto text-xs text-gray-400">v{t.version}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{t.description}</p>
                    <div className="btn-secondary-light w-full text-center text-sm py-2 rounded-lg">
                      Insert Template
                    </div>
                  </button>
                ))}
            </div>

            {selectedTemplate && selectedTemplate.fields && selectedTemplate.fields.length > 0 && (
              <div className="mt-6 card-light p-4">
                <h3 className="text-gray-900 font-medium mb-3">Fill Template Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTemplate.fields.map(f => (
                    <div key={f.name} className="flex flex-col gap-1">
                      <label className="text-xs text-gray-600">
                        {f.label}{f.required ? ' *' : ''}
                      </label>
                      <input
                        type="text"
                        value={templateVars[f.name] ?? ''}
                        onChange={(e) => setTemplateVars(v => ({ ...v, [f.name]: e.target.value }))}
                        placeholder={f.placeholder || ''}
                        className="input-light px-3 py-2 rounded-lg text-sm"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    className="btn-secondary-light px-4 py-2 rounded-lg text-sm"
                    onClick={() => { setSelectedTemplate(null); setTemplateVars({}) }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary-light px-4 py-2 rounded-lg text-sm"
                    onClick={() => {
                      if (!selectedTemplate) return
                      const missing = (selectedTemplate.fields || []).filter(
                        f => f.required && !(templateVars[f.name] || '').trim()
                      )
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
                      setIsDirty(true)
                      setLastEditAt(Date.now())
                      if (selectedTemplate.defaults?.mood) setMood(selectedTemplate.defaults.mood)
                      if (selectedTemplate.defaults?.tags?.length) {
                        setTags(prev => Array.from(new Set([...(prev || []), ...selectedTemplate.defaults!.tags!])))
                      }
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

      {/* Editor Guide Modal */}
      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay-light"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="modal-light max-w-3xl w-full max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Editor Guide</h2>
              <button
                onClick={() => setShowGuide(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Close guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Writing & Formatting</h3>
                <ul className="space-y-1">
                  <li>Bold, italic, underline, strike</li>
                  <li>Headings H1–H3 for sections</li>
                  <li>Lists: bullet, numbered, task</li>
                  <li>Blockquote and pull quote</li>
                  <li>Tables for comparisons</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Media & Embeds</h3>
                <ul className="space-y-1">
                  <li>Drag, drop, or paste images</li>
                  <li>Embed YouTube, Spotify, Twitter/X</li>
                  <li>Lyrics block for BTS lines</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                <ul className="space-y-1">
                  <li>Type <span className="font-mono">/</span> for block menu</li>
                  <li>Select text to open quick menu</li>
                  <li>Use the Outline to jump sections</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Keyboard Shortcuts</h3>
                <ul className="space-y-1">
                  <li>Ctrl/Cmd + B/I/U for formatting</li>
                  <li>Ctrl/Cmd + K to add a link</li>
                  <li>Ctrl/Cmd + / for shortcuts</li>
                  <li>Ctrl/Cmd + Shift + F for focus mode</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-50 border border-purple-100 rounded-lg text-sm text-purple-800">
              Tip: Use Templates to quickly structure BTS analyses, lyric deep-dives, or concert recaps.
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay-light"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="modal-light max-w-4xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="card-light p-6 mb-6">
              {coverImage && (
                <div className="mb-6">
                  <NextImage
                    src={coverImage}
                    alt={coverAlt || 'Cover image'}
                    width={1200}
                    height={480}
                    className="w-full h-56 object-cover rounded-xl"
                  />
                </div>
              )}

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
                {title || 'Untitled post'}
              </h1>

              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map(t => (
                  <span key={t} className="tag-chip-light selected text-sm">
                    {t}
                  </span>
                ))}
              </div>

              <div className="text-sm text-gray-600">
                /{slug || 'untitled'} • {readingTime} min read • Mood: {mood}
              </div>
            </div>

            <div className="card-light p-6">
              <div
                className="editor-content-light max-w-none"
                dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
              />
            </div>
          </div>
        </div>
      )}

      {/* SEO Modal */}
      {showSEO && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay-light"
          onClick={() => setShowSEO(false)}
        >
          <div
            className="modal-light max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">SEO Analysis</h2>
              <button
                onClick={() => setShowSEO(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${
                seoScore >= 80 ? 'bg-green-100 text-green-600' :
                seoScore >= 60 ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                {seoScore}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {seoScore >= 80 ? 'Excellent!' : seoScore >= 60 ? 'Good progress!' : 'Needs improvement'}
              </p>
            </div>

            {/* Suggestions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Title length</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  title.length >= 45 && title.length <= 60 ? 'bg-green-100 text-green-600' :
                  title.length >= 30 && title.length <= 70 ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {title.length} chars
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Word count</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  wordCount >= 600 ? 'bg-green-100 text-green-600' :
                  wordCount >= 300 ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {wordCount} words
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Cover image</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  coverImage && coverAlt ? 'bg-green-100 text-green-600' :
                  coverImage ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {coverImage && coverAlt ? 'Complete' : coverImage ? 'No alt text' : 'Missing'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Tags</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  tags.length >= 3 && tags.length <= 8 ? 'bg-green-100 text-green-600' :
                  tags.length > 0 ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {tags.length} tags
                </span>
              </div>
            </div>

            {/* URL Preview */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">URL Preview</p>
              <p className="text-sm font-mono text-purple-600">armyverse.app/blogs/{slug || 'untitled'}</p>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay-light"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="modal-light max-w-lg w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Version History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No versions yet.</p>
                <p className="text-xs text-gray-400 mt-1">Your changes will be saved automatically</p>
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
                    className="w-full p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(v.ts).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {v.data.title ? v.data.title.slice(0, 20) + '...' : 'Untitled'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {v.data.tags.length} tags • {v.data.mood} mood
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay-light"
          onClick={() => setShowKeyboardShortcuts(false)}
        >
          <div
            className="modal-light max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Formatting</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bold</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">Ctrl+B</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Italic</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">Ctrl+I</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Underline</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">Ctrl+U</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Link</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">Ctrl+K</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Structure</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heading 1</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">Ctrl+Alt+1</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heading 2</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">Ctrl+Alt+2</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bullet List</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">Ctrl+Shift+8</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Editor</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Focus Mode</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">Ctrl+Shift+F</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shortcuts</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">Ctrl+/</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Save</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">Ctrl+S</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Close Modal</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">Esc</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Insert</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Slash Menu</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">/</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Divider</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 text-xs">---</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
