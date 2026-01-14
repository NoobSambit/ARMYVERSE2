import { NextRequest, NextResponse } from 'next/server'

const resolveProviderEndpoint = (url: string) => {
  const lower = url.toLowerCase()

  if (lower.includes('twitter.com') || lower.includes('x.com')) {
    return `https://publish.twitter.com/oembed?omit_script=1&url=${encodeURIComponent(url)}`
  }

  if (lower.includes('spotify.com')) {
    return `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`
  }

  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    return `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`
  }

  return `https://noembed.com/embed?url=${encodeURIComponent(url)}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  try {
    const endpoint = resolveProviderEndpoint(url)
    const response = await fetch(endpoint)

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch oEmbed' }, { status: 502 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('oEmbed error', error)
    return NextResponse.json({ error: 'Failed to fetch oEmbed' }, { status: 500 })
  }
}
