import { NextResponse } from 'next/server'
import { cronSecret } from '@/lib/config'
import { connect } from '@/lib/db/mongoose'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Vercel Cron endpoint - runs daily at 2:00 AM UTC
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connect()

    // Call the cache builder
    const builderUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/trending/homepage-cache`
    const response = await fetch(builderUrl, { method: 'POST' })
    const result = await response.json()

    if (!result.ok) {
      throw new Error(result.error || 'Cache build failed')
    }

    return NextResponse.json({
      ok: true,
      message: 'Homepage trending cache refreshed successfully',
      ...result
    })

  } catch (err: any) {
    console.error('Homepage cache cron error:', err)
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    )
  }
}
