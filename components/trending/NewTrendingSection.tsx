'use client'

import { useState, useEffect } from 'react'
import { Music, Youtube, Users, User } from 'lucide-react'
import TopSongsGrid, { type TopSong } from './TopSongsGrid'

type Category = 'ot7' | 'solo'
type Member = 'Jungkook' | 'V' | 'Suga' | 'RM' | 'Jimin' | 'Jin' | 'J-Hope'

const MEMBERS: Member[] = ['Jungkook', 'V', 'Suga', 'RM', 'Jimin', 'Jin', 'J-Hope']

const MEMBER_COLORS: Record<Member, string> = {
  Jungkook: 'from-purple-600 to-pink-600',
  V: 'from-green-600 to-teal-600',
  Suga: 'from-gray-700 to-gray-900',
  RM: 'from-blue-600 to-purple-600',
  Jimin: 'from-orange-600 to-red-600',
  Jin: 'from-pink-600 to-rose-600',
  'J-Hope': 'from-yellow-600 to-orange-600',
}

interface ApiResponse {
  ok: boolean
  platform: string
  category: string
  artist: string
  songs: TopSong[]
}

export default function NewTrendingSection() {
  const [category, setCategory] = useState<Category>('ot7')
  const [selectedMember, setSelectedMember] = useState<Member>('Jungkook')
  
  const [spotifySongs, setSpotifySongs] = useState<TopSong[]>([])
  const [youtubeSongs, setYoutubeSongs] = useState<TopSong[]>([])
  
  const [spotifyLoading, setSpotifyLoading] = useState(true)
  const [youtubeLoading, setYoutubeLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [category, selectedMember])

  const fetchData = async () => {
    setSpotifyLoading(true)
    setYoutubeLoading(true)

    const artist = category === 'ot7' ? 'BTS' : selectedMember
    
    // Fetch Spotify data
    try {
      const spotifyRes = await fetch(`/api/trending/top-songs?platform=spotify&category=${category}&member=${artist}`)
      const spotifyData: ApiResponse = await spotifyRes.json()
      console.log('Spotify API Response:', spotifyData)
      if (spotifyData.ok && spotifyData.songs) {
        setSpotifySongs(spotifyData.songs)
      } else {
        console.error('Spotify API returned no songs or error:', spotifyData)
        setSpotifySongs([])
      }
    } catch (err) {
      console.error('Spotify fetch error:', err)
      setSpotifySongs([])
    } finally {
      setSpotifyLoading(false)
    }

    // Fetch YouTube data
    try {
      const youtubeRes = await fetch(`/api/trending/top-songs?platform=youtube&category=${category}&member=${artist}`)
      const youtubeData: ApiResponse = await youtubeRes.json()
      console.log('YouTube API Response:', youtubeData)
      if (youtubeData.ok && youtubeData.songs) {
        setYoutubeSongs(youtubeData.songs)
      } else {
        console.error('YouTube API returned no songs or error:', youtubeData)
        setYoutubeSongs([])
      }
    } catch (err) {
      console.error('YouTube fetch error:', err)
      setYoutubeSongs([])
    } finally {
      setYoutubeLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Trending Now</h2>
        <p className="text-gray-300 text-sm sm:text-base">Top songs by daily streams from Kworb</p>
      </div>

      {/* Category Toggle (OT7 vs Solo) */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="bg-white/6 backdrop-blur-md rounded-xl p-1 border border-white/10">
          <button
            onClick={() => setCategory('ot7')}
            className={`px-6 py-3 rounded-lg transition-all font-semibold ${
              category === 'ot7'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Users className="inline mr-2" size={20} />
            OT7
          </button>
          <button
            onClick={() => setCategory('solo')}
            className={`px-6 py-3 rounded-lg transition-all font-semibold ${
              category === 'solo'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <User className="inline mr-2" size={20} />
            Solo
          </button>
        </div>
      </div>

      {/* Member Selector (shown when Solo is selected) */}
      {category === 'solo' && (
        <div className="mb-8 sm:mb-10">
          <h3 className="text-center text-white font-semibold mb-4">Select Member</h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {MEMBERS.map((member) => (
              <button
                key={member}
                onClick={() => setSelectedMember(member)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all ${
                  selectedMember === member
                    ? `bg-gradient-to-r ${MEMBER_COLORS[member]} text-white shadow-xl scale-105`
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {member}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-side Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12">
        {/* Spotify Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center">
              <Music className="mr-2 text-green-400" size={24} />
              Spotify
            </h3>
            <span className="text-sm text-gray-400">
              {category === 'ot7' ? 'BTS' : selectedMember}
            </span>
          </div>
          
          {spotifyLoading ? (
            <div className="bg-gray-800/30 rounded-xl p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading Spotify data...</p>
            </div>
          ) : (
            <TopSongsGrid songs={spotifySongs} platform="spotify" />
          )}
        </section>

        {/* YouTube Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center">
              <Youtube className="mr-2 text-pink-400" size={24} />
              YouTube
            </h3>
            <span className="text-sm text-gray-400">
              {category === 'ot7' ? 'BTS' : selectedMember}
            </span>
          </div>
          
          {youtubeLoading ? (
            <div className="bg-gray-800/30 rounded-xl p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading YouTube data...</p>
            </div>
          ) : (
            <TopSongsGrid songs={youtubeSongs} platform="youtube" />
          )}
        </section>
      </div>

      {/* Info Footer */}
      <div className="text-center text-gray-500 text-xs sm:text-sm mb-8">
        <p>Data sourced from <a href="https://kworb.net" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">kworb.net</a></p>
        <p className="mt-1">Rankings based on streams gained in the last 24 hours</p>
      </div>
    </div>
  )
}
