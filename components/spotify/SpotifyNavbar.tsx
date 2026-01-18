'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { label: 'Overview', path: '/spotify', id: 'overview' },
  { label: 'BTS', path: '/spotify/bts', id: 'bts' },
  { label: 'RM', path: '/spotify/rm', id: 'rm' },
  { label: 'Jin', path: '/spotify/jin', id: 'jin' },
  { label: 'Suga', path: '/spotify/suga', id: 'suga' },
  { label: 'Agust D', path: '/spotify/agust-d', id: 'agust-d' },
  { label: 'J-Hope', path: '/spotify/j-hope', id: 'j-hope' },
  { label: 'Jimin', path: '/spotify/jimin', id: 'jimin' },
  { label: 'V', path: '/spotify/v', id: 'v' },
  { label: 'Jungkook', path: '/spotify/jungkook', id: 'jungkook' },
]

export default function SpotifyNavbar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/spotify' && pathname === '/spotify') return true
    if (path !== '/spotify' && pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="sticky top-0 z-50 bg-[#0E0C15]/80 backdrop-blur-xl border-b border-white/5 mb-8">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex items-center gap-1 overflow-x-auto py-4 scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.id}
                href={item.path}
                className="relative px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/10 rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={`relative z-10 ${active ? 'text-white' : 'text-white/60 hover:text-white/90'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
