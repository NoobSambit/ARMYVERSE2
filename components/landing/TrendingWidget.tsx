'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

type Song = {
  rank: number
  title: string
  artist: string
  thumbnail?: string
}

const members = [
  { id: 'all', name: 'All', image: 'https://i.pravatar.cc/150?img=1' },
  { id: 'RM', name: 'RM', image: 'https://i.pravatar.cc/150?img=13' },
  { id: 'Jin', name: 'Jin', image: 'https://i.pravatar.cc/150?img=14' },
  { id: 'Suga', name: 'Suga', image: 'https://i.pravatar.cc/150?img=15' },
  { id: 'j-hope', name: 'J-Hope', image: 'https://i.pravatar.cc/150?img=33' },
  { id: 'Jimin', name: 'Jimin', image: 'https://i.pravatar.cc/150?img=26' },
  { id: 'V', name: 'V', image: 'https://i.pravatar.cc/150?img=68' },
  { id: 'Jung Kook', name: 'Jungkook', image: 'https://i.pravatar.cc/150?img=52' },
]

export default function TrendingWidget() {
  const [category, setCategory] = useState<'ot7' | 'solo'>('ot7')
  const [selectedMember, setSelectedMember] = useState('all')
  const [spotifySongs, setSpotifySongs] = useState<Song[]>([
    { rank: 1, title: "Seven (feat. Latto)", artist: "Jung Kook" },
    { rank: 2, title: "Like Crazy", artist: "Jimin" },
    { rank: 3, title: "Love Me Again", artist: "V" }
  ])
  const [youtubeSongs, setYoutubeSongs] = useState<Song[]>([
    { rank: 1, title: "Haegeum MV", artist: "Agust D" },
    { rank: 2, title: "Dynamite MV", artist: "BTS" },
    { rank: 3, title: "on the street", artist: "j-hope, J. Cole" }
  ])

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin

        // For solo category, fetch specific member or all solo artists
        const memberParam = category === 'solo' && selectedMember !== 'all' ? `&member=${selectedMember}` : ''

        const [spotifyRes, youtubeRes] = await Promise.all([
          fetch(`${baseUrl}/api/trending/top-songs?platform=spotify&category=${category}${memberParam}`).catch(() => null),
          fetch(`${baseUrl}/api/trending/top-songs?platform=youtube&category=${category}${memberParam}`).catch(() => null)
        ])

        if (spotifyRes?.ok) {
          const data = await spotifyRes.json()
          if (data.ok && data.songs?.length > 0) {
            setSpotifySongs(data.songs.slice(0, 3).map((s: any, idx: number) => ({
              rank: idx + 1,
              title: s.title,
              artist: s.artist,
              thumbnail: s.thumbnail
            })))
          }
        }

        if (youtubeRes?.ok) {
          const data = await youtubeRes.json()
          if (data.ok && data.songs?.length > 0) {
            setYoutubeSongs(data.songs.slice(0, 3).map((s: any, idx: number) => ({
              rank: idx + 1,
              title: s.title,
              artist: s.artist,
              thumbnail: s.thumbnail
            })))
          }
        }
      } catch (error) {
        console.error('Failed to fetch trending songs:', error)
      }
    }

    fetchTrending()
  }, [category, selectedMember])

  return (
    <div className="col-span-1 md:col-span-2 md:row-span-2 glass-panel rounded-2xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">Trending Now</h3>
          <p className="text-xs text-gray-400">Top tracks across platforms</p>
        </div>
        <div className="flex p-1 bg-secondary rounded-xl">
          <button
            onClick={() => {
              setCategory('ot7')
              setSelectedMember('all')
            }}
            className={`px-3 py-1 text-xs font-bold transition-colors rounded-md ${
              category === 'ot7' ? 'text-white bg-primary shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            OT7
          </button>
          <button
            onClick={() => setCategory('solo')}
            className={`px-3 py-1 text-xs font-bold transition-colors rounded-md ${
              category === 'solo' ? 'text-white bg-primary shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Solo
          </button>
        </div>
      </div>

      {/* Member Selection - Only show in Solo mode */}
      {category === 'solo' && (
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-2">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member.id)}
              className={`flex flex-col items-center gap-1 shrink-0 ${
                selectedMember === member.id ? '' : 'opacity-50 hover:opacity-100'
              } transition-opacity`}
            >
              <div className={`size-12 rounded-full overflow-hidden border-2 ${
                selectedMember === member.id ? 'border-primary' : 'border-transparent'
              } transition-colors`}>
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] text-gray-400 font-medium">{member.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
        {/* Spotify List */}
        <div className="bg-secondary/30 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-4 text-accent-green">
            <span className="material-symbols-outlined text-sm">social_distance</span>
            <span className="text-xs font-bold uppercase">Spotify Global</span>
          </div>
          <div className="space-y-3">
            {spotifySongs.map((song) => (
              <TrendingItem key={song.rank} rank={song.rank} title={song.title} artist={song.artist} thumbnail={song.thumbnail} />
            ))}
          </div>
        </div>

        {/* YouTube List */}
        <div className="bg-secondary/30 rounded-xl p-4 border border-white/5">
           <div className="flex items-center gap-2 mb-4 text-red-500">
            <span className="material-symbols-outlined text-sm">play_arrow</span>
            <span className="text-xs font-bold uppercase">YouTube Trending</span>
          </div>
          <div className="space-y-3">
            {youtubeSongs.map((song) => (
              <TrendingItem key={song.rank} rank={song.rank} title={song.title} artist={song.artist} thumbnail={song.thumbnail} isYoutube />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TrendingItem({ rank, title, artist, thumbnail, isYoutube }: { rank: number, title: string, artist: string, thumbnail?: string, isYoutube?: boolean }) {
    return (
        <div className="flex items-center gap-3 group cursor-pointer">
            {!isYoutube && <span className="text-lg font-bold text-gray-500 w-4">{rank}</span>}
            <div
              className="size-10 rounded bg-gray-700 bg-cover"
              style={{ backgroundImage: thumbnail ? `url('${thumbnail}')` : `url('https://api.dicebear.com/7.x/shapes/svg?seed=${title}')` }}
            ></div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold text-white truncate ${isYoutube ? 'group-hover:text-red-500' : 'group-hover:text-accent-green'}`}>{title}</p>
                <p className="text-xs text-gray-400">{artist}</p>
            </div>
        </div>
    )
}
