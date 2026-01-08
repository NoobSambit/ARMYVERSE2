'use client'

import React, { useState } from 'react'
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
  const [currentPage, setCurrentPage] = useState(0)

  // Responsive albums per page
  const albumsPerPage = typeof window !== 'undefined' && window.innerWidth < 640 ? 4 : 5

  const totalPages = Math.ceil(albums.length / albumsPerPage)
  const startIndex = currentPage * albumsPerPage
  const endIndex = startIndex + albumsPerPage
  const currentAlbums = albums.slice(startIndex, endIndex)

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
  }

  if (albums.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4 mt-2">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-bold text-base sm:text-lg">Discography</h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-white/40 text-xs sm:text-sm">{currentPage + 1} / {totalPages}</span>
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 0}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#2e2249] hover:bg-white/10 flex items-center justify-center transition-colors text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages - 1}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#2e2249] hover:bg-white/10 flex items-center justify-center transition-colors text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {currentAlbums.map((album, i) => (
          <div key={`${startIndex}-${i}`} className="group cursor-pointer">
            <div className="aspect-square bg-[#2e2249] rounded-xl overflow-hidden mb-2 sm:mb-3 relative">
              <img
                src={album.coverUrl}
                alt={album.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h5 className="text-white text-xs sm:text-sm font-bold truncate">{album.title}</h5>
            <p className="text-[#a290cb] text-[10px] sm:text-xs">{album.year} • {album.type}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
