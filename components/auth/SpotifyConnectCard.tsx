'use client'

import React, { useEffect, useState } from 'react'
import { FaSpotify, FaLock } from 'react-icons/fa'
import { CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth'
import { getAuthToken } from '@/lib/auth/token'

interface SpotifyConnectCardProps {
  onAuthSuccess?: () => void
}

export default function SpotifyConnectCard({ onAuthSuccess }: SpotifyConnectCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { refreshStatus } = useSpotifyAuth()

  // Handle callback from Spotify (store token from URL and mark as authenticated)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const auth = urlParams.get('auth')
    const error = urlParams.get('error')

    if (error) {
      return
    }

    if (auth === 'success') {
      refreshStatus()
      onAuthSuccess?.()
    }

    if (auth || error) {
      urlParams.delete('auth')
      urlParams.delete('error')
      const nextQuery = urlParams.toString()
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`
      window.history.replaceState({}, document.title, nextUrl)
    }
  }, [onAuthSuccess, refreshStatus])

  const handleConnect = async () => {
    try {
      if (!user) {
        return
      }

      setIsLoading(true)
      const idToken = await getAuthToken(user)
      const response = await fetch('/api/spotify/auth-url', {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      })
      const data = await response.json()
      if (data?.url) {
        window.location.href = data.url
      }
    } catch {
      // Swallow to avoid breaking UX; existing flow handles errors after redirect
    } finally {
      setIsLoading(false)
      onAuthSuccess?.()
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1a0b2e] to-[#3b1d60] relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 shimmer-bg opacity-40" aria-hidden="true" />

      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-8 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="text-center">
            <FaSpotify className="mx-auto mb-4 text-4xl text-green-500 drop-shadow-[0_0_6px_#1DB954] icon-pulse" />

            <h1 className="text-2xl font-bold text-white mb-3 fade-in">Connect Your Spotify</h1>

            <ul className="text-left fade-in delay-150">
              <li className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400 drop-shadow-[0_0_6px_#1DB954] mt-0.5" />
                <span className="text-sm text-white/90 leading-relaxed">View your top BTS songs & artists</span>
              </li>
              <li className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400 drop-shadow-[0_0_6px_#1DB954] mt-0.5" />
                <span className="text-sm text-white/90 leading-relaxed">Get mood & listening insights</span>
              </li>
              <li className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400 drop-shadow-[0_0_6px_#1DB954] mt-0.5" />
                <span className="text-sm text-white/90 leading-relaxed">Receive personalized playlist recommendations</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400 drop-shadow-[0_0_6px_#1DB954] mt-0.5" />
                <span className="text-sm text-white/90 leading-relaxed">Track your music trends instantly</span>
              </li>
            </ul>

            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="mt-7 w-full rounded-xl py-3 px-4 text-white font-semibold bg-gradient-to-r from-[#1DB954] to-[#1ed760] hover:from-[#1ed760] hover:to-[#1DB954] shadow-lg hover:shadow-[0_0_20px_rgba(29,185,84,0.6)] transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#1DB954]/60"
            >
              <FaSpotify className="text-white" />
              {isLoading ? 'Connecting…' : 'Connect with Spotify'}
            </button>

            <div className="text-xs text-gray-400 mt-4 flex items-center gap-1 fade-in delay-500">
              <FaLock className="opacity-80" />
              <span>We respect your privacy. We only access your public profile and listening data.</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes bgShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .shimmer-bg {
          background: radial-gradient(1200px 1200px at 0% 0%, rgba(255,255,255,0.06), transparent 60%),
                      radial-gradient(1200px 1200px at 100% 100%, rgba(255,255,255,0.06), transparent 60%),
                      linear-gradient(120deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02), rgba(255,255,255,0.08));
          background-size: 200% 200%;
          animation: bgShimmer 14s ease-in-out infinite;
        }

        @keyframes pulseSoft {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 6px rgba(29,185,84,0.5)); }
          50% { transform: scale(1.06); filter: drop-shadow(0 0 10px rgba(29,185,84,0.7)); }
        }
        .icon-pulse {
          animation: pulseSoft 2.8s ease-in-out infinite;
        }

        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeInUp 0.6s ease forwards; opacity: 0; }
        .fade-in.delay-150 { animation-delay: 0.15s; }
        .fade-in.delay-500 { animation-delay: 0.5s; }
      `}</style>
    </div>
  )
}


