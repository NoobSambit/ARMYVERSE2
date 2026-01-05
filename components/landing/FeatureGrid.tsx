import { BarChart3, Gamepad2, Music2, ListMusic, BarChart, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function FeatureGrid() {
  const features = [
    {
      title: 'BTS + Solo Trends',
      description: 'Live charts across Spotify and YouTube.',
      icon: <BarChart3 className="text-white w-6 h-6" />,
      color: 'from-pink-500 to-purple-600',
      href: '/trending'
    },
    {
      title: 'AI Playlist',
      description: 'Instant mixes from your vibe or activity.',
      icon: <Music2 className="text-white w-6 h-6" />,
      color: 'from-purple-500 to-pink-600',
      href: '/ai-playlist'
    },
    {
      title: 'Streaming Playlists',
      description: 'Goal-driven sets for comeback streaming.',
      icon: <ListMusic className="text-white w-6 h-6" />,
      color: 'from-green-500 to-teal-600',
      href: '/create-playlist'
    },
    {
      title: 'Boraland (Games)',
      description: 'Quizzes, mastery, and weekly leaderboards.',
      icon: <Gamepad2 className="text-white w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      href: '/boraland',
      overlay: true
    },
    {
      title: 'Streaming Stats',
      description: 'Global performance snapshots and momentum.',
      icon: <BarChart className="text-white w-6 h-6" />,
      color: 'from-orange-500 to-red-600',
      href: '/spotify'
    },
    {
      title: 'Spotify Analytics',
      description: 'Your top artists, habits, and insights.',
      icon: <User className="text-white w-6 h-6" />,
      color: 'from-indigo-500 to-purple-600',
      href: '/stats'
    }
  ]

  return (
    <div className="md:col-span-2 lg:col-span-3 md:row-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map((feature, idx) => (
        <Link 
          href={feature.href} 
          key={idx}
          className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between group cursor-pointer h-full relative overflow-hidden"
        >
          {feature.overlay && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          )}
          <div className={`size-10 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
            {feature.icon}
          </div>
          <div className="relative z-10">
            <h4 className="text-base font-bold text-white mb-1">{feature.title}</h4>
            <p className="text-sm text-gray-400 line-clamp-2">{feature.description}</p>
          </div>
          <div className="mt-4 flex justify-end">
            <ArrowRight className="text-gray-500 group-hover:text-white transition-colors w-5 h-5" />
          </div>
        </Link>
      ))}
    </div>
  )
}