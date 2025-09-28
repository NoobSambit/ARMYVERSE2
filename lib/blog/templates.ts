import type { JSONContent } from '@tiptap/core'

/**
 * Typed, versioned templates for BlogEditor.
 * - Content is TipTap JSONContent (no HTML strings).
 * - Optional variable placeholders like {{track}} inside text nodes.
 * - Optional defaults (mood, tags) and required section headings for light validation.
 * To add a new template: add an entry to BLOG_TEMPLATES, bump version when structure changes.
 */

export type BlogTemplateId =
  | 'news'
  | 'review'
  | 'concert'
  | 'theory'
  | 'guide'
  | 'opinion'

export type TemplateField = {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  suggestions?: string[]
}

export interface BlogTemplate {
  id: BlogTemplateId
  label: string
  description: string
  icon: string
  version: number
  defaults?: {
    mood?: string
    tags?: string[]
  }
  fields?: TemplateField[]
  requiredHeadings?: string[]
  content: JSONContent
}

// Helpers to build TipTap nodes
function h2(text: string): JSONContent {
  return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] }
}
function p(text = '—'): JSONContent {
  return { type: 'paragraph', content: [{ type: 'text', text }] }
}
function ul(items: string[]): JSONContent {
  return {
    type: 'bulletList',
    content: items.map(i => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: i }] }] }))
  }
}
function ol(items: string[]): JSONContent {
  return {
    type: 'orderedList',
    content: items.map(i => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: i }] }] }))
  }
}
function quote(text: string): JSONContent {
  return { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] }
}

export const BLOG_TEMPLATES: BlogTemplate[] = [
  {
    id: 'news',
    label: 'News Recap',
    description: 'Perfect for breaking news and updates',
    icon: '📰',
    version: 1,
    defaults: { tags: ['#BTS', '#News'] },
    requiredHeadings: ['What happened', 'Why it matters', 'Official sources'],
    content: {
      type: 'doc',
      content: [
        h2('What happened'), p(),
        h2('Why it matters'), p(),
        h2('Official sources'), ul(['Add source here'])
      ]
    }
  },
  {
    id: 'review',
    label: 'Track Review',
    description: 'Analyze and review BTS tracks',
    icon: '🎵',
    version: 1,
    defaults: { tags: ['#Review'] },
    fields: [
      { name: 'track', label: 'Track', placeholder: 'e.g., Spring Day', required: true },
      { name: 'favoriteLyric', label: 'Favorite lyric', placeholder: 'Paste a line (optional)' }
    ],
    requiredHeadings: ['First impressions', 'Lyrics that hit', 'Final thoughts'],
    content: {
      type: 'doc',
      content: [
        h2('First impressions on {{track}}'), p(),
        h2('Lyrics that hit'), quote('{{favoriteLyric}}'),
        h2('Final thoughts'), p()
      ]
    }
  },
  {
    id: 'concert',
    label: 'Concert Diary',
    description: 'Share your concert experience',
    icon: '🎤',
    version: 1,
    fields: [
      { name: 'venue', label: 'Venue', placeholder: 'e.g., Jamsil Olympic Stadium', required: true },
      { name: 'city', label: 'City', placeholder: 'e.g., Seoul' },
      { name: 'date', label: 'Date', placeholder: 'YYYY-MM-DD' }
    ],
    content: {
      type: 'doc',
      content: [
        h2('Venue & vibe at {{venue}} {{city}} {{date}}'), p(),
        h2('Setlist highlights'), ul(['Add song here']),
        h2('Personal moment'), p()
      ]
    }
  },
  {
    id: 'theory',
    label: 'Fan Theory',
    description: 'Share your theories and analysis',
    icon: '💭',
    version: 1,
    fields: [{ name: 'topic', label: 'Topic', placeholder: 'e.g., HYYH symbolism' }],
    content: {
      type: 'doc',
      content: [
        h2('The theory: {{topic}}'), p(),
        h2('Evidence'), ul(['Add evidence here']),
        h2('What do you think?'), p()
      ]
    }
  },
  {
    id: 'guide',
    label: 'How-to Guide',
    description: 'Helpful guides for ARMY',
    icon: '📖',
    version: 1,
    content: {
      type: 'doc',
      content: [
        h2("What you'll need"), ul(['Add item here']),
        h2('Step by step'), ol(['Add step here']),
        h2('Tips & tricks'), p()
      ]
    }
  },
  {
    id: 'opinion',
    label: 'Opinion Piece',
    description: 'Share your thoughts and opinions',
    icon: '💬',
    version: 1,
    content: {
      type: 'doc',
      content: [
        h2('My take'), p(),
        h2('Why I think this'), p(),
        h2("What's your view?"), p()
      ]
    }
  }
]

export function fillVariables(content: JSONContent, vars: Record<string, string>): JSONContent {
  const clone = (node: JSONContent): JSONContent => {
    let next: JSONContent = { ...node }
    if (node.text) {
      let t = node.text
      for (const [k, v] of Object.entries(vars)) {
        t = t.split(`{{${k}}}`).join(v || '')
      }
      next.text = t
    }
    if (node.content) {
      next.content = node.content.map(child => clone(child))
    }
    if (node.attrs) {
      next.attrs = { ...node.attrs }
    }
    return next
  }
  return clone(content)
}


