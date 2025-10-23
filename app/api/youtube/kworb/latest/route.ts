import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import YouTubeKworbSnapshot from '@/lib/models/YouTubeKworbSnapshot'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    await connect()
    const doc = await YouTubeKworbSnapshot.findOne().sort({ dateKey: -1 }).lean()
    if (!doc) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true, snapshot: doc }, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' }
    })
  } catch (err: any) {
    console.error('YouTube Kworb latest error:', err)
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 })
  }
}
