import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { Collection } from '@/lib/models/Collection'
import { Blog } from '@/lib/models/Blog'

export const dynamic = 'force-dynamic'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function GET(request: NextRequest) {
  try {
    await connect()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const ownerId = searchParams.get('ownerId') || ''
    const visibility = searchParams.get('visibility') || 'public'
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const query: any = {}
    if (ownerId) query['owner.id'] = ownerId
    if (visibility && visibility !== 'all') query.visibility = visibility
    if (search) query.title = { $regex: search, $options: 'i' }

    const [collections, total] = await Promise.all([
      Collection.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Collection.countDocuments(query)
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      collections,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect()

    const body = await request.json()
    const { title, description, coverImage, owner, visibility = 'public', tags = [], mood } = body

    if (!title || !owner?.id || !owner?.name) {
      return NextResponse.json({ error: 'Title and owner are required' }, { status: 400 })
    }

    const baseSlug = slugify(title)
    let slug = baseSlug
    let suffix = 1
    while (await Collection.findOne({ 'owner.id': owner.id, slug })) {
      slug = `${baseSlug}-${suffix++}`
    }

    const collection = new Collection({
      title,
      description: description || '',
      coverImage: coverImage || null,
      owner,
      slug,
      visibility,
      tags,
      mood
    })

    await collection.save()

    return NextResponse.json(collection, { status: 201 })
  } catch (error) {
    console.error('Error creating collection:', error)
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 })
  }
}


