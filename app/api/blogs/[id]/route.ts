import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { Types } from 'mongoose'
import { Blog } from '@/lib/models/Blog'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connect()
    
    const blog = await Blog.findOne({ _id: params.id, isDeleted: { $ne: true } }).lean()
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }
    
    // Enrich author and commenters with MongoDB profile display names/avatars
    let enriched = blog as any
    try {
      const { User } = await import('@/lib/models/User')
      // Author enrichment
      if (enriched?.author?.id) {
        const criteria = enriched.author.id.includes('@')
          ? { email: enriched.author.id }
          : Types.ObjectId.isValid(enriched.author.id)
            ? { $or: [{ _id: enriched.author.id }, { firebaseUid: enriched.author.id }] }
            : { firebaseUid: enriched.author.id }
        const u = await User.findOne(criteria, { profile: 1, name: 1, image: 1 }).lean()
        if (u) {
          enriched.author = {
            id: enriched.author.id,
            name: (u as any)?.profile?.displayName || (u as any)?.name || enriched.author.name,
            avatar: (u as any)?.profile?.avatarUrl || (u as any)?.image || enriched.author.avatar || null
          }
        }
      }
      // Comments enrichment
      if (Array.isArray(enriched?.comments) && enriched.comments.length > 0) {
        const commenterIds: string[] = Array.from(
          new Set(
            (enriched.comments as any[])
              .map((c: any) => (typeof c?.userId === 'string' ? c.userId : ''))
              .filter((v: string) => v.length > 0)
          )
        )
        const emailIds: string[] = commenterIds.filter((id) => id.includes('@'))
        const uidIds: string[] = commenterIds.filter((id) => !id.includes('@'))
        const objectIds = uidIds.filter((id) => Types.ObjectId.isValid(id))
        const uidFilters: any[] = []
        if (uidIds.length) uidFilters.push({ firebaseUid: { $in: uidIds } })
        if (objectIds.length) uidFilters.push({ _id: { $in: objectIds } })

        const [usersByUid, usersByEmail] = await Promise.all([
          uidFilters.length ? User.find({ $or: uidFilters }, { profile: 1, name: 1, firebaseUid: 1 }).lean() : [],
          emailIds.length ? User.find({ email: { $in: emailIds } }, { profile: 1, name: 1, email: 1 }).lean() : []
        ])
        const map: Record<string, any> = {}
        for (const u of usersByUid as any[]) {
          if (u.firebaseUid) map[u.firebaseUid] = u
          if (u._id) map[String(u._id)] = u
        }
        for (const u of usersByEmail as any[]) if (u.email) map[u.email] = u
        enriched.comments = enriched.comments.map((c: any) => {
          const u = map[c.userId]
          if (u) {
            return { ...c, name: (u as any)?.profile?.displayName || (u as any)?.name || c.name }
          }
          return c
        })
      }
    } catch {}

    // Increment view count only if visible
    await Blog.findByIdAndUpdate(params.id, { $inc: { views: 1 } })
    
    return NextResponse.json(enriched)
    
  } catch (error) {
    console.error('Error fetching blog:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connect()
    
    const body = await request.json()
    const { title, content, tags, mood, coverImage, status, visibility } = body
    
    const updateData: any = {}
    if (title) updateData.title = title
    if (content) updateData.content = content
    if (tags) updateData.tags = tags
    if (mood) updateData.mood = mood
    if (coverImage !== undefined) updateData.coverImage = coverImage
    if (status) updateData.status = status
    if (visibility) updateData.visibility = visibility
    updateData.updatedAt = new Date()
    
    const blog = await Blog.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    )
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(blog)
    
  } catch (error) {
    console.error('Error updating blog:', error)
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connect()
    
    const blog = await Blog.findByIdAndUpdate(params.id, { isDeleted: true, deletedAt: new Date() }, { new: true })
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Blog moved to trash' })
    
  } catch (error) {
    console.error('Error deleting blog:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    )
  }
} 
