'use client'

import { useEffect, useState } from 'react'
import { fetchSpotifyTrending, fetchYouTubeTrending, type TrendingTrack, type TrendingVideo, fetchAllMembersSpotlight, fetchMembersYouTubeData, type MemberSpotlight } from '@/lib/trending/fetch'

export function useTrending() {
  const [spotify, setSpotify] = useState<TrendingTrack[]>([])
  const [youtube, setYoutube] = useState<TrendingVideo[]>([])
  const [membersSpotify, setMembersSpotify] = useState<MemberSpotlight[]>([])
  const [membersYouTube, setMembersYouTube] = useState<MemberSpotlight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const [s, y, ms, my] = await Promise.all([
          fetchSpotifyTrending().catch(() => []),
          fetchYouTubeTrending().catch(() => []),
          fetchAllMembersSpotlight().catch(() => []),
          fetchMembersYouTubeData().catch(() => []),
        ])
        if (!mounted) return
        setSpotify(s)
        setYoutube(y)
        setMembersSpotify(ms)
        setMembersYouTube(my)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  return { spotify, youtube, membersSpotify, membersYouTube, loading }
}


