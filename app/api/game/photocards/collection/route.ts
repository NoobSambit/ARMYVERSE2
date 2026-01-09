import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth } from '@/lib/auth/verify'
import { Photocard } from '@/lib/models/Photocard'
import { InventoryItem } from '@/lib/models/InventoryItem'
import { mapPhotocardSummary } from '@/lib/game/photocardMapper'

export const runtime = 'nodejs'

type CollectionCard = ReturnType<typeof mapPhotocardSummary> & { owned: boolean }

type CollectionGroup = {
  key: string
  label: string
  total: number
  collected: number
  cards: CollectionCard[]
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

function buildGroupLabel(card: any, fallback: string) {
  if (Array.isArray(card.subcategoryLabels) && card.subcategoryLabels.length) {
    return card.subcategoryLabels
      .map((label: string) => normalizeLabel(decodeEntities(stripHtml(label))))
      .filter(Boolean)
      .join(' / ')
  }
  return normalizeLabel(decodeEntities(stripHtml(fallback)))
}

/**
 * GET /api/game/photocards/collection
 * Returns grouped cards with owned status for collection view.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const category = (searchParams.get('category') || '').trim() || null
    const subcategory = (searchParams.get('subcategory') || '').trim() || null

    await connect()

    const ownedIds = await InventoryItem.distinct('cardId', { userId: user.uid })
    const ownedSet = new Set(ownedIds.map((id) => String(id)))

    const match: Record<string, any> = {}
    if (category) match.categoryPath = category
    if (subcategory) match.subcategoryPath = subcategory

    if (q) {
      const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escapeRegex(q), 'i')
      match.$or = [
        { caption: regex },
        { imageName: regex },
        { imageKey: regex },
        { categoryDisplay: regex },
        { pageDisplay: regex },
        { categoryPath: regex },
        { subcategoryPath: regex },
        { subcategoryLabels: regex }
      ]
    }

    const cards = await Photocard.find(match, {
      categoryDisplay: 1,
      categoryPath: 1,
      pageDisplay: 1,
      subcategoryPath: 1,
      subcategoryLabels: 1,
      caption: 1,
      imageName: 1,
      imageKey: 1,
      imageUrl: 1,
      thumbUrl: 1,
      sourceUrl: 1,
      pageUrl: 1
    }).lean()

    const groups = new Map<string, CollectionGroup>()
    let totalCards = 0
    let collectedCards = 0

    for (const card of cards) {
      const summary = mapPhotocardSummary(card)
      if (!summary) continue
      totalCards += 1
      const owned = ownedSet.has(String(card._id))
      if (owned) collectedCards += 1

      const groupKey = card.subcategoryPath || '__uncategorized__'
      const fallbackLabel = card.subcategoryPath ? String(card.subcategoryPath).replace(/\//g, ' / ') : 'Uncategorized'
      const groupLabel = buildGroupLabel(card, fallbackLabel)

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          key: groupKey,
          label: groupLabel || 'Uncategorized',
          total: 0,
          collected: 0,
          cards: []
        })
      }
      const group = groups.get(groupKey)!
      group.total += 1
      if (owned) group.collected += 1
      group.cards.push({ ...summary, owned })
    }

    const groupList = Array.from(groups.values()).map((group) => {
      group.cards.sort((a, b) => {
        const aTitle = a?.title || ''
        const bTitle = b?.title || ''
        return aTitle.localeCompare(bTitle) || a.cardId.localeCompare(b.cardId)
      })
      return group
    }).sort((a, b) => a.label.localeCompare(b.label))

    return NextResponse.json({
      totalCards,
      collectedCards,
      groups: groupList
    })
  } catch (error) {
    console.error('Collection error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
