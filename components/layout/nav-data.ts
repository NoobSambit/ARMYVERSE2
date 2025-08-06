import { Heart, BarChart3, Music, BookOpen, User } from 'lucide-react'

export const navItems = [
  { path: '/', label: 'Home', icon: Heart },
  { path: '/dashboard', label: 'Dashboard', icon: User },
  { path: '/stats', label: 'Stats', icon: BarChart3 },
  { path: '/playlist-hub', label: 'Playlists', icon: Music },
  { path: '/blog', label: 'Blog', icon: BookOpen },
]