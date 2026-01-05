'use client'

import React from 'react'
import { Play } from 'lucide-react'

interface Song {
  title: string
  streams: string
  duration: string
  coverUrl: string
}

interface TopSongsProps {
  songs: Song[]
}

export default function TopSongs({ songs }: TopSongsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-bold text-lg">Top Songs</h3>
        <button className="text-[#895af6] text-sm font-medium hover:underline">View All</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {songs.map((song, i) => (
          <div 
            key={i}
            className="bg-[#2e2249] rounded-xl p-3 flex items-center gap-4 hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5"
          >
            <div className="relative h-16 w-16 min-w-[64px] rounded-xl overflow-hidden">
              <img 
                src={song.coverUrl} 
                alt={song.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <h4 className="text-white font-bold truncate">{song.title}</h4>
              <p className="text-[#a290cb] text-xs truncate">{song.streams} Streams</p>
            </div>
            <div className="text-[#a290cb] text-xs font-mono">{song.duration}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
