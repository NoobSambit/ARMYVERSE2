'use client'

import { useSpotifyAuth } from '@/hooks/useSpotifyAuth'
import { Music } from 'lucide-react'

export default function FloatingConnect() {
  const { isAuthenticated, isLoading } = useSpotifyAuth()
  return null

  const startAuth = async () => {
    try {
      const res = await fetch('/api/spotify/auth-url')
      const data = await res.json()
      if (data?.url) window.location.href = data.url
    } catch {}
  }

  return null
}


