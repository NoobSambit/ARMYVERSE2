export type PhotocardDoc = {
  _id: any
  categoryDisplay?: string
  categoryPath?: string
  pageDisplay?: string
  subcategoryLabels?: string[]
  subcategoryPath?: string | null
  caption?: string
  imageName?: string
  imageKey?: string
  imageUrl?: string
  thumbUrl?: string
  sourceUrl?: string
  pageUrl?: string
}

export type PhotocardSummary = {
  cardId: string
  title: string | null
  category: string
  categoryPath?: string
  subcategory: string | null
  subcategoryPath?: string | null
  imageUrl: string
  thumbUrl?: string
  sourceUrl?: string
  pageUrl?: string
}

function normalizeLabel(value?: string | null) {
  if (!value) return ''
  return value.replace(/_/g, ' ').trim()
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ')
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&#34;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
}

function stripGallerySuffix(value: string) {
  return value.replace(/\/Gallery$/i, '').trim()
}

export function mapPhotocardSummary(card: PhotocardDoc | null): PhotocardSummary | null {
  if (!card) return null
  const rawCategory = normalizeLabel(card.categoryDisplay || card.pageDisplay || card.categoryPath || '')
  const category = stripGallerySuffix(rawCategory || 'Gallery')
  const rawSubcategory = Array.isArray(card.subcategoryLabels) && card.subcategoryLabels.length
    ? card.subcategoryLabels.join(' / ')
    : normalizeLabel(card.subcategoryPath || '')
  const subcategory = rawSubcategory ? rawSubcategory : null
  const rawTitle = card.caption || card.imageName || card.imageKey || ''
  const title = normalizeLabel(decodeEntities(stripHtml(rawTitle))) || null
  const imageUrl = card.imageUrl || card.thumbUrl || ''

  return {
    cardId: String(card._id),
    title,
    category,
    categoryPath: card.categoryPath,
    subcategory,
    subcategoryPath: card.subcategoryPath || null,
    imageUrl,
    thumbUrl: card.thumbUrl,
    sourceUrl: card.sourceUrl || card.pageUrl,
    pageUrl: card.pageUrl
  }
}
