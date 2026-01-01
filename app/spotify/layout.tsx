import React from 'react'
import SpotifyNavbar from '@/components/spotify/SpotifyNavbar'

export default function SpotifyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0E0C15]">
      <SpotifyNavbar />
      {children}
    </div>
  )
}
