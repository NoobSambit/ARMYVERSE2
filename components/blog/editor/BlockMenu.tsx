'use client'

import type { Editor } from '@tiptap/react'

interface BlockMenuProps {
  editor: Editor
}

export function BlockMenu(_: BlockMenuProps) {
  // Disabled until @tiptap/react exposes BubbleMenu in this build.
  return null
}
