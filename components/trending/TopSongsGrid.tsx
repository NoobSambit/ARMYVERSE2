'use client'

import Image from 'next/image'
import { Play, ExternalLink } from 'lucide-react'

export interface TopSong {
  rank: number
  title: string
  artist: string
  thumbnail?: string
  url?: string
  dailyStreams?: number
  yesterday?: number
  views?: number
  totalStreams?: number
}

interface TopSongsGridProps {
  songs: TopSong[]
  platform: 'spotify' | 'youtube'
}

function formatNumber(num?: number): string {
  if (!num) return '0'
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}

export default function TopSongsGrid({ songs, platform }: TopSongsGridProps) {
  if (!songs || songs.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-gray-400 mb-4">
          <p className="text-lg font-semibold">No songs available</p>
          <p className="text-xs mt-2 opacity-70">Platform: {platform}</p>
        </div>
        {platform === 'youtube' && (
          <div className="text-sm text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 max-w-md mx-auto">
            <p className="font-semibold mb-2">💡 First time setup?</p>
            <p className="text-xs text-gray-300">
              Run the YouTube cron job to populate data:<br />
              <code className="bg-black/30 px-2 py-1 rounded mt-2 inline-block text-yellow-300">
                curl -X POST /api/youtube/kworb/cron
              </code>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Or visit <a href="/test-trending" className="underline">/test-trending</a> for quick setup
            </p>
          </div>
        )}
      </div>
    )
  }

  const topSong = songs[0]
  const remainingSongs = songs.slice(1, 6)

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {/* Top Song - Takes 2x2 grid */}
      <div 
        className="col-span-2 row-span-2 relative group overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300"
      >
        <div className="relative aspect-square">
          {topSong.thumbnail ? (
            <Image
              src={topSong.thumbnail}
              alt={topSong.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Play size={64} className="text-white/50" />
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-100 group-hover:opacity-90 transition-opacity" />
          
          {/* Rank Badge */}
          <div className="absolute top-3 left-3 bg-yellow-500 text-black font-bold px-3 py-1.5 rounded-full text-sm sm:text-base shadow-lg">
            #1
          </div>
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <h3 className="text-white font-bold text-lg sm:text-xl mb-1 sm:mb-2 line-clamp-2">
              {topSong.title}
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3">{topSong.artist}</p>
            
            <div className="flex items-center justify-between">
              <div className="text-xs sm:text-sm">
                {platform === 'spotify' ? (
                  <span className="text-green-400 font-semibold">
                    +{formatNumber(topSong.dailyStreams)} daily
                  </span>
                ) : (
                  <span className="text-pink-400 font-semibold">
                    +{formatNumber(topSong.yesterday)} yesterday
                  </span>
                )}
              </div>
              
              {topSong.url && (
                <a
                  href={topSong.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-all"
                >
                  <ExternalLink size={16} className="text-white" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Remaining Songs - Each takes 1x1 grid */}
      {remainingSongs.map((song) => (
        <div
          key={song.rank}
          className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 hover:border-gray-600/80 transition-all duration-300"
        >
          <div className="relative aspect-square">
            {song.thumbnail ? (
              <Image
                src={song.thumbnail}
                alt={song.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <Play size={32} className="text-white/30" />
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-100 transition-opacity" />
            
            {/* Rank Badge */}
            <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm text-white font-bold px-2 py-0.5 rounded-full text-xs">
              #{song.rank}
            </div>
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
              <h4 className="text-white font-semibold text-xs sm:text-sm mb-0.5 line-clamp-1">
                {song.title}
              </h4>
              <p className="text-gray-400 text-[10px] sm:text-xs mb-1 line-clamp-1">
                {song.artist}
              </p>
              
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                {platform === 'spotify' ? (
                  <span className="text-green-400">
                    +{formatNumber(song.dailyStreams)}
                  </span>
                ) : (
                  <span className="text-pink-400">
                    +{formatNumber(song.yesterday)}
                  </span>
                )}
                
                {song.url && (
                  <a
                    href={song.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink size={12} className="text-white" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Fill empty slots if less than 6 songs */}
      {[...Array(Math.max(0, 5 - remainingSongs.length))].map((_, i) => (
        <div
          key={`empty-${i}`}
          className="aspect-square rounded-xl bg-gray-800/30 border border-gray-700/30"
        />
      ))}
    </div>
  )
}
