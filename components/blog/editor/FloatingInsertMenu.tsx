'use client'

import React from 'react'
import type { Editor } from '@tiptap/react'

interface FloatingInsertMenuProps {
  editor: Editor
}

type MenuItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
}

const fetchOEmbed = async (url: string) => {
  const res = await fetch(`/api/oembed?url=${encodeURIComponent(url)}`)
  if (!res.ok) return null
  return (await res.json()) as { html?: string; provider_name?: string }
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

export function FloatingInsertMenu(_: FloatingInsertMenuProps) {
  // Disabled until @tiptap/react exposes FloatingMenu in this build.
  return null
}
