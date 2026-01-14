/**
 * SEO Scoring Utility for Blog Posts
 *
 * Analyzes blog post content and metadata to generate an SEO score
 * and provide actionable suggestions for improvement.
 */

export interface SEOScoreResult {
  score: number
  level: 'good' | 'fair' | 'poor'
  suggestions: SEOSuggestion[]
  breakdown: SEOScoreBreakdown
}

export interface SEOSuggestion {
  type: 'title' | 'content' | 'image' | 'tags' | 'meta' | 'structure'
  priority: 'high' | 'medium' | 'low'
  message: string
  action: string
}

export interface SEOScoreBreakdown {
  title: { score: number; maxScore: number; issues: string[] }
  content: { score: number; maxScore: number; issues: string[] }
  image: { score: number; maxScore: number; issues: string[] }
  tags: { score: number; maxScore: number; issues: string[] }
  meta: { score: number; maxScore: number; issues: string[] }
  structure: { score: number; maxScore: number; issues: string[] }
}

export interface BlogPostForSEO {
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  coverAlt?: string
  tags: string[]
  slug?: string
}

/**
 * Calculate comprehensive SEO score for a blog post
 */
export function calculateSEOScore(post: BlogPostForSEO): SEOScoreResult {
  const breakdown: SEOScoreBreakdown = {
    title: analyzeTitle(post.title),
    content: analyzeContent(post.content),
    image: analyzeImage(post.coverImage, post.coverAlt),
    tags: analyzeTags(post.tags),
    meta: analyzeMeta(post.excerpt, post.slug),
    structure: analyzeStructure(post.content),
  }

  const totalScore = Object.values(breakdown).reduce(
    (sum, category) => sum + category.score,
    0
  )
  const maxScore = Object.values(breakdown).reduce(
    (sum, category) => sum + category.maxScore,
    0
  )

  const score = Math.round((totalScore / maxScore) * 100)
  const level = score >= 80 ? 'good' : score >= 60 ? 'fair' : 'poor'

  const suggestions = generateSuggestions(breakdown)

  return {
    score,
    level,
    suggestions,
    breakdown,
  }
}

/**
 * Analyze title for SEO
 * Max score: 20 points
 */
