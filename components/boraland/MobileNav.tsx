'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/boraland' && pathname === '/boraland') return true
    if (path !== '/boraland' && pathname.startsWith(path)) return true
    return false
  }

  const navItems = [
    { label: 'Home', icon: 'home', path: '/boraland' },
    { label: 'Quests', icon: 'assignment_turned_in', path: '/boraland/quests' },
    { label: 'Inventory', icon: 'inventory_2', path: '/boraland/inventory' },
    { label: 'Rankings', icon: 'trophy', path: '/boraland/leaderboard' },
    { label: 'Mastery', icon: 'military_tech', path: '/boraland/mastery' },
  ]

  return (
    <nav data-tour="mobile-nav" className="fixed bottom-0 left-0 right-0 z-[60] bg-[#0F0B1E]/95 backdrop-blur-xl border-t border-white/10 pb-safe lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-around p-2 safe-area-inset-bottom">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            data-tour={`mobile-nav-${item.label.toLowerCase()}`}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-full ${isActive(item.path)
                ? 'text-bora-primary bg-bora-primary/10'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <span className={`material-symbols-outlined text-2xl ${isActive(item.path) ? 'fill-1' : ''}`}>
              {item.icon}
            </span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
