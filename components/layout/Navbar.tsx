'use client'

/* Existing content... */
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Heart } from 'lucide-react'
import Image from 'next/image'
import { navItems } from '@/components/layout/nav-data'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/lib/firebase/auth'
import ProfileModal from '@/components/profile/ProfileModal'
import { getAuthToken } from '@/lib/auth/token'
import DonationModal from '@/components/layout/DonationModal'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDonateOpen, setIsDonateOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()
  const [profileName, setProfileName] = useState<string | null>(null)

  // Load profile name with immediate seed to prevent flicker
  useEffect(() => {
    if (!user) {
      setProfileName(null)
      return
    }

    // 1) Seed from cache or Firebase displayName immediately
    try {
      const cached = localStorage.getItem('av_profile_name')
      if (cached) {
        setProfileName(cached)
      } else {
        setProfileName(user.displayName || user.email || null)
      }
    } catch {
      setProfileName(user.displayName || user.email || null)
    }

    // 2) Fetch authoritative name from backend and cache it
    let cancelled = false
    const loadProfileName = async () => {
      try {
        const token = await getAuthToken(user)
        const response = await fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const { profile } = await response.json()
          const name = profile?.displayName || user.displayName || user.email || null
          if (!cancelled) {
            setProfileName(name)
            try { if (name) localStorage.setItem('av_profile_name', name) } catch { }
          }
        }
      } catch (err) {
        console.error('Failed to load profile name:', err)
      }
    }
    loadProfileName()

    return () => { cancelled = true }
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const isActive = (path: string) => pathname === path

  return (
    <div className="sticky top-0 z-50 w-full glass-panel border-b border-glass-border bg-black/80 md:bg-black/60">
      <header className="layout-container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6 lg:px-10 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 sm:gap-8 flex-1 min-w-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0">
            <div className="relative size-12 sm:size-14 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/40 rounded-full blur-lg opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-0 bg-white/10 rounded-full blur-md"></div>
              <Image
                src="https://res.cloudinary.com/dacgtjw7w/image/upload/v1767245893/armyverse_logo_1_woqztj.png"
                alt="ARMYVERSE Logo"
                fill
                className="object-contain relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                priority
              />
            </div>
            <h2 className="text-white text-base sm:text-xl font-bold tracking-tight group-hover:text-primary transition-colors">ARMYVERSE</h2>
          </Link>

          <nav className="hidden md:flex items-center gap-4 lg:gap-8 overflow-x-auto scrollbar-hide">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                href={path}
                className={`text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${isActive(path) ? 'text-white' : 'text-white/60 hover:text-white'
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Donate Button (Always Visible) */}
          <button
            onClick={() => setIsDonateOpen(true)}
            className="flex h-8 sm:h-10 px-3 sm:px-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white text-[10px] sm:text-xs md:text-sm font-bold items-center gap-1.5 sm:gap-2 transition-all hover:scale-105 shadow-lg shadow-pink-900/20"
          >
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-white/20" />
            <span>Donate</span>
          </button>

          {/* Auth / Profile */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <ProfileModal trigger={
                <div
                  className="size-8 sm:size-10 rounded-full bg-cover bg-center border-2 border-primary/30 cursor-pointer hover:border-primary transition-colors bg-gray-700 flex items-center justify-center overflow-hidden"
                  style={{ backgroundImage: user.photoURL ? `url('${user.photoURL}')` : undefined }}
                >
                  {!user.photoURL && <span className="text-white text-xs sm:text-base font-bold">{profileName?.charAt(0) || 'A'}</span>}
                </div>
              } />
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="h-8 sm:h-10 px-3 sm:px-4 rounded-full bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold flex items-center transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="size-8 sm:size-10 flex items-center justify-center text-white"
            >
              {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-glass-border absolute w-full left-0 top-14 sm:top-16 p-3 sm:p-4 flex flex-col gap-2 sm:gap-4 max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto bg-black/95 backdrop-blur-xl">
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              href={path}
              onClick={() => setIsOpen(false)}
              className={`text-xs sm:text-sm font-medium p-2 sm:p-2 rounded-xl transition-colors ${isActive(path) ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
            >
              {label}
            </Link>
          ))}



          {isAuthenticated && user && (
            <button
              onClick={handleSignOut}
              className="text-xs sm:text-sm font-medium p-2 rounded-xl text-red-400 hover:bg-white/5 text-left"
            >
              Sign Out
            </button>
          )}
        </div>
      )}

      {/* Donation Modal */}
      <DonationModal isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} />
    </div>
  )
}
