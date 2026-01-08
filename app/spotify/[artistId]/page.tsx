'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ArtistHero from '@/components/spotify/artist/ArtistHero'
import ArtistStatsRow from '@/components/spotify/artist/ArtistStatsRow'
import ActivityChart from '@/components/spotify/artist/ActivityChart'
import TopSongs from '@/components/spotify/artist/TopSongs'
import Discography from '@/components/spotify/artist/Discography'
import ArtistSidebar from '@/components/spotify/artist/ArtistSidebar'
import { SnapshotComparison } from '@/lib/spotify/kworbSnapshotTypes'

// Artist Name Mapping
const ARTIST_MAP: Record<string, string> = {
  'bts': 'BTS',
  'rm': 'RM',
  'jin': 'Jin',
  'agust-d': 'Agust D',
  'j-hope': 'j-hope',
  'jimin': 'Jimin',
  'v': 'V',
  'jungkook': 'Jungkook'
}

// Mock Data for missing fields
const SOCIAL_ICONS = {
  spotify: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"></path></svg>,
  instagram: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>,
  twitter: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
}

// Helper to format large numbers
const formatNumber = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

export default function ArtistPage() {
  const params = useParams()
  const artistId = params.artistId as string
  const artistName = ARTIST_MAP[artistId] || 'BTS' // Fallback to BTS if unknown

  const [data, setData] = useState<SnapshotComparison | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/spotify/kworb/latest?includeChanges=true')
        const json = await res.json()
        if (json.ok) setData(json)
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
        <div className="text-white/50 text-sm sm:text-base">Loading artist data...</div>
      </div>
    )
  }

  const snap = data.snapshot

  // Find Artist Specific Data
  const artistSongs = snap.songsByArtist?.find(g => g.artist === artistName)
  const artistAlbums = snap.albumsByArtist?.find(g => g.artist === artistName)
  const artistAllTime = snap.artistsAllTime?.find(r => r.artist === artistName)
  const artistMonthly = snap.monthlyListeners?.find(r => r.artist === artistName)
  const artistMeta = (snap.artistMetadata as any)?.[artistName] || {}

  // Calculate Stats
  const totalStreams = artistAllTime?.streams || artistSongs?.totals.streams || 0
  const monthlyListeners = artistMonthly?.listeners || 0

  // Mock Follower Data (since it's not in Kworb)
  const followers = 72000000 // 72M placeholder

  // Changes
  const streamsChange = artistSongs?.totals.daily || 0
  const streamsPercent = (streamsChange / totalStreams) * 100

  const listenersChange = artistMonthly?.dailyChange || 0
  const listenersPercent = (listenersChange / monthlyListeners) * 100

  return (
    <div className="container mx-auto max-w-[1400px] px-3 sm:px-4 py-4 sm:py-6 md:py-8 lg:px-6 xl:px-8">
      {/* Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#a290cb]">
           <span className="hover:text-white transition-colors cursor-pointer">Hub</span>
           <span>/</span>
           <span className="hover:text-white transition-colors cursor-pointer">Artists</span>
           <span>/</span>
           <span className="text-white font-medium">{artistName}</span>
        </div>
      </div>

      <ArtistHero
        name={artistName}
        heroImage={artistMeta.imageUrl} // Use metadata image as hero bg (often suitable)
        avatarImage={artistMeta.imageUrl}
        tags={['K-Pop', 'Verified']}
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Left Column */}
        <div className="xl:col-span-3 flex flex-col gap-4 sm:gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Stats */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <ArtistStatsRow
                stats={{
                  streams: {
                    value: formatNumber(totalStreams),
                    change: parseFloat(streamsPercent.toFixed(2)) || 0.1, // Mock small percent if 0
                    percent: 85
                  },
                  listeners: {
                    value: formatNumber(monthlyListeners),
                    change: parseFloat(listenersPercent.toFixed(2)) || 0.2,
                    percent: 65
                  },
                  followers: {
                    value: formatNumber(followers),
                    change: 0.5,
                    percent: 72
                  }
                }}
              />
            </div>
            {/* Chart */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <ActivityChart artist={artistName} />
            </div>
          </div>

          {/* Top Songs */}
          <TopSongs
            songs={(artistSongs?.songs || [])
              .sort((a, b) => b.totalStreams - a.totalStreams)
              .slice(0, 6)
              .map(s => ({
              title: s.name,
              streams: formatNumber(s.totalStreams),
              duration: '3:00', // Mock duration as it's not in Kworb stream row
              coverUrl: s.albumArt || '/placeholder-song.jpg',
              dailyGain: s.dailyGain,
              totalStreams: s.totalStreams
            }))}
            allSongs={(artistSongs?.songs || [])
              .sort((a, b) => b.totalStreams - a.totalStreams)
              .map(s => ({
              title: s.name,
              streams: formatNumber(s.totalStreams),
              duration: '3:00',
              coverUrl: s.albumArt || '/placeholder-song.jpg',
              dailyGain: s.dailyGain,
              totalStreams: s.totalStreams
            }))}
          />

          {/* Discography */}
          <Discography
            albums={(artistAlbums?.albums || []).map(a => ({
               title: a.name,
               type: a.albumType === 'single' ? 'Single' : a.albumType === 'compilation' ? 'Compilation' : 'Album',
               year: a.releaseDate ? new Date(a.releaseDate).getFullYear().toString() : '2023',
               coverUrl: a.coverImage || '/placeholder-album.jpg'
            }))}
          />
        </div>

        {/* Right Column - Desktop */}
        <div className="hidden xl:block xl:col-span-1">
          <ArtistSidebar
            rankings={{
              global: { rank: artistAllTime?.rank || 0, label: 'TOP 50' },
              kpop: { rank: 1, label: 'LEADER' } // Mock K-pop rank
            }}
            socials={[
              { name: 'Spotify', url: '#', icon: SOCIAL_ICONS.spotify, color: '#1DB954' },
              { name: 'Instagram', url: '#', icon: SOCIAL_ICONS.instagram, color: '#E1306C' },
              { name: 'Twitter', url: '#', icon: SOCIAL_ICONS.twitter, color: '#1DA1F2' }
            ]}
            similar={[
              { name: 'BLACKPINK', imageUrl: '/placeholder-bp.jpg' },
              { name: 'Stray Kids', imageUrl: '/placeholder-skz.jpg' },
              { name: 'TXT', imageUrl: '/placeholder-txt.jpg' }
            ]}
          />
        </div>

        {/* Right Column - Mobile FAB trigger is inside ArtistSidebar component */}
        <div className="xl:hidden">
          <ArtistSidebar
            rankings={{
              global: { rank: artistAllTime?.rank || 0, label: 'TOP 50' },
              kpop: { rank: 1, label: 'LEADER' } // Mock K-pop rank
            }}
            socials={[
              { name: 'Spotify', url: '#', icon: SOCIAL_ICONS.spotify, color: '#1DB954' },
              { name: 'Instagram', url: '#', icon: SOCIAL_ICONS.instagram, color: '#E1306C' },
              { name: 'Twitter', url: '#', icon: SOCIAL_ICONS.twitter, color: '#1DA1F2' }
            ]}
            similar={[
              { name: 'BLACKPINK', imageUrl: '/placeholder-bp.jpg' },
              { name: 'Stray Kids', imageUrl: '/placeholder-skz.jpg' },
              { name: 'TXT', imageUrl: '/placeholder-txt.jpg' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
