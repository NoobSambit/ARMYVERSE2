import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { Collection } from '@/lib/models/Collection'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connect()
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('ownerId') || ''
    const query: any = { slug: params.slug }
    if (ownerId) query['owner.id'] = ownerId
    const collection = await Collection.findOne(query).populate({
      path: 'posts',
      match: { isDeleted: { $ne: true } },
    }).lean()
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }
    return NextResponse.json(collection)
  } catch (error) {
    console.error('Error fetching collection:', error)
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connect()
    const body = await request.json()
    const { title, description, coverImage, visibility, tags, mood, renameSlug } = body
    const update: any = {}
    if (title) update.title = title
    if (description !== undefined) update.description = description
    if (coverImage !== undefined) update.coverImage = coverImage
    if (visibility) update.visibility = visibility
    if (Array.isArray(tags)) update.tags = tags
    if (mood !== undefined) update.mood = mood

    let collection = await Collection.findOne({ slug: params.slug })
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    // Apply updates
    Object.assign(collection, update)

    // If requested, regenerate slug from new title
    if (renameSlug && title) {
      const baseSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      let slug = baseSlug
      let suffix = 1
      // Ensure uniqueness per owner
      while (await Collection.findOne({ 'owner.id': collection.owner.id, slug, _id: { $ne: collection._id } })) {
        slug = `${baseSlug}-${suffix++}`
      }
      collection.slug = slug
    }

    await collection.save()
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }
    return NextResponse.json(collection)
  } catch (error) {
    console.error('Error updating collection:', error)
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connect()
    const collection = await Collection.findOneAndDelete({ slug: params.slug })
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Collection deleted' })
  } catch (error) {
    console.error('Error deleting collection:', error)
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 })
  }
}