function analyzeTitle(title: string): {
  score: number
  maxScore: number
  issues: string[]
} {
  let score = 0
  const issues: string[] = []
  const length = title.trim().length

  // Length check (8 points)
  if (length >= 45 && length <= 60) {
    score += 8
  } else if (length >= 30 && length <= 70) {
    score += 5
  } else {
    if (length < 30) issues.push('Title is too short (aim for 45-60 characters)')
    if (length > 70) issues.push('Title is too long (keep under 70 characters)')
  }

  // Contains keywords/numbers (4 points)
  if (/\d+/.test(title)) score += 2
  if (/[A-Z]/.test(title)) score += 2

  // No special characters overuse (3 points)
  const specialCharCount = (title.match(/[!?@#\$%^&*]/g) || []).length
  if (specialCharCount <= 1) {
    score += 3
  } else if (specialCharCount <= 2) {
    score += 1
  } else {
    issues.push('Reduce special characters in title')
  }

  // Not all caps (3 points)
  if (title === title.toUpperCase() && title.length > 0) {
    issues.push('Avoid using ALL CAPS in title')
  } else {
    score += 3
  }

  // Contains power words (2 points)
  const powerWords = ['amazing', 'ultimate', 'complete', 'best', 'essential', 'guide', 'tips']
  if (powerWords.some(word => title.toLowerCase().includes(word))) {
    score += 2
  }

  return { score, maxScore: 20, issues }
}

/**
 * Analyze content length and quality
 * Max score: 25 points
 */
function analyzeContent(content: string): {
  score: number
  maxScore: number
  issues: string[]
} {
  let score = 0
  const issues: string[] = []

  // Strip HTML tags
  const text = content.replace(/<[^>]*>/g, '').trim()
  const wordCount = text.split(/\s+/).filter(Boolean).length

  // Word count (12 points)
  if (wordCount >= 600) {
    score += 12
  } else if (wordCount >= 300) {
    score += 8
  } else if (wordCount >= 150) {
    score += 4
    issues.push('Content is short (aim for at least 600 words)')
  } else {
    issues.push('Content is too short for good SEO')
  }

  // Paragraph structure (5 points)
  const paragraphs = content.split(/<\/p>/).filter(p => p.trim().length > 0)
  if (paragraphs.length >= 3) {
    score += 5
  } else if (paragraphs.length >= 2) {
    score += 3
  } else {
    issues.push('Add more paragraphs for better structure')
  }

  // Sentence length variety (4 points)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const avgSentenceLength = sentences.length > 0
    ? wordCount / sentences.length
    : 0

  if (avgSentenceLength >= 15 && avgSentenceLength <= 25) {
    score += 4
  } else if (avgSentenceLength >= 10 && avgSentenceLength <= 30) {
    score += 2
  }

  // Internal/external links (4 points)
  const linkCount = (content.match(/<a /g) || []).length
  if (linkCount >= 3) {
    score += 4
  } else if (linkCount >= 1) {
    score += 2
  } else {
    issues.push('Add relevant links to improve SEO')
  }

  return { score, maxScore: 25, issues }
}

/**
 * Analyze cover image
 * Max score: 15 points
 */
function analyzeImage(coverImage?: string, coverAlt?: string): {
  score: number
  maxScore: number
  issues: string[]
} {
  let score = 0
  const issues: string[] = []

  // Has cover image (8 points)
  if (coverImage && coverImage.trim().length > 0) {
    score += 8

    // Has alt text (7 points)
    if (coverAlt && coverAlt.trim().length >= 10) {
      score += 7
    } else if (coverAlt && coverAlt.trim().length > 0) {
      score += 4
      issues.push('Alt text is too short (aim for 10+ characters)')
    } else {
      issues.push('Add alt text for accessibility and SEO')
    }
  } else {
    issues.push('Add a cover image to improve engagement')
  }

  return { score, maxScore: 15, issues }
}

/**
 * Analyze tags
 * Max score: 15 points
 */
function analyzeTags(tags: string[]): {
  score: number
  maxScore: number
  issues: string[]
} {
  let score = 0
  const issues: string[] = []

  const tagCount = tags.length

  // Tag count (8 points)
  if (tagCount >= 3 && tagCount <= 8) {
    score += 8
  } else if (tagCount >= 1 && tagCount <= 10) {
    score += 5
  } else {
    if (tagCount < 3) issues.push('Add more tags (aim for 3-8 relevant tags)')
    if (tagCount > 10) issues.push('Too many tags (keep between 3-8)')
  }

  // Tag relevance (4 points) - check for BTS/relevant tags
  const relevantTags = tags.filter(tag =>
   /#(BTS|ARMY|Kpop|Music|Album|MV|Concept|Performance)/i.test(tag)
  )
  if (relevantTags.length >= 2) {
    score += 4
  } else if (relevantTags.length >= 1) {
    score += 2
  }

  // Tag format (3 points)
  const wellFormatted = tags.filter(tag => tag.startsWith('#'))
  if (wellFormatted.length === tagCount && tagCount > 0) {
    score += 3
  } else if (wellFormatted.length >= tagCount * 0.8) {
    score += 1
  }

  return { score, maxScore: 15, issues }
}

/**
 * Analyze meta information
 * Max score: 15 points
 */
function analyzeMeta(excerpt?: string, slug?: string): {
  score: number
  maxScore: number
  issues: string[]
} {
  let score = 0
  const issues: string[] = []

  // Excerpt/description (10 points)
  if (excerpt && excerpt.trim().length >= 120) {
    score += 10
  } else if (excerpt && excerpt.trim().length >= 60) {
    score += 6
  } else if (excerpt && excerpt.trim().length > 0) {
    score += 3
    issues.push('Excerpt is too short (aim for 120-160 characters)')
  } else {
    issues.push('Add an excerpt for better search result display')
  }

  // Slug quality (5 points)
  if (slug && slug.trim().length > 0) {
    if (slug.length >= 3 && slug.length <= 60 && /^[a-z0-9-]+$/.test(slug)) {
      score += 5
    } else if (slug.length >= 3 && slug.length <= 80) {
      score += 3
    } else {
      issues.push('Slug should be 3-60 characters, lowercase, with hyphens')
    }
  }

  return { score, maxScore: 15, issues }
}

/**
 * Analyze content structure
 * Max score: 10 points
 */
function analyzeStructure(content: string): {
  score: number
  maxScore: number
  issues: string[]
} {
  let score = 0
  const issues: string[] = []

  // Has headings (5 points)
  const headingCount = (content.match(/<h[1-3]/g) || []).length
  if (headingCount >= 2) {
    score += 5
  } else if (headingCount >= 1) {
    score += 3
  } else {
    issues.push('Add headings to structure your content')
  }

  // Has subheadings (h2, h3) (3 points)
  const subheadingCount = (content.match(/<h[23]/g) || []).length
  if (subheadingCount >= 2) {
    score += 3
  } else if (subheadingCount >= 1) {
    score += 1
  }

  // Has lists (2 points)
  const hasList = /<ul|<ol/.test(content)
  if (hasList) {
    score += 2
  }

  return { score, maxScore: 10, issues }
}

/**
 * Generate prioritized suggestions from breakdown
 */
function generateSuggestions(breakdown: SEOScoreBreakdown): SEOSuggestion[] {
  const suggestions: SEOSuggestion[] = []

  // Title suggestions
  if (breakdown.title.issues.length > 0) {
    suggestions.push({
      type: 'title',
      priority: breakdown.title.score < 10 ? 'high' : 'medium',
      message: breakdown.title.issues[0],
      action: 'Optimize your title for SEO (45-60 characters, include keywords)',
    })
  }

  // Content suggestions
  if (breakdown.content.issues.length > 0) {
    suggestions.push({
      type: 'content',
      priority: breakdown.content.score < 15 ? 'high' : 'medium',
      message: breakdown.content.issues[0],
      action: 'Expand your content to at least 600 words with proper structure',
    })
  }

  // Image suggestions
  if (breakdown.image.issues.length > 0) {
    suggestions.push({
      type: 'image',
      priority: 'high',
      message: breakdown.image.issues[0],
      action: 'Add a cover image with descriptive alt text',
    })
  }

  // Tags suggestions
  if (breakdown.tags.issues.length > 0) {
    suggestions.push({
      type: 'tags',
      priority: 'medium',
      message: breakdown.tags.issues[0],
      action: 'Add 3-8 relevant tags including #BTS and related topics',
    })
  }

  // Meta suggestions
  if (breakdown.meta.issues.length > 0) {
    suggestions.push({
      type: 'meta',
      priority: 'medium',
      message: breakdown.meta.issues[0],
      action: 'Add a compelling excerpt (120-160 characters)',
    })
  }

  // Structure suggestions
  if (breakdown.structure.issues.length > 0) {
    suggestions.push({
      type: 'structure',
      priority: 'low',
      message: breakdown.structure.issues[0],
      action: 'Use headings and lists to improve readability',
    })
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return suggestions
}

/**
 * Quick SEO score (0-100) for display purposes
 */
export function getQuickSEOScore(post: BlogPostForSEO): number {
  const result = calculateSEOScore(post)
  return result.score
}

/**
 * Get SEO level label
 */
export function getSEOLevel(score: number): 'good' | 'fair' | 'poor' {
  if (score >= 80) return 'good'
  if (score >= 60) return 'fair'
  return 'poor'
}

/**
 * Get color class for SEO score
 */
export function getSEOColorClass(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

/**
 * Get background color class for SEO badge
 */
export function getSEOBgClass(score: number): string {
  if (score >= 80) return 'bg-green-100'
  if (score >= 60) return 'bg-yellow-100'
  return 'bg-red-100'
}
