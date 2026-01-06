'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, LogOut, Search, Bell, Sparkles } from 'lucide-react'
import { navItems } from '@/components/layout/nav-data'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/lib/firebase/auth'
import ProfileModal from '@/components/profile/ProfileModal'
import { getAuthToken } from '@/lib/auth/token'

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
        const token = await getAuthToken(user)
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
    <div className="sticky top-0 z-50 w-full glass-panel border-b border-glass-border">
      <header className="layout-container flex h-16 items-center justify-between px-6 lg:px-10 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="relative size-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <Sparkles className="relative text-white z-10 w-5 h-5" />
            </div>
            <h2 className="text-white text-xl font-bold tracking-tight group-hover:text-primary transition-colors">ARMYVERSE</h2>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                href={path}
                className={`text-sm font-medium transition-colors ${
                  isActive(path) ? 'text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Auth / Profile */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
               <ProfileModal trigger={
                  <div 
                    className="size-10 rounded-full bg-cover bg-center border-2 border-primary/30 cursor-pointer hover:border-primary transition-colors bg-gray-700 flex items-center justify-center overflow-hidden" 
                    style={{ backgroundImage: user.photoURL ? `url('${user.photoURL}')` : undefined }}
                  >
                    {!user.photoURL && <span className="text-white font-bold">{profileName?.charAt(0) || 'A'}</span>}
                  </div>
               } />
            </div>
          ) : (
             <Link
                href="/auth/signin"
                className="h-10 px-4 rounded-full bg-primary hover:bg-primary-dark text-white text-sm font-bold flex items-center transition-colors"
              >
                Sign In
              </Link>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="size-10 flex items-center justify-center text-white"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-glass-border absolute w-full left-0 top-16 p-4 flex flex-col gap-4">
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              href={path}
              onClick={() => setIsOpen(false)}
              className={`text-sm font-medium p-2 rounded-xl transition-colors ${
                isActive(path) ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}
           {isAuthenticated && user && (
              <button
                onClick={handleSignOut}
                className="text-sm font-medium p-2 rounded-xl text-red-400 hover:bg-white/5 text-left"
              >
                Sign Out
              </button>
           )}
        </div>
      )}
    </div>
  )
}