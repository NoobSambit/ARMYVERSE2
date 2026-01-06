'use client'

import { BarChart3, Gamepad2, Music2, ListMusic, BarChart, User, ArrowRight, Info } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import FeatureInfoModal from '@/components/ui/FeatureInfoModal'

export default function FeatureGrid() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState<any>(null)

  const features = [
    {
      title: 'BTS + Solo Trends',
      description: 'Live charts across Spotify and YouTube.',
      longDescription: 'Stay updated with real-time trending data for BTS and solo artists across multiple platforms.',
      icon: BarChart3,
      color: 'from-pink-500 to-purple-600',
      accentColor: '#ec4899',
      href: '/trending',
      features: [
        'Live Spotify and YouTube streaming charts',
        'Track popularity trends for BTS group and individual members',
        'Compare performance across different platforms',
        'Historical data and trend analysis',
        'Real-time updates as new data comes in'
      ]
    },
    {
      title: 'AI Playlist',
      description: 'Instant mixes from your vibe or activity.',
      longDescription: 'Generate personalized playlists powered by AI based on your mood, activity, or listening preferences.',
      icon: Music2,
      color: 'from-purple-500 to-pink-600',
      accentColor: '#a855f7',
      href: '/ai-playlist',
      features: [
        'AI-powered playlist generation',
        'Customize by mood, genre, or activity',
        'Instant Spotify playlist creation',
        'Smart song recommendations',
        'One-click export to your Spotify account'
      ]
    },
    {
      title: 'Streaming Playlists',
      description: 'Goal-driven sets for comeback streaming.',
      longDescription: 'Create strategic playlists designed to maximize streaming impact during comebacks and special releases.',
      icon: ListMusic,
      color: 'from-green-500 to-teal-600',
      accentColor: '#10b981',
      href: '/create-playlist',
      features: [
        'Optimized playlist structure for streaming goals',
        'Comeback-focused song arrangements',
        'Goal tracking and progress monitoring',
        'Community streaming schedules',
        'Export directly to Spotify'
      ]
    },
    {
      title: 'Boraland (Games)',
      description: 'Quizzes, mastery, and weekly leaderboards.',
      longDescription: 'Test your ARMY knowledge and compete with others through quizzes, mastery challenges, and leaderboards.',
      icon: Gamepad2,
      color: 'from-blue-500 to-cyan-500',
      accentColor: '#3b82f6',
      href: '/boraland',
      overlay: true,
      features: [
        'Interactive quizzes about BTS and members',
        'Mastery system to track your progress',
        'Weekly leaderboards and rankings',
        'Earn badges and achievements',
        'Compete with ARMY worldwide',
        'Last.fm integration for streaming quests'
      ]
    },
    {
      title: 'Streaming Stats',
      description: 'Global performance snapshots and momentum.',
      longDescription: 'Comprehensive analytics showing global streaming performance, trends, and momentum across platforms.',
      icon: BarChart,
      color: 'from-orange-500 to-red-600',
      accentColor: '#f97316',
      href: '/spotify',
      features: [
        'Global streaming statistics',
        'Real-time performance tracking',
        'Momentum and trend indicators',
        'Cross-platform analytics',
        'Historical performance data',
        'Chart position tracking'
      ]
    },
    {
      title: 'Spotify Analytics',
      description: 'Your top artists, habits, and insights.',
      longDescription: 'Dive deep into your personal Spotify listening habits with detailed analytics and insights.',
      icon: User,
      color: 'from-indigo-500 to-purple-600',
      accentColor: '#6366f1',
      href: '/stats',
      features: [
        'Your top artists and tracks',
        'Listening habit analysis',
        'Personalized insights and trends',
        'Genre and mood breakdowns',
        'Time-based listening patterns',
        'Compare with global ARMY trends'
      ]
    }
  ]

  const handleInfoClick = (e: React.MouseEvent, feature: any) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedFeature(feature)
    setModalOpen(true)
  }

  return (
    <>
      <div className="md:col-span-2 lg:col-span-3 md:row-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, idx) => {
          const IconComponent = feature.icon
          return (
            <Link
              href={feature.href}
              key={idx}
              className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between group cursor-pointer h-full relative overflow-hidden"
            >
              {feature.overlay && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}

              {/* Header with icon and info button */}
              <div className="flex items-start justify-between mb-4">
                <div className={`size-10 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                  <IconComponent className="text-white w-6 h-6" />
                </div>

                {/* Info button */}
                <button
                  onClick={(e) => handleInfoClick(e, feature)}
                  className="p-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 hover:scale-110 z-20"
                  aria-label={`Learn more about ${feature.title}`}
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>

              <div className="relative z-10 flex-1">
                <h4 className="text-base font-bold text-white mb-1">{feature.title}</h4>
                <p className="text-sm text-gray-400 line-clamp-2">{feature.description}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <ArrowRight className="text-gray-500 group-hover:text-white transition-colors w-5 h-5" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Feature Info Modal */}
      {selectedFeature && (
        <FeatureInfoModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          details={{
            icon: selectedFeature.icon,
            title: selectedFeature.title,
            description: selectedFeature.description,
            longDescription: selectedFeature.longDescription,
            features: selectedFeature.features,
            accentColor: selectedFeature.accentColor
          }}
        />
      )}
    </>
  )
}