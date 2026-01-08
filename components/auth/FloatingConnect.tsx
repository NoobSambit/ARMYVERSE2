'use client'

import { Link as LinkIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function FloatingConnect() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  if (isAuthenticated && user) return null

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <button 
        onClick={() => router.push('/auth/signin')}
        className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-5 sm:py-3 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black text-sm sm:text-base font-bold shadow-[0_4px_20px_rgba(29,185,84,0.4)] transition-all hover:scale-105 group animate-bounce"
      >
        <LinkIcon className="group-hover:rotate-180 transition-transform duration-500 w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden xs:inline">Connect Spotify</span>
        <span className="xs:hidden">Connect</span>
      </button>
    </div>
  )
}