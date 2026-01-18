'use client'

import React, { useState, useEffect } from 'react'
import { Music, Disc3, TrendingUp, Users } from 'lucide-react'
import SpotifyAnalyticsHeader from '@/components/spotify/SpotifyAnalyticsHeader'
import StatCard from '@/components/spotify/StatCard'
import ArtistSongCard from '@/components/spotify/ArtistSongCard'
import RankingTable from '@/components/spotify/RankingTable'
import { SnapshotComparison } from '@/lib/spotify/kworbSnapshotTypes'

export default function SpotifyAnalyticsPage() {
  const [data, setData] = useState<SnapshotComparison | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedArtists, setExpandedArtists] = useState<Set<string>>(new Set())

  const fetchData = async () => {
    try {
      const res = await fetch('/api/spotify/kworb/latest?includeChanges=true', {
        cache: 'no-store',
      })
      const json = await res.json()

      if (json.ok) {
        setData(json)
        // Auto-expand first artist if data exists
        if (json.snapshot?.songsByArtist?.length > 0) {
          setExpandedArtists(new Set([json.snapshot.songsByArtist[0].artist]))
        }
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const toggleArtist = (artist: string) => {
    setExpandedArtists(prev => {
      const next = new Set(prev)
      if (next.has(artist)) {
        next.delete(artist)
      } else {
        next.add(artist)
      }
      return next
    })
  }

  if (loading || !data) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <SpotifyAnalyticsHeader />
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {[1, 2, 3, 4].map(i => (
            <StatCard key={i} title="" value={0} loading />
          ))}
        </div>
        <div className="text-white/50 text-center mt-12 sm:mt-20 text-sm sm:text-base">
          Loading analytics...
        </div>
      </div>
    )
  }

  const snap = data.snapshot
  const changes24h = data.changes24h
  const changes7d = data.changes7d

  // Get artist metadata
  const artistMetadata = (snap.artistMetadata as any) || {}

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 space-y-6 sm:space-y-8 lg:space-y-10">
      {/* Header */}
      <SpotifyAnalyticsHeader lastUpdated={snap.dateKey} />

      {/* Top Statistics Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard
          title="Total Songs"
          value={snap.songs?.length || 0}
          change24h={changes24h?.totalSongs}
          change7d={changes7d?.totalSongs}
          variant="purple"
        />
        <StatCard
          title="Total Albums"
          value={snap.albums?.length || 0}
          change24h={changes24h?.totalAlbums}
          change7d={changes7d?.totalAlbums}
          variant="blue"
        />
        <StatCard
          title="Daily 200"
          value={snap.daily200?.length || 0}
          change24h={changes24h?.daily200Entries}
          change7d={changes7d?.daily200Entries}
          variant="pink"
        />
        <StatCard
          title="Artists"
          value={snap.songsByArtist?.length || 0}
          variant="gray"
        />
      </section>

      {/* Songs by Artist */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Disc3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Songs by Artist
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {snap.songsByArtist?.map((group: any) => (
            <ArtistSongCard
              key={group.artist}
              artist={group.artist}
              imageUrl={artistMetadata[group.artist]?.imageUrl}
              pageUrl={group.pageUrl}
              totals={group.totals}
              songs={group.songs || []}
              changes24h={changes24h?.songsByArtist[group.artist]}
              changes7d={changes7d?.songsByArtist[group.artist]}
              expanded={expandedArtists.has(group.artist)}
              onToggle={() => toggleArtist(group.artist)}
            />
          ))}
        </div>
      </section>

      {/* Global Daily Top 200 */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Global Daily Top 200
          </h2>
        </div>
        <RankingTable
          title="Global Daily Top 200 (BTS & Members)"
          headers={['Rank (Δ)', 'Artist/Track', 'Streams (+/-)']}
          rows={snap.daily200 || []}
          maxRows={10}
          exactDaily
        />
      </section>

      {/* Bottom Section: Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Most Streamed Artists (All Time) */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Music className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Most Streamed Artists
            </h2>
          </div>
          <RankingTable
            title="Most Streamed Artists"
            headers={['Rank', 'Artist', 'Streams', 'Daily (+/-)', 'Rank Δ']}
            rows={snap.artistsAllTime || []}
            changes24h={changes24h?.artistsAllTime}
            changes7d={changes7d?.artistsAllTime}
            maxRows={20}
          />
        </section>

        {/* Monthly Listener Rankings */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Monthly Listeners
            </h2>
          </div>
          <RankingTable
            title="Monthly Listener Rankings"
            headers={['Rank', 'Artist', 'Listeners', 'Daily +/-', 'Rank Δ']}
            rows={snap.monthlyListeners || []}
            changes24h={changes24h?.monthlyListeners}
            changes7d={changes7d?.monthlyListeners}
            maxRows={20}
          />
        </section>
      </div>
    </div>
  )
}
