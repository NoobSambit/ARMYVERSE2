'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, LogOut } from 'lucide-react'
import { navItems } from '@/components/layout/nav-data'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/lib/firebase/auth'
import ProfileCard from '@/components/profile/ProfileCard'
import { onSnapshot } from 'firebase/firestore'
import { getProfileRef } from '@/lib/firebase/profile'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()
  const [profileName, setProfileName] = useState<string | null>(null)

  // Live subscribe to the user's profile doc so Navbar reflects updates instantly
  useEffect(() => {
    if (!user) {
      setProfileName(null)
      return
    }
    const ref = getProfileRef(user.uid)
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as { displayName?: string }
        setProfileName(data.displayName ?? null)
      } else {
        setProfileName(null)
      }
    })
    return () => unsubscribe()
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
    <nav className="bg-[#1a082a]/90 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
              {React.createElement(navItems[0].icon, { className: "w-6 h-6 text-white" })}
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent">
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
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 relative
                  ${isActive(path)
                    ? 'text-purple-400 bg-purple-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {isActive(path) && (
                  <span
                    className="absolute left-0 right-0 -bottom-1 h-1 rounded-b bg-gradient-to-r from-purple-500 to-purple-600"
                    aria-hidden="true"
                  />
                )}
              </Link>
            ))}
            
            {/* Auth Buttons */}
            <div className="ml-4 flex items-center space-x-2">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-2">
                  <ProfileCard trigger={
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
                <div className="flex items-center space-x-2">
                  <Link
                    href="/auth/signin"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </div>
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
        <div className="md:hidden bg-[#1a082a]/95 backdrop-blur-md border-t border-purple-500/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                href={path}
                onClick={() => setIsOpen(false)}
                aria-current={isActive(path) ? 'page' : undefined}
                className={`flex px-3 py-2 rounded-md text-base font-medium transition-all duration-300 items-center space-x-2 relative
                  ${isActive(path)
                    ? 'text-purple-400 bg-purple-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {isActive(path) && (
                  <span
                    className="absolute left-0 right-0 -bottom-1 h-1 rounded-b bg-gradient-to-r from-purple-500 to-purple-600"
                    aria-hidden="true"
                  />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}