'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Extension } from '@tiptap/core'
import type { Editor } from '@tiptap/react'
import { Suggestion } from '@tiptap/suggestion'
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Minus,
  CheckSquare,
  Youtube,
  MessageSquare,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LucideIcon,
  Music2,
  Quote as QuoteIcon,
  Table2,
} from 'lucide-react'

const fetchOEmbed = async (url: string) => {
  const res = await fetch(`/api/oembed?url=${encodeURIComponent(url)}`)
  if (!res.ok) return null
  return (await res.json()) as { html?: string }
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

export interface SlashCommandItem {
  id: string
  label: string
  icon: LucideIcon
  shortcut?: string
  keywords?: string[]
  action: (editor: Editor) => void
}

const categories = {
  text: {
    label: 'Basic Blocks',
    items: [
      {
        id: 'heading1',
        label: 'Heading 1',
        icon: Heading1,
        shortcut: 'Ctrl+Alt+1',
        action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        id: 'heading2',
        label: 'Heading 2',
        icon: Heading2,
        shortcut: 'Ctrl+Alt+2',
        action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        id: 'heading3',
        label: 'Heading 3',
        icon: Heading3,
        shortcut: 'Ctrl+Alt+3',
        action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      },
      {
        id: 'text',
        label: 'Text',
        icon: Type,
        action: (editor: Editor) => editor.chain().focus().setParagraph().run(),
      },
    ],
  },
  lists: {
    label: 'Lists',
    items: [
      {
        id: 'bulletList',
        label: 'Bullet List',
        icon: List,
        shortcut: 'Ctrl+Shift+8',
        action: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
      },
      {
        id: 'orderedList',
        label: 'Numbered List',
        icon: ListOrdered,
        shortcut: 'Ctrl+Shift+7',
        action: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
      },
      {
        id: 'taskList',
        label: 'Task List',
        icon: CheckSquare,
        action: (editor: Editor) => editor.chain().focus().toggleTaskList().run(),
      },
    ],
  },
  elements: {
    label: 'Elements',
    items: [
      {
        id: 'blockquote',
        label: 'Quote',
        icon: Quote,
        action: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
      },
      {
        id: 'pullQuote',
        label: 'Pull Quote',
        icon: QuoteIcon,
        action: (editor: Editor) =>
          editor
            .chain()
            .focus()
            .insertContent('<div class="pull-quote"><p>Drop your pull quote here…</p></div>')
            .run(),
      },
      {
        id: 'codeBlock',
        label: 'Code Block',
        icon: Code,
        action: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
      },
      {
        id: 'divider',
        label: 'Divider',
        icon: Minus,
        action: (editor: Editor) => editor.chain().focus().setHorizontalRule().run(),
      },
      {
        id: 'table',
        label: 'Table (3×3)',
        icon: Table2,
        action: (editor: Editor) =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      },
    ],
  },
  media: {
    label: 'Media',
    items: [
      {
        id: 'image',
        label: 'Image',
        icon: ImageIcon,
        action: (editor: Editor) => {
          // Trigger file input
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'image/*'
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (!file) return

            try {
              const formData = new FormData()
              formData.append('file', file)
              const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
              if (preset) formData.append('uploadPreset', preset)

              const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
              })

              if (response.ok) {
                const data = await response.json()
                const alt = window.prompt('Add alt text for accessibility:') || ''
                editor.chain().focus().setImageFigure({ src: data.url, alt, width: '100%' }).run()
              }
            } catch (error) {
              console.error('Upload error:', error)
            }
          }
          input.click()
        },
      },
    ],
  },
  embeds: {
    label: 'Embeds',
    items: [
      {
        id: 'youtube',
        label: 'YouTube',
        icon: Youtube,
        action: (editor: Editor) => {
          const url = window.prompt('Enter YouTube URL:')
          if (!url) return

          fetchOEmbed(url).then((oembed) => {
            if (!oembed?.html) return
            const iframe = parseIframe(oembed.html)
            if (!iframe?.src) return
            editor
              .chain()
              .focus()
              .setEmbed({
                src: iframe.src,
                provider: 'youtube',
                title: 'YouTube video',
                height: iframe.height,
              })
              .run()
          })
        },
      },
      {
        id: 'spotify',
        label: 'Spotify',
        icon: Music2,
        action: (editor: Editor) => {
          const url = window.prompt('Enter Spotify URL (track, album, or playlist):')
          if (!url) return

          fetchOEmbed(url).then((oembed) => {
            if (!oembed?.html) return
            const iframe = parseIframe(oembed.html)
            if (!iframe?.src) return
            editor
              .chain()
              .focus()
              .setEmbed({
                src: iframe.src,
                provider: 'spotify',
                title: 'Spotify embed',
                height: iframe.height,
              })
              .run()
          })
        },
      },
      {
        id: 'twitter',
        label: 'Twitter/X',
        icon: MessageSquare,
        action: (editor: Editor) => {
          const url = window.prompt('Enter Tweet URL:')
          if (!url) return

          fetchOEmbed(url).then((oembed) => {
            if (!oembed?.html) return
            editor.chain().focus().insertContent(oembed.html).run()
          })
        },
      },
    ],
  },
  bts: {
    label: 'BTS Special',
    items: [
      {
        id: 'lyrics',
        label: 'Lyrics Block',
        icon: MessageSquare,
        action: (editor: Editor) => editor.chain().focus().insertLyricsBlock().run(),
      },
    ],
  },
  alignment: {
    label: 'Alignment',
    items: [
      {
        id: 'alignLeft',
        label: 'Align Left',
        icon: AlignLeft,
        action: (editor: Editor) => editor.chain().focus().setTextAlign('left').run(),
      },
      {
        id: 'alignCenter',
        label: 'Align Center',
        icon: AlignCenter,
        action: (editor: Editor) => editor.chain().focus().setTextAlign('center').run(),
      },
      {
        id: 'alignRight',
        label: 'Align Right',
        icon: AlignRight,
        action: (editor: Editor) => editor.chain().focus().setTextAlign('right').run(),
      },
    ],
  },
} as const

