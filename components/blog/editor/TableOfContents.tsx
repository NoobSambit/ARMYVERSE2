'use client'

import React, { useMemo, useEffect, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { ChevronRight, ChevronDown, List } from 'lucide-react'

interface TOCItem {
  id: string
  text: string
  level: number
  pos: number
  collapsed?: boolean
  children?: TOCItem[]
}

interface TableOfContentsProps {
  editor: Editor
  items: TOCItem[]
  onNavigate?: (id: string) => void
  showHeader?: boolean
  onToggleCollapse?: (item: TOCItem) => void
}

export function TableOfContents({
  editor,
  items,
  onNavigate,
  showHeader = true,
  onToggleCollapse,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  // Track active section from selection
  useEffect(() => {
    if (!editor) return

    const updateActive = () => {
      const from = editor.state.selection.from
      const current = [...items]
        .sort((a, b) => a.pos - b.pos)
        .filter(item => item.pos <= from)
        .pop()
      setActiveId(current?.id || '')
    }

    updateActive()
    editor.on('selectionUpdate', updateActive)
    editor.on('transaction', updateActive)

    return () => {
      editor.off('selectionUpdate', updateActive)
      editor.off('transaction', updateActive)
    }
  }, [editor, items])

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleClick = (item: TOCItem) => {
    editor.chain().focus().setTextSelection(item.pos).run()
    const dom = editor.view.domAtPos(item.pos).node
    const element =
      (dom.nodeType === Node.ELEMENT_NODE ? (dom as Element) : dom.parentElement)?.closest(
        'h1, h2, h3'
      )

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    onNavigate?.(item.id)
  }

  const flattenItems = (items: TOCItem[], parentId = ''): TOCItem[] => {
    const result: TOCItem[] = []

    items.forEach(item => {
      const id = `${parentId}-${item.id}`.replace(/^-/, '')
      result.push({ ...item, id })
      if (item.children) {
        result.push(...flattenItems(item.children, id))
      }
    })

    return result
  }

  const flatItems = useMemo(() => flattenItems(items), [items])

  // Group items by their level hierarchy
  const renderTOC = (items: TOCItem[], level = 0) => {
    return items.map((item, index) => {
      const itemId = `toc-${level}-${index}`
      const isSectionCollapsed = collapsedSections.has(itemId)
      const isActive = activeId === item.id
      const isHeadingCollapsed = Boolean(item.collapsed)
      const hasChildren = item.children && item.children.length > 0

      return (
        <div key={item.id} className="toc-item-wrapper">
          <div
            className={`toc-item-light level-${item.level} ${isActive ? 'active' : ''} ${
              isHeadingCollapsed ? 'is-collapsed' : ''
            }`}
            onClick={() => handleClick(item)}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSection(itemId)
                }}
                className="mr-1 hover:bg-gray-100 rounded p-0.5"
              >
                {isSectionCollapsed ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}
            <span className="truncate">{item.text}</span>
            {onToggleCollapse && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleCollapse(item)
                }}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600"
                aria-label={isHeadingCollapsed ? 'Expand section' : 'Collapse section'}
                title={isHeadingCollapsed ? 'Expand section' : 'Collapse section'}
              >
                {isHeadingCollapsed ? 'Expand' : 'Collapse'}
              </button>
            )}
          </div>

          {hasChildren && !isSectionCollapsed && (
            <div className="ml-2 mt-1">
              {renderTOC(item.children!, level + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="toc-light">
      {showHeader && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <List className="w-4 h-4 text-purple-600" />
            Outline
          </h3>
          <span className="text-xs text-gray-500">{flatItems.length} sections</span>
        </div>
      )}

      <nav className="space-y-1">
        {renderTOC(items)}
      </nav>

      {flatItems.length > 5 && (
        <button
          onClick={() => {
            editor.commands.focus('start')
          }}
          className="w-full mt-3 text-xs text-purple-600 hover:text-purple-700 text-center"
        >
          Scroll to top
        </button>
      )}
    </div>
  )
}

/**
 * Hook to extract table of contents from editor
 */
export function useTableOfContents(editor: Editor | null) {
  const [items, setItems] = useState<TOCItem[]>([])

  useEffect(() => {
    if (!editor) return

    const extractTOC = () => {
      const tocItems: TOCItem[] = []
      const stack: { level: number; items: TOCItem[] }[] = [{ level: 0, items: tocItems }]

      editor.state.doc.descendants((node: any, pos: number) => {
        if (node.type.name === 'heading') {
          const level = node.attrs.level
          const text = node.textContent
          const id = `heading-${pos}`

          const item: TOCItem = { id, text, level, pos, collapsed: node.attrs.collapsed }

          // Find the right parent level
          while (stack.length > 1 && stack[stack.length - 1].level >= level) {
            stack.pop()
          }

          const parent = stack[stack.length - 1]
          parent.items.push(item)

          // Push this item as a potential parent
          stack.push({ level, items: [] })
        }
      })

      // Build hierarchy
      const buildHierarchy = (items: TOCItem[], currentLevel = 1): TOCItem[] => {
        const result: TOCItem[] = []
        let i = 0

        while (i < items.length) {
          const item = items[i]

          if (item.level > currentLevel) {
            // This item and subsequent ones at this level belong to a nested structure
            const nestedItems = buildHierarchy(items.slice(i), item.level)
            if (result.length > 0) {
              result[result.length - 1].children = nestedItems
            }
            break
          }

          result.push(item)
          i++
        }

        return result
      }

      setItems(buildHierarchy(tocItems))
    }

    extractTOC()

    // Update on content changes
    const handleUpdate = () => {
      extractTOC()
    }

    editor.on('update', handleUpdate)
    editor.on('transaction', handleUpdate)

    return () => {
      editor.off('update', handleUpdate)
      editor.off('transaction', handleUpdate)
    }
  }, [editor])

  return items
}

// Intentionally no DOM mutation helpers; TOC uses editor state for navigation.
