import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export const runtime = 'nodejs'

// Initialize Groq AI with error handling
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null
if (!process.env.GROQ_API_KEY) {
  console.debug('⚠️ Warning: GROQ_API_KEY not found in environment variables')
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { prompt } = body

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (!groq) {
      throw new Error('Groq API key not configured')
    }

    console.debug('🎵 Generating playlist for:', prompt)

    // Create enhanced prompt for Groq
    const enhancedPrompt = `
Create a BTS playlist based on this vibe: "${prompt}".
Return exactly 8 songs with title and artist name.

Return ONLY valid JSON in this exact format, with no other text:
[
  {
    "title": "song title",
    "artist": "artist name"
  }
]

Only include BTS songs (including solo works). The artist should be either "BTS" or the member's name (Jimin, Jungkook, V, RM, Suga, J-Hope, Jin).`

    // Generate playlist using Groq with Llama 3.3 70B
    console.debug('🤖 Sending prompt to Groq (Llama 3.3 70B)...')
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: enhancedPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: "json_object" }
    })

    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error('No response from Groq API')
    }

    const text = completion.choices[0].message.content

    console.debug('✅ Received response from Groq:', text)

    // Parse the JSON response
    let playlist
    try {
      // First try direct JSON parse
      try {
        playlist = JSON.parse(text)
      } catch {
        // If that fails, try to extract JSON from the response
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          playlist = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in response')
        }
      }

      // Validate playlist structure
      if (!Array.isArray(playlist)) {
        throw new Error('Response is not an array')
      }

      if (playlist.length === 0) {
        throw new Error('Playlist is empty')
      }

      // Validate each track
      playlist = playlist.map((track: any) => {
        if (!track.title || !track.artist) {
          throw new Error('Invalid track format - missing title or artist')
        }
        return {
          title: track.title.trim(),
          artist: track.artist.trim()
        }
      })

    } catch (parseError) {
      console.debug('❌ Error parsing Groq response:', parseError)
      console.debug('Raw response:', text)
      return NextResponse.json({
        error: 'Failed to parse AI response',
        details: parseError instanceof Error ? parseError.message : 'Unknown error'
      }, { status: 500 })
    }

    console.debug('✅ Successfully generated playlist:', playlist)
    return NextResponse.json(playlist)

  } catch (error) {
    console.debug('❌ Error generating playlist:', error)
    return NextResponse.json({ 
      error: 'Failed to generate playlist',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}