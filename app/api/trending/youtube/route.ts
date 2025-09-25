import { NextResponse } from 'next/server'

// Simple in-memory cache (per server instance)
type YoutubeItems = Array<{ id: { videoId: string } }>
type YoutubeStatsItems = Array<{ statistics?: { viewCount?: string; likeCount?: string } }>
type YoutubePayload = { search?: { items?: YoutubeItems }; stats?: { items?: YoutubeStatsItems } }
let cache: { data: YoutubePayload; expiresAt: number } | null = null
const TTL_MS = 5 * 60 * 1000 // 5 minutes

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = Date.now()
    if (cache && cache.expiresAt > now) {
      return NextResponse.json(cache.data)
    }

    const key = process.env.YOUTUBE_API_KEY
    if (!key) {
      const fallback: YoutubePayload = { search: { items: [] }, stats: { items: [] } }
      return NextResponse.json(fallback, { status: 200 })
    }

    // Single search request + single stats request
    const searchRes = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=BTS&maxResults=5&order=viewCount&type=video&videoCategoryId=10&key=${key}`, { cache: 'no-store' })

    if (!searchRes.ok) {
      // Soft-fail to reduce quota consumption
      const fallback: YoutubePayload = { search: { items: [] }, stats: { items: [] } }
      cache = { data: fallback, expiresAt: now + TTL_MS }
      return NextResponse.json(fallback)
    }

    const search = (await searchRes.json()) as YoutubePayload['search']
    const ids = (search?.items || []).map((i) => i.id.videoId).join(',')

    let stats: YoutubePayload['stats'] = { items: [] }
    if (ids) {
      const statsRes = await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${key}`, { cache: 'no-store' })
      if (statsRes.ok) stats = await statsRes.json()
    }

    const payload: YoutubePayload = { search, stats }
    cache = { data: payload, expiresAt: now + TTL_MS }
    return NextResponse.json(payload)
  } catch (e) {
    const fallback: YoutubePayload = { search: { items: [] }, stats: { items: [] } }
    cache = { data: fallback, expiresAt: Date.now() + TTL_MS }
    return NextResponse.json(fallback)
  }
}


