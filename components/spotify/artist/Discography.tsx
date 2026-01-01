'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Album {
  title: string
  type: string
  year: string
  coverUrl: string
}

interface DiscographyProps {
  albums: Album[]
}

export default function Discography({ albums }: DiscographyProps) {
  return (
    <div className="flex flex-col gap-4 mt-2">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-bold text-lg">Discography</h3>
        <div className="flex gap-2">
          <button className="h-8 w-8 rounded-full bg-[#2e2249] hover:bg-white/10 flex items-center justify-center transition-colors text-white">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="h-8 w-8 rounded-full bg-[#2e2249] hover:bg-white/10 flex items-center justify-center transition-colors text-white">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {albums.map((album, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="aspect-square bg-[#2e2249] rounded-lg overflow-hidden mb-3 relative">
              <img 
                src={album.coverUrl} 
                alt={album.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h5 className="text-white text-sm font-bold truncate">{album.title}</h5>
            <p className="text-[#a290cb] text-xs">{album.year} • {album.type}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
