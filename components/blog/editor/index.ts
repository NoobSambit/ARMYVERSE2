/**
 * Blog Editor Components - Light Mode
 *
 * Premium light-mode writing experience for ARMYVERSE blogs.
 * Editorial design with serif headings and clean, readable body text.
 */

// Main editor component
export { default as BlogEditorLight } from '../BlogEditorLight'

// Editor extensions and utilities
export { BubbleMenu } from './BubbleMenu'
export { SlashCommandMenu, SlashCommand, getSuggestion } from './SlashCommandMenu'
export { Embed } from './Embed'
export { LyricsBlock } from './LyricsBlock'
export { ImageFigure } from './ImageFigure'
export { HeadingWithCollapse } from './HeadingWithCollapse'
export { OutlineCollapse } from './OutlineCollapse'
export { FloatingInsertMenu } from './FloatingInsertMenu'
export { BlockMenu } from './BlockMenu'
export {
  TableOfContents,
  useTableOfContents,
} from './TableOfContents'

// Types
export type { BlogData } from '../BlogEditorLight'

// SEO scoring utilities
export {
  calculateSEOScore,
  getQuickSEOScore,
  getSEOLevel,
  getSEOColorClass,
  getSEOBgClass,
} from '@/lib/blog/seo-scoring'

export type {
  SEOScoreResult,
  SEOSuggestion,
  SEOScoreBreakdown,
  BlogPostForSEO,
} from '@/lib/blog/seo-scoring'