// Type assertion helper to avoid complex readonly type issues
const allItems: SlashCommandItem[] = (Object.values(categories) as any).flatMap((cat: any) => cat.items)

/**
 * Create the SlashCommand extension
 */
export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          editor.chain().focus().deleteRange(range).run()
          props.action(editor)
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

/**
 * Slash Command Menu Component
 */
interface SlashCommandMenuProps {
  editor: Editor
}

export function SlashCommandMenu({ editor }: SlashCommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [search, setSearch] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  // Filter items based on search
  const filteredItems = useCallback(() => {
    if (!search) return allItems

    const searchLower = search.toLowerCase()
    return allItems.filter(item => {
      return (
        item.label.toLowerCase().includes(searchLower) ||
        item.keywords?.some(k => k.toLowerCase().includes(searchLower))
      )
    })
  }, [search])

  // Get current category for the selected item
  const getItemCategory = (itemId: string) => {
    for (const [catName, cat] of Object.entries(categories)) {
      if (cat.items.some(item => item.id === itemId)) {
        return cat.label
      }
    }
    return null
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      const items = filteredItems()

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % items.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length)
          break
        case 'Enter':
          e.preventDefault()
          const selectedItem = items[selectedIndex]
          if (selectedItem) {
            selectedItem.action(editor)
            setIsOpen(false)
            setSearch('')
          }
          break
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          setSearch('')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredItems, editor])

  // Scroll selected item into view
  useEffect(() => {
    if (!menuRef.current) return

    const selectedElement = menuRef.current.querySelector(
      `[data-index="${selectedIndex}"]`
    ) as HTMLElement

    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // Expose methods to control the menu
  useEffect(() => {
    const menu = {
      open: (pos: { top: number; left: number }, query: string) => {
        setPosition(pos)
        setSearch(query)
        setSelectedIndex(0)
        setIsOpen(true)
      },
      close: () => {
        setIsOpen(false)
        setSearch('')
      },
    }

    // Store menu instance on window for external access
    ;(window as any).__slashCommandMenu = menu

    return () => {
      delete (window as any).__slashCommandMenu
    }
  }, [])

  const items = filteredItems()

  if (!isOpen || items.length === 0) return null

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-72 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="p-2">
        {items.map((item, index) => {
          const Icon = item.icon
          const category = getItemCategory(item.id)
          const prevCategory = index > 0 ? getItemCategory(items[index - 1].id) : null

          return (
            <div key={item.id}>
              {/* Category header */}
              {category !== prevCategory && (
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {category}
                </div>
              )}

              <button
                data-index={index}
                onClick={() => {
                  item.action(editor)
                  setIsOpen(false)
                  setSearch('')
                }}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-purple-50 text-purple-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{item.label}</div>
                </div>
                {item.shortcut && (
                  <kbd className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {item.shortcut}
                  </kbd>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-gray-100 text-xs text-gray-500">
        Use ↑↓ to navigate, Enter to select
      </div>
    </div>
  )
}

/**
 * Suggestion configuration for TipTap
 */
export const getSuggestion = () => {
  return {
    items: ({ query }: { query: string }) => {
      if (!query) return allItems

      const searchLower = query.toLowerCase()
      return allItems.filter(item => {
        return (
          item.label.toLowerCase().includes(searchLower) ||
          item.keywords?.some(k => k.toLowerCase().includes(searchLower))
        )
      })
    },

    render: () => {
      let component: any
      let popup: any

      return {
        onStart: (props: any) => {
          component = new SlashCommandMenuWrapper()
          popup = props.clientRect?.() || { top: 0, left: 0 }
          component.updatePosition(popup)
          component.updateProps({ editor: props.editor, items: props.items })
          component.show()
        },

        onUpdate(props: any) {
          component?.updateProps({ editor: props.editor, items: props.items })

          if (props.clientRect) {
            popup = props.clientRect()
            component?.updatePosition(popup)
          }
        },

        onKeyDown(props: any) {
          if (props.event.key === 'Escape') {
            component?.hide()
            return true
          }

          if (props.event.key === 'ArrowDown') {
            component?.selectNext()
            return true
          }

          if (props.event.key === 'ArrowUp') {
            component?.selectPrev()
            return true
          }

          if (props.event.key === 'Enter') {
            component?.selectItem()
            return true
          }

          return false
        },

        onExit() {
          component?.destroy()
        },
      }
    },
  }
}

/**
 * Simple wrapper class for managing the slash command menu
 */
class SlashCommandMenuWrapper {
  private element: HTMLDivElement | null = null
  private selectedIndex = 0

  constructor() {
    this.element = document.createElement('div')
    this.element.className = 'slash-menu-container'
    document.body.appendChild(this.element)
  }

  updatePosition(rect: { top: number; left: number }) {
    if (!this.element) return
    this.element.style.top = `${rect.top + window.scrollY}px`
    this.element.style.left = `${rect.left}px`
  }

  updateProps(props: { editor: any; items: any[] }) {
    if (!this.element) return

    const { editor, items } = props
    this.selectedIndex = 0

    // Render the menu
    this.element.innerHTML = `
      <div class="slash-menu-light">
        ${items.map((item, index) => {
          const Icon = item.icon
          return `
            <button
              class="slash-menu-item-light ${index === 0 ? 'is-selected' : ''}"
              data-index="${index}"
            >
              <span class="icon">
                <!-- Icon would be rendered here -->
              </span>
              <span class="label">${item.label}</span>
              ${item.shortcut ? `<span class="shortcut">${item.shortcut}</span>` : ''}
            </button>
          `
        }).join('')}
      </div>
    `

    // Add click handlers
    this.element.querySelectorAll('button').forEach((button, index) => {
      button.addEventListener('click', () => {
        items[index].action(editor)
        this.hide()
      })
    })
  }

  selectNext() {
    const buttons = this.element ? this.element.querySelectorAll('button') : null
    const length = buttons ? buttons.length : 0
    this.selectedIndex = length > 0 ? (this.selectedIndex + 1) % length : 0
    this.updateSelection()
  }

  selectPrev() {
    const buttons = this.element ? this.element.querySelectorAll('button') : null
    const length = buttons ? buttons.length : 0
    this.selectedIndex = length > 0 ? (this.selectedIndex - 1 + length) % length : 0
    this.updateSelection()
  }

  selectItem() {
    const button = this.element?.querySelector(`button[data-index="${this.selectedIndex}"]`) as HTMLButtonElement
    button?.click()
  }

  private updateSelection() {
    this.element?.querySelectorAll('button').forEach((button, index) => {
      if (index === this.selectedIndex) {
        button.classList.add('is-selected')
      } else {
        button.classList.remove('is-selected')
      }
    })
  }

  show() {
    if (this.element) this.element.style.display = 'block'
  }

  hide() {
    if (this.element) this.element.style.display = 'none'
  }

  destroy() {
    this.element?.remove()
    this.element = null
  }
}
