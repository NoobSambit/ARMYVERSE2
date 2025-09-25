'use client'

import React from 'react'
import Image from 'next/image'
import { SongDoc } from '@/hooks/useAllSongs'

interface Props {
  songs: SongDoc[]
  primaryId: string | null
}

const CompactPlaylistGrid: React.FC<Props> = ({ songs, primaryId }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {songs.map((song, idx) => (
        <a
          key={song.spotifyId + idx}
          href={`https://open.spotify.com/track/${song.spotifyId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-black/40 border border-white/10 rounded-xl p-3 hover:bg-white/5 transition group"
        >
          <div className="relative w-20 h-20 mr-4">
            <Image
              src={song.thumbnails?.large || song.thumbnails?.medium || song.thumbnails?.small || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'}
              alt={song.name}
              width={80}
              height={80}
              className="w-full h-full object-cover rounded-lg group-hover:brightness-110"
              priority={idx === 0}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40 rounded-lg">
              <span className="text-white text-xl">▶️</span>
            </div>
            {primaryId && song.spotifyId === primaryId && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-xs px-2 py-0.5 rounded-full">🔥 Focus</span>
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-white font-semibold truncate">{song.name}</h4>
            <p className="text-sm text-gray-400 truncate">{song.artist}</p>
          </div>
        </a>
      ))}
    </div>
  )
}

export default CompactPlaylistGrid