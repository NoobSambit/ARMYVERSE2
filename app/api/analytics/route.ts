import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		// For now, just log. In production, send to your analytics store.
		console.log('[analytics]', body)
		return NextResponse.json({ ok: true })
	} catch (e) {
		return NextResponse.json({ ok: false }, { status: 400 })
	}
}


