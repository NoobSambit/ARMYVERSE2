import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  console.debug('🎵 Test playlist route hit!')
  
  const body = await req.json()
  console.debug('Request body:', body)
  
  // Return simple hardcoded playlist
  const testPlaylist = [
    { title: "Dynamite", artist: "BTS" },
    { title: "Butter", artist: "BTS" },
    { title: "Permission to Dance", artist: "BTS" },
    { title: "Life Goes On", artist: "BTS" },
    { title: "Spring Day", artist: "BTS" }
  ]
  
  console.debug('✅ Returning test playlist')
  return NextResponse.json(testPlaylist)
}