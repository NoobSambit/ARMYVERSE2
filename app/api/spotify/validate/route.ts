import { NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'

const validateBodySchema = z.object({
  userId: z.string().min(1)
})

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}))
    const { userId } = validateBodySchema.parse(payload)

    // TODO: implement actual Spotify token lookup and validation for userId
    // For now, assume the connection is invalid until backend storage is wired
    return NextResponse.json({ connected: false, reason: 'not_implemented', userId })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: error.flatten() }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
