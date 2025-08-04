'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
import { motion } from 'framer-motion'
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
  Link as LinkIcon,
  Palette,
  Highlighter,
  Table as TableIcon,
  CheckSquare,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  Upload,
  X,
  Plus
} from 'lucide-react'

interface BlogEditorProps {
  initialContent?: string
  onSave: (data: BlogData) => void
  onAutoSave?: (data: BlogData) => void
  isSaving?: boolean
}

interface BlogData {
  title: string
  content: string
  tags: string[]
  mood: string
  coverImage?: string
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
  onSave, 
  onAutoSave,
  isSaving = false 
}: BlogEditorProps) {
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [mood, setMood] = useState('fun')
  const [coverImage, setCoverImage] = useState<string>('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [newTag, setNewTag] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)

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
      // Auto-save every 30 seconds
      if (onAutoSave) {
        const data = {
          title,
          content: editor.getHTML(),
          tags,
          mood,
          coverImage,
          status
        }
        onAutoSave(data)
      }
    },
  })

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
          status
        }
        onAutoSave(data)
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [editor, title, tags, mood, coverImage, status, onAutoSave])

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
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = () => {
    if (!editor) return

    const data: BlogData = {
      title,
      content: editor.getHTML(),
      tags,
      mood,
      coverImage,
      status
    }
    onSave(data)
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

  if (!editor) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a082a] to-[#3a1d5c] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">✍️ Create Blog Post</h1>
            <div className="flex items-center space-x-4">
                             <button
                 onClick={() => setStatus(status === 'draft' ? 'published' : 'draft')}
                 className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                   status === 'published' 
                     ? 'bg-green-500 text-white' 
                     : 'bg-gray-600 text-gray-300'
                 }`}
                 title={status === 'published' ? 'Switch to draft' : 'Publish blog'}
                 aria-label={status === 'published' ? 'Switch to draft' : 'Publish blog'}
               >
                 {status === 'published' ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                 {status === 'published' ? 'Published' : 'Draft'}
               </button>
                             <button
                 onClick={handleSave}
                 disabled={isSaving}
                 className="flex items-center px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all disabled:opacity-50"
                 title="Save blog post"
                 aria-label="Save blog post"
               >
                 <Save className="w-4 h-4 mr-2" />
                 {isSaving ? 'Saving...' : 'Save'}
               </button>
            </div>
          </div>

          {/* Title Input */}
          <input
            type="text"
            placeholder="Enter your blog title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-bold bg-transparent border-none outline-none text-white placeholder-gray-400 mb-4"
          />

          {/* Cover Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cover Image
            </label>
            <div className="flex items-center space-x-4">
              {coverImage ? (
                <div className="relative">
                  <img 
                    src={coverImage} 
                    alt="Cover" 
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setCoverImage('')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowImageUpload(true)}
                  className="w-32 h-20 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-400 transition-all"
                >
                  <Upload className="w-6 h-6" />
                </button>
              )}
              {showImageUpload && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const url = await uploadImage(file)
                      if (url) setCoverImage(url)
                      setShowImageUpload(false)
                    }
                  }}
                  className="hidden"
                />
              )}
            </div>
          </div>

          {/* Tags and Mood */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-purple-400 hover:text-purple-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1 px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-1">Suggested tags:</p>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (!tags.includes(tag)) {
                          setTags([...tags, tag])
                        }
                      }}
                      disabled={tags.includes(tag)}
                      className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mood */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mood
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MOODS.map(moodOption => (
                  <button
                    key={moodOption.value}
                    onClick={() => setMood(moodOption.value)}
                    className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                      mood === moodOption.value
                        ? 'bg-purple-500 text-white'
                        : 'bg-black/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-2">{moodOption.emoji}</span>
                    {moodOption.label.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Editor Toolbar */}
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-purple-500/20">
          <div className="flex flex-wrap items-center gap-2">
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
              >
                H1
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
              >
                H2
              </button>
              <button
                onClick={toggleBulletList}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('bulletList') ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={toggleOrderedList}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('orderedList') ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
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
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTextAlign('center')}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive({ textAlign: 'center' }) ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTextAlign('right')}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive({ textAlign: 'right' }) ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTextAlign('justify')}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
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
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                onClick={toggleCode}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('code') ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                onClick={toggleCodeBlock}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('codeBlock') ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                onClick={toggleHighlight}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('highlight') ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
              >
                <Highlighter className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-600" />

            {/* Media and Tables */}
            <div className="flex items-center space-x-1">
              <label className="p-2 rounded hover:bg-gray-700 text-gray-300 cursor-pointer">
                <ImageIcon className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={addTable}
                className="p-2 rounded hover:bg-gray-700 text-gray-300"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={addTaskList}
                className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('taskList') ? 'bg-purple-500 text-white' : 'text-gray-300'}`}
              >
                <CheckSquare className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-600" />

            {/* AI Assist */}
            <button className="flex items-center px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Assist
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
          <EditorContent 
            editor={editor} 
            className="prose prose-invert prose-purple max-w-none min-h-[600px] focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
} 