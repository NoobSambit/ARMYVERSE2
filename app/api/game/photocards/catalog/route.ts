import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth } from '@/lib/auth/verify'
import { Photocard } from '@/lib/models/Photocard'
import { InventoryItem } from '@/lib/models/InventoryItem'

export const runtime = 'nodejs'

type CatalogNode = {
  key: string
  label: string
  path: string[]
  total: number
  collected: number
  children: CatalogNode[]
}

type NodeInternal = CatalogNode & {
  _children: Map<string, NodeInternal>
}

function normalizeLabel(value?: string | null) {
  if (!value) return ''
  return value.replace(/_/g, ' ').trim()
}

function stripGallerySuffix(value: string) {
  return value.replace(/\/Gallery$/i, '').trim()
}

function ensureNode(map: Map<string, NodeInternal>, key: string, label: string, path: string[]) {
  const existing = map.get(key)
  if (existing) return existing
  const next: NodeInternal = {
    key,
    label,
    path,
    total: 0,
    collected: 0,
    children: [],
    _children: new Map()
  }
  map.set(key, next)
  return next
}

function finalizeNodes(nodes: Map<string, NodeInternal>): CatalogNode[] {
  const sorted = Array.from(nodes.values()).sort((a, b) => a.label.localeCompare(b.label))
  return sorted.map((node) => {
    node.children = finalizeNodes(node._children)
    delete (node as Partial<NodeInternal>)._children
    return node
  })
}

function buildLabelParts(card: any, pathSegments: string[]) {
  const labels = Array.isArray(card.subcategoryLabels) ? card.subcategoryLabels : []
  if (labels.length) {
    return pathSegments.map((seg, idx) => normalizeLabel(labels[idx] || seg))
  }
  return pathSegments.map((seg) => normalizeLabel(seg))
}

/**
 * GET /api/game/photocards/catalog
 * Returns category/subcategory tree with total vs collected counts.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connect()

    const ownedIds = await InventoryItem.distinct('cardId', { userId: user.uid })
    const ownedSet = new Set(ownedIds.map((id) => String(id)))

    const cards = await Photocard.find({}, {
      categoryPath: 1,
      categoryDisplay: 1,
      pageDisplay: 1,
      subcategoryPath: 1,
      subcategoryLabels: 1
    }).lean()

    const rootMap = new Map<string, NodeInternal>()
    let totalCards = 0
    let collectedCards = 0

    for (const card of cards) {
      totalCards += 1
      const owned = ownedSet.has(String(card._id))
      if (owned) collectedCards += 1

      const categoryPath = card.categoryPath || 'unknown'
      const categoryLabelRaw = normalizeLabel(card.categoryDisplay || card.pageDisplay || card.categoryPath || 'Gallery')
      const categoryLabel = stripGallerySuffix(categoryLabelRaw || 'Gallery')
      const categoryNode = ensureNode(rootMap, categoryPath, categoryLabel, [categoryPath])
      categoryNode.total += 1
      if (owned) categoryNode.collected += 1

      const subPath = typeof card.subcategoryPath === 'string' ? card.subcategoryPath : ''
      const segments = subPath.split('/').filter(Boolean)
      if (!segments.length) continue

      const labelParts = buildLabelParts(card, segments)
      let current = categoryNode
      const pathAcc: string[] = []
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i]
        pathAcc.push(seg)
        const segKey = pathAcc.join('/')
        const segLabel = labelParts[i] || normalizeLabel(seg)
        const node = ensureNode(current._children, segKey, segLabel, [...pathAcc])
        node.total += 1
        if (owned) node.collected += 1
        current = node
      }
    }

    return NextResponse.json({
      totalCards,
      collectedCards,
      categories: finalizeNodes(rootMap)
    })
  } catch (error) {
    console.error('Catalog error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
