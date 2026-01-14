'use client'

import React from 'react'
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus'
import type { Editor } from '@tiptap/react'
import { Bold, Italic, Underline, Strikethrough, Code, Quote, Link as LinkIcon } from 'lucide-react'

interface BubbleMenuProps {
  editor: Editor
}

export function BubbleMenu({ editor }: BubbleMenuProps) {
  const shouldShow = ({ state, view }: { state: any; view: any }) => {
    return !state.selection.empty && editor.isEditable
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Paste a link', previousUrl || '')
    if (url === null) return
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <TiptapBubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      className="bubble-menu-light"
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`toolbar-btn-light ${editor.isActive('bold') ? 'is-active' : ''}`}
        title="Bold"
        aria-label="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`toolbar-btn-light ${editor.isActive('italic') ? 'is-active' : ''}`}
        title="Italic"
        aria-label="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`toolbar-btn-light ${editor.isActive('underline') ? 'is-active' : ''}`}
        title="Underline"
        aria-label="Underline"
      >
        <Underline className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`toolbar-btn-light ${editor.isActive('strike') ? 'is-active' : ''}`}
        title="Strike"
        aria-label="Strike"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`toolbar-btn-light ${editor.isActive('code') ? 'is-active' : ''}`}
        title="Inline code"
        aria-label="Inline code"
      >
        <Code className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`toolbar-btn-light ${editor.isActive('blockquote') ? 'is-active' : ''}`}
        title="Quote"
        aria-label="Quote"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        onClick={setLink}
        className={`toolbar-btn-light ${editor.isActive('link') ? 'is-active' : ''}`}
        title="Link"
        aria-label="Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
    </TiptapBubbleMenu>
  )
}
