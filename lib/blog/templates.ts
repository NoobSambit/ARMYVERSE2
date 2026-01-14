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
  | 'track-review'
  | 'album-review'
  | 'concert'
  | 'theory'
  | 'guide'
  | 'opinion'
  | 'mv-breakdown'
  | 'lyrics-deepdive'
  | 'era-overview'
  | 'member-spotlight'

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
function h3(text: string): JSONContent {
  return { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text }] }
}
function p(text = '—'): JSONContent {
  return { type: 'paragraph', content: [{ type: 'text', text }] }
}
function hr(): JSONContent {
  return { type: 'horizontalRule' }
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
function lyrics(lines: string[]): JSONContent {
  return {
    type: 'lyricsBlock',
    content: lines.map(line => p(line))
  }
}

export const BLOG_TEMPLATES: BlogTemplate[] = [
  {
    id: 'news',
    label: 'News Recap',
    description: 'Fast, structured coverage with sources and impact',
    icon: '📰',
    version: 2,
    defaults: { tags: ['#BTS', '#News'] },
    requiredHeadings: ['What happened', 'Key details', 'Why it matters', 'Official sources'],
    content: {
      type: 'doc',
      content: [
        h2('What happened'),
        p('Write 2-4 sentences summarizing the update in plain language.'),
        h2('Key details'),
        ul([
          'Who is involved?',
          'What is the official statement?',
          'What changed from before?',
          'When does it take effect?'
        ]),
        h2('Why it matters'),
        p('Explain the impact for ARMY, the group, or the industry.'),
        h2('Official sources'),
        ul(['Paste the official link', 'Add a second source if available']),
        hr(),
        h3('Quick take'),
        p('One-line reaction or takeaway for readers who skim.')
      ]
    }
  },
  {
    id: 'track-review',
    label: 'Track Review',
    description: 'Deep review with structure, lyrics, and standout moments',
    icon: '🎵',
    version: 2,
    defaults: { tags: ['#BTS', '#Review'] },
    fields: [
      { name: 'track', label: 'Track', placeholder: 'e.g., Spring Day', required: true },
      { name: 'album', label: 'Album', placeholder: 'e.g., You Never Walk Alone' },
      { name: 'favoriteLyric', label: 'Favorite lyric', placeholder: 'Paste a line that hit hard' }
    ],
    requiredHeadings: ['First impressions', 'Sound & production', 'Lyrics that hit', 'Standout moment', 'Final thoughts'],
    content: {
      type: 'doc',
      content: [
        h2('First impressions on {{track}}'),
        p('Hook, tempo, and overall mood in 2-3 sentences.'),
        h2('Sound & production'),
        ul(['Instrumentation', 'Vocal delivery', 'Mix or standout texture']),
        h2('Lyrics that hit'),
        quote('{{favoriteLyric}}'),
        p('Why these lines matter in 1-2 sentences.'),
        h2('Standout moment'),
        p('Timestamp a moment (ex: 1:42) and describe why it stands out.'),
        h2('Final thoughts'),
        p('Rating or summary in one paragraph.')
      ]
    }
  },
  {
    id: 'album-review',
    label: 'Album Review',
    description: 'Track-by-track highlights with theme and cohesion',
    icon: '💿',
    version: 1,
    defaults: { tags: ['#BTS', '#Album', '#Review'] },
    fields: [
      { name: 'album', label: 'Album', placeholder: 'e.g., BE', required: true },
      { name: 'release', label: 'Release date', placeholder: 'YYYY-MM-DD' }
    ],
    requiredHeadings: ['Concept & theme', 'Track highlights', 'Lyrical throughline', 'Final verdict'],
    content: {
      type: 'doc',
      content: [
        h2('Concept & theme'),
        p('Summarize the album concept and mood in 4-6 sentences.'),
        h2('Track highlights'),
        ul(['Track 1 - why it stands out', 'Track 2 - key moment', 'Track 3 - lyric or sound note']),
        h2('Lyrical throughline'),
        p('What story or message connects the album?'),
        h2('Final verdict'),
        p('Who will love this album and why?')
      ]
    }
  },
  {
    id: 'concert',
    label: 'Concert Diary',
    description: 'Full concert recap with moments, setlist, and feelings',
    icon: '🎤',
    version: 2,
    fields: [
      { name: 'venue', label: 'Venue', placeholder: 'e.g., Jamsil Olympic Stadium', required: true },
      { name: 'city', label: 'City', placeholder: 'e.g., Seoul' },
      { name: 'date', label: 'Date', placeholder: 'YYYY-MM-DD' }
    ],
    content: {
      type: 'doc',
      content: [
        h2('Venue & vibe at {{venue}} {{city}} {{date}}'),
        p('Describe the energy, crowd, and atmosphere.'),
        h2('Setlist highlights'),
        ul(['Song + moment that hit you', 'Unexpected switch or remix', 'Big crowd singalong']),
        h2('Performance moments'),
        ul(['Choreo moment', 'Vocal highlight', 'Member interaction']),
        h2('Personal moment'),
        p('A specific memory you will keep forever.'),
        h2('Final reflection'),
        p('How this concert changed your view of the era or the group.')
      ]
    }
  },
  {
    id: 'theory',
    label: 'Fan Theory',
    description: 'Structured analysis with evidence and counterpoints',
    icon: '💭',
    version: 2,
    fields: [{ name: 'topic', label: 'Topic', placeholder: 'e.g., HYYH symbolism', required: true }],
    content: {
      type: 'doc',
      content: [
        h2('The theory: {{topic}}'),
        p('State the theory in one clear paragraph.'),
        h2('Evidence'),
        ul(['Scene or lyric reference', 'Symbolism detail', 'Recurring motif']),
        h2('Counterpoints'),
        ul(['Alternative interpretation', 'Open questions']),
        h2('So what?'),
        p('Explain why this theory matters for the narrative.')
      ]
    }
  },
  {
    id: 'guide',
    label: 'How-to Guide',
    description: 'Step-by-step help with zero confusion',
    icon: '📖',
    version: 2,
    content: {
      type: 'doc',
      content: [
        h2("What you'll need"),
        ul(['Item or app', 'Account or link', 'Estimated time']),
        h2('Step by step'),
        ol(['Step 1: Do this', 'Step 2: Do this', 'Step 3: Verify result']),
        h2('Common mistakes'),
        ul(['Mistake + how to fix', 'Mistake + how to fix']),
        h2('Tips & shortcuts'),
        p('Add a quick tip that saves time.')
      ]
    }
  },
  {
    id: 'opinion',
    label: 'Opinion Piece',
    description: 'Clear stance with reasoning and respectful debate',
    icon: '💬',
    version: 2,
    content: {
      type: 'doc',
      content: [
        h2('My take'),
        p('State your opinion in 2-3 sentences.'),
        h2('Why I think this'),
        ul(['Reason 1', 'Reason 2', 'Reason 3']),
        h2('What I might be missing'),
        p('Acknowledge another angle.'),
        h2("What's your view?"),
        p('Invite readers to respond.')
      ]
    }
  },
  {
    id: 'mv-breakdown',
    label: 'MV Breakdown',
    description: 'Shot-by-shot analysis with symbolism cues',
    icon: '🎬',
    version: 1,
    defaults: { tags: ['#BTS', '#MV', '#Analysis'] },
    fields: [
      { name: 'mv', label: 'Music video', placeholder: 'e.g., ON (Kinetic Manifesto)', required: true }
    ],
    content: {
      type: 'doc',
      content: [
        h2('Overview of {{mv}}'),
        p('Summarize the concept and setting in 3-5 sentences.'),
        h2('Key scenes'),
        ul(['Scene 1: what happens', 'Scene 2: what it means', 'Scene 3: callback or motif']),
        h2('Symbols to watch'),
        ul(['Color symbolism', 'Recurring object', 'Location meaning']),
        h2('Best frame'),
        p('Describe the most iconic frame and why it matters.')
      ]
    }
  },
  {
    id: 'lyrics-deepdive',
    label: 'Lyrics Deep Dive',
    description: 'Line-by-line meaning with a lyrics block',
    icon: '✍️',
    version: 1,
    defaults: { tags: ['#BTS', '#Lyrics'] },
    fields: [
      { name: 'track', label: 'Track', placeholder: 'e.g., Blue & Grey', required: true }
    ],
    content: {
      type: 'doc',
      content: [
        h2('{{track}} - the heart of the lyrics'),
        p('Give the one-sentence core message.'),
        h2('Selected lyrics'),
        lyrics(['Paste 4-8 lines here', 'Leave a blank line for stanza breaks']),
        h2('What these lines mean'),
        ul(['Line 1 meaning', 'Line 2 meaning', 'Line 3 meaning']),
        h2('Personal connection'),
        p('How these lyrics connect to you or ARMY.')
      ]
    }
  },
  {
    id: 'era-overview',
    label: 'Era Overview',
    description: 'Everything about an era in one structured post',
    icon: '🧭',
    version: 1,
    defaults: { tags: ['#BTS', '#Era'] },
    fields: [
      { name: 'era', label: 'Era', placeholder: 'e.g., HYYH, Map of the Soul', required: true }
    ],
    content: {
      type: 'doc',
      content: [
        h2('{{era}} in one paragraph'),
        p('Summarize the era theme, color, and message.'),
        h2('Key releases'),
        ul(['Title track', 'Album highlight', 'B-side gem']),
        h2('Visual identity'),
        ul(['Color palette', 'Outfit style', 'Iconic imagery']),
        h2('Why this era matters'),
        p('Impact on BTS or ARMY culture.'),
        h2('Era essentials'),
        ol(['Watch: MV', 'Listen: album', 'Read: lyrics/notes'])
      ]
    }
  },
  {
    id: 'member-spotlight',
    label: 'Member Spotlight',
    description: 'Focused feature on one member',
    icon: '✨',
    version: 1,
    defaults: { tags: ['#BTS', '#Member'] },
    fields: [
      { name: 'member', label: 'Member', placeholder: 'e.g., Jimin', required: true }
    ],
    content: {
      type: 'doc',
      content: [
        h2('Why {{member}} stands out'),
        p('Write 3-4 sentences about their unique presence.'),
        h2('Signature moments'),
        ul(['Performance highlight', 'Vocal or rap moment', 'Variety or interview quote']),
        h2('Growth over time'),
        p('Describe their evolution across eras.'),
        h2('Favorite quotes or lyrics'),
        ul(['Quote or lyric 1', 'Quote or lyric 2']),
        h2('Final appreciation'),
        p('Close with a heartfelt note.')
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

