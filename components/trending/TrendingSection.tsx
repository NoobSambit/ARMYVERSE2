'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Star, Music, Eye } from 'lucide-react'
import { fetchYouTubeTrending, fetchSpotifyTrending, fetchAllMembersSpotlight, fetchMembersYouTubeData, formatViewCount } from '@/lib/trending/fetch'
import SongCard from './SongCard'
import MemberCarousel, { type MemberItem } from './MemberCarousel'

interface TrendingVideo {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
  viewCount: number
  likeCount: number
  videoUrl: string
  badges: Array<{ type: string; text: string; color: string }>
}

interface TrendingTrack {
  id: string
  name: string
  artist: string
  album: string
  albumArt: string
  popularity: number
  duration: string
  spotifyUrl: string
  releaseDate: string
  estimatedStreams: number
  badges: Array<{ type: string; text: string; color: string }>
}

interface MemberSpotlight {
  member: string
  track: {
    id: string
    name: string
    artist: string
    album: string
    albumArt: string
    popularity: number
    spotifyUrl: string
    estimatedStreams: number
  }
}

export default function TrendingSection() {
  const [activeTab, setActiveTab] = useState<'spotify' | 'youtube'>('spotify')
  const [memberTab, setMemberTab] = useState<'spotify' | 'youtube'>('spotify')
  const [spotifyTracks, setSpotifyTracks] = useState<TrendingTrack[]>([])
  const [youtubeVideos, setYoutubeVideos] = useState<TrendingVideo[]>([])
  const [spotifyMembers, setSpotifyMembers] = useState<MemberSpotlight[]>([])
  const [youtubeMembers, setYoutubeMembers] = useState<MemberSpotlight[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [spotifyLoaded, setSpotifyLoaded] = useState(false)
  const [youtubeLoaded, setYouTubeLoaded] = useState(false)
  // intentionally no error state to avoid hard-failing UI on quota issues

  useEffect(() => {
    // Fetch Spotify first; when it resolves, render immediately if it has data
    fetchSpotifyTrending()
      .then((data) => {
        setSpotifyTracks(data)
        setSpotifyLoaded(true)
        if (initialLoading && data.length > 0) {
          setActiveTab('spotify')
          setInitialLoading(false)
        }
      })
      .catch(() => {
        setSpotifyLoaded(true)
      })

    // Fetch YouTube in parallel; do not block initial render
    fetchYouTubeTrending()
      .then((data) => {
        setYoutubeVideos(data)
        setYouTubeLoaded(true)
        if (initialLoading && data.length > 0) {
          setActiveTab('youtube')
          setInitialLoading(false)
        }
      })
      .catch(() => {
        setYouTubeLoaded(true)
      })

    // Member spotlight (background)
    fetchAllMembersSpotlight().then(setSpotifyMembers).catch(() => setSpotifyMembers([]))
    fetchMembersYouTubeData().then(setYoutubeMembers).catch(() => setYoutubeMembers([]))
  }, [initialLoading])

  

  if (initialLoading && !spotifyLoaded && !youtubeLoaded) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🌟 BTS Universe</h1>
          <p className="text-gray-300">Loading the hottest BTS content...</p>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 animate-pulse border border-gray-700/50">
              <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
              <div className="bg-gray-700 h-4 rounded mb-2"></div>
              <div className="bg-gray-700 h-3 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render progressively with whichever is available first

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Trending Now</h2>
        <p className="text-gray-300 text-sm">Across Spotify and YouTube</p>
      </div>

      {/* Tab Navigation (visual emphasis only) */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/6 backdrop-blur-md rounded-xl p-1 border border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('spotify')}
            className={`px-6 py-3 rounded-lg transition-all ${activeTab === 'spotify' ? 'bg-green-500/80 text-white shadow-lg' : 'text-white/80 hover:text-white'}`}
          >
            <Music className="inline mr-2" size={20} /> Spotify
          </button>
          <button
            onClick={() => setActiveTab('youtube')}
            className={`px-6 py-3 rounded-lg transition-all ${activeTab === 'youtube' ? 'bg-pink-500/80 text-white shadow-lg' : 'text-white/80 hover:text-white'}`}
            disabled={youtubeVideos.length === 0}
          >
            <Eye className="inline mr-2" size={20} /> YouTube {youtubeVideos.length === 0 ? '(quota)' : ''}
          </button>
        </div>
      </div>



      {/* Side-by-side Top 5 (Spotify vs YouTube) */}
      <div className="mb-10 sm:mb-12">
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center"><TrendingUp className="mr-2" /> Top 5 Trending</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spotify Column */}
          <section aria-labelledby="spot-col">
            <div className={`flex items-center justify-between mb-3 ${activeTab === 'spotify' ? 'opacity-100' : 'opacity-80'}`}>
              <h4 id="spot-col" className="text-white font-semibold inline-flex items-center"><Music className="w-4 h-4 mr-2 text-green-400"/> Spotify</h4>
            </div>
            <div className="space-y-3">
              {spotifyTracks.slice(0,5).map((t, i) => (
                <SongCard
                  key={t.id}
                  id={t.id}
                  title={t.name}
                  artist={t.artist}
                  thumbnailUrl={t.albumArt}
                  duration={t.duration}
                  popularityOrViews={`${t.popularity}% popularity`}
                  platform="spotify"
                  openUrl={t.spotifyUrl}
                  rank={i+1}
                />
              ))}
            </div>
          </section>
          {/* YouTube Column */}
          <section aria-labelledby="yt-col">
            <div className={`flex items-center justify-between mb-3 ${activeTab === 'youtube' ? 'opacity-100' : 'opacity-80'}`}>
              <h4 id="yt-col" className="text-white font-semibold inline-flex items-center"><Eye className="w-4 h-4 mr-2 text-pink-400"/> YouTube</h4>
            </div>
            <div className="space-y-3">
              {youtubeVideos.slice(0,5).map((v, i) => (
                <SongCard
                  key={v.id}
                  id={v.id}
                  title={v.title}
                  artist={v.channelTitle}
                  thumbnailUrl={v.thumbnail}
                  popularityOrViews={`${formatViewCount(v.viewCount)} views`}
                  platform="youtube"
                  openUrl={v.videoUrl}
                  rank={i+1}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Member Spotlight */}
      {(memberTab === 'spotify' ? spotifyMembers : youtubeMembers).length > 0 && (
        <div className="mb-10 sm:mb-12">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
            <Star className="mr-2" />
            Member Spotlight
          </h3>
          
          {/* Member Tab Navigation */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/6 backdrop-blur-md rounded-xl p-1 border border-white/10 overflow-x-auto">
              <button
                onClick={() => setMemberTab('spotify')}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${
                  memberTab === 'spotify'
                    ? 'bg-green-500/80 text-white shadow-lg'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Music className="inline mr-1" size={16} />
                Spotify
              </button>
              <button
                onClick={() => setMemberTab('youtube')}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${
                  memberTab === 'youtube'
                    ? 'bg-pink-500/80 text-white shadow-lg'
                    : 'text-white/80 hover:text-white'
                }`}
                disabled={youtubeMembers.length === 0}
              >
                <Eye className="inline mr-1" size={16} />
                YouTube {youtubeMembers.length === 0 ? '(quota)' : ''}
              </button>
            </div>
          </div>
          
          <MemberCarousel items={(memberTab === 'spotify' ? (spotifyMembers as MemberItem[]) : (youtubeMembers as MemberItem[]))} />
        </div>
      )}
    </div>
  )
}





