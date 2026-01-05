import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export const runtime = 'nodejs'

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null

export async function POST(req: Request) {
  try {
    const { moods, members, era, context } = await req.json()

    if (!groq) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    // Create context for AI inspiration
    let promptContext = 'Generate a creative playlist description for a BTS playlist'

    if (moods && moods.length > 0) {
      promptContext += ` with ${moods.join(', ')} vibes`
    }

    if (members && members.length > 0) {
      promptContext += ` featuring ${members.join(', ')}`
    }

    if (era && era !== 'all') {
      promptContext += ` from the ${era} era`
    }

    if (context && context !== 'auto') {
      promptContext += ` perfect for ${context}`
    }

    promptContext += '. Make it poetic, vivid, and specific. Keep it under 100 characters. Just return the description, nothing else.'

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: promptContext
        }
      ],
      temperature: 0.9,
      max_tokens: 100
    })

    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error('No response from AI')
    }

    const suggestion = completion.choices[0].message.content.trim().replace(/^["']|["']$/g, '')

    return NextResponse.json({ suggestion })

  } catch (error) {
    console.error('AI inspiration error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI inspiration' },
      { status: 500 }
    )
  }
}
