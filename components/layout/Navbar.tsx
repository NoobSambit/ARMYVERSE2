'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, LogOut } from 'lucide-react'
import { navItems } from '@/components/layout/nav-data'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/lib/firebase/auth'
import ProfileModal from '@/components/profile/ProfileModal'
 

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
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
        const token = await user.getIdToken()
        const response = await fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const { profile } = await response.json()
          const name = profile?.displayName || user.displayName || user.email || null
          if (!cancelled) {
            setProfileName(name)
            try { if (name) localStorage.setItem('av_profile_name', name) } catch {}
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
    <nav className={`sticky top-0 z-50 backdrop-blur-md bg-gradient-to-b from-[#1a082a]/90 to-[#0b0310]/80 border-b border-[#3b1a52]/60`} aria-label="Primary Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between h-16`}>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative w-[2.4rem] h-[2.4rem] lg:w-12 lg:h-12 rounded">
              <Image src="https://res.cloudinary.com/dacgtjw7w/image/upload/v1767245893/armyverse_logo_1_woqztj.png" alt="ARMYVERSE" fill sizes="(max-width:1024px) 40px, 48px" className="object-contain rounded" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#FF9AD5] to-[#C084FC] bg-clip-text text-transparent select-none">
              ARMYVERSE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                href={path}
                aria-current={isActive(path) ? 'page' : undefined}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 flex items-center space-x-2 relative ${
                  isActive(path) ? 'text-[#C084FC]' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
            
            {/* Auth Buttons */}
            <div className="ml-4 flex items-center space-x-2">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-2">
                  <ProfileModal trigger={
                    <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg">
                      <User className="w-4 h-4" />
                      <span>{profileName || user.displayName || user.email}</span>
                    </button>
                  } />
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signup"
                  className="btn-glass-primary text-sm font-medium"
                >
                  Sign Up
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-black/50 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-[#0b0310]/95 backdrop-blur-md border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                href={path}
                onClick={() => setIsOpen(false)}
                aria-current={isActive(path) ? 'page' : undefined}
                className={`flex px-3 py-2 rounded-md text-base font-medium transition-all duration-300 items-center space-x-2 relative
                  ${isActive(path)
                    ? 'text-[#C084FC] bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
            <div className="px-3 py-2">
              {isAuthenticated && user ? (
                <button
                  onClick={handleSignOut}
                  className="w-full px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  href="/auth/signup"
                  onClick={() => setIsOpen(false)}
                  className="btn-glass-primary text-base font-medium w-full justify-center"
                >
                  Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Static subtle bottom border only */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-[#3b1a52] via-[#4a1f66] to-[#3b1a52]" />
    </nav>
  )
}