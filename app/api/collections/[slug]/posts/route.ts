import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { Collection } from '@/lib/models/Collection'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connect()
    const body = await request.json()
    const { action, postId, postIds, order } = body

    const collection = await Collection.findOne({ slug: params.slug })
    if (!collection) return NextResponse.json({ error: 'Collection not found' }, { status: 404 })

    if (action === 'add' && postId) {
      if (!collection.posts.find((id: any) => String(id) === String(postId))) {
        collection.posts.push(postId)
      }
    } else if (action === 'remove' && postId) {
      collection.posts = collection.posts.filter((id: any) => String(id) !== String(postId))
    } else if (action === 'addMany' && Array.isArray(postIds)) {
      const set = new Set(collection.posts.map((id: any) => String(id)))
      for (const id of postIds) {
        if (!set.has(String(id))) collection.posts.push(id)
      }
    } else if (action === 'reorder' && Array.isArray(order)) {
      const orderMap = new Map(order.map((id: string, idx: number) => [String(id), idx]))
      collection.posts.sort((a: any, b: any) => {
        return (orderMap.get(String(a)) ?? 0) - (orderMap.get(String(b)) ?? 0)
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    await collection.save()
    return NextResponse.json({ message: 'Updated', posts: collection.posts })
  } catch (error) {
    console.error('Error updating collection posts:', error)
    return NextResponse.json({ error: 'Failed to update collection posts' }, { status: 500 })
  }
}


