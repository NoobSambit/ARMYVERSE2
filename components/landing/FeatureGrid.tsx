'use client'

/* Existing imports */
/* Existing imports */
import { BarChart3, Gamepad2, Music2, ListMusic, BarChart, User, ArrowRight, Info, Youtube, X, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import FeatureInfoModal from '@/components/ui/FeatureInfoModal'
import { motion, AnimatePresence } from 'framer-motion'

export default function FeatureGrid() {
  const [modalOpen, setModalOpen] = useState(false)
  const [streamingModalOpen, setStreamingModalOpen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState<any>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  const features = [
    {
      title: 'ARMY Blog',
      description: 'Stories, guides, and updates for ARMY.',
      longDescription: 'Your central hub for everything BTS. Read deep dives, streaming guides, community stories, and the latest updates from the purple universe.',
      icon: BookOpen,
      color: 'from-pink-500 to-rose-600',
      accentColor: '#ec4899',
      href: '/blog',
      features: [
        'In-depth articles and fan theories',
        'Comprehensive streaming guides',
        'Community spotlights and stories',
        'Archive of major events and milestones',
        'Tutorials for new ARMYs'
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
      href: '/spotify', // Default, we will intercept
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

  const handleCardClick = (e: React.MouseEvent, feature: any) => {
    if (feature.title === 'Streaming Stats') {
      e.preventDefault()
      setStreamingModalOpen(true)
    }
  }

  // Auto-scroll functionality
  useEffect(() => {
    const startAutoScroll = () => {
      autoScrollIntervalRef.current = setInterval(() => {
        if (!isPaused && scrollContainerRef.current) {
          setCurrentIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % features.length

            // Scroll to the next card
            const container = scrollContainerRef.current
            if (container) {
              const cardWidth = container.scrollWidth / features.length
              container.scrollTo({
                left: cardWidth * nextIndex,
                behavior: 'smooth'
              })
            }

            return nextIndex
          })
        }
      }, 2000) // 2 seconds
    }

    startAutoScroll()

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
      }
    }
  }, [isPaused, features.length])

  // Pause auto-scroll on user interaction
  const handleTouchStart = () => {
    setIsPaused(true)
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current)
    }
  }

  const handleTouchEnd = () => {
    // Resume after 3 seconds of no interaction
    setTimeout(() => {
      setIsPaused(false)
    }, 3000)
  }

  // Update current index when user manually scrolls
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const cardWidth = container.scrollWidth / features.length
      const newIndex = Math.round(container.scrollLeft / cardWidth)
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex)
      }
    }
  }

  return (
    <>
      {/* Mobile: Horizontal Scrolling Carousel */}
      <div className="md:hidden col-span-1 md:col-span-2 lg:col-span-3 md:row-span-2">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-3 px-3"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onScroll={handleScroll}
        >
          {features.map((feature, idx) => {
            const IconComponent = feature.icon
            return (
              <Link
                href={feature.href}
                key={idx}
                onClick={(e) => handleCardClick(e, feature)}
                className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between group cursor-pointer relative overflow-hidden min-h-[180px] w-[85vw] max-w-[340px] shrink-0 snap-center"
              >
                {feature.overlay && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}

                {/* Header with icon and info button */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`size-10 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shrink-0`}>
                    <IconComponent className="text-white w-6 h-6" />
                  </div>

                  {/* Info button */}
                  <button
                    onClick={(e) => handleInfoClick(e, feature)}
                    className="p-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 hover:scale-110 z-20 shrink-0"
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
        {/* Scroll indicator dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {features.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex
                ? 'bg-primary w-4'
                : 'bg-white/20'
                }`}
            ></div>
          ))}
        </div>
      </div>

      {/* Desktop: Grid Layout */}
      <div className="hidden md:grid md:col-span-2 lg:col-span-3 md:row-span-2 grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, idx) => {
          const IconComponent = feature.icon
          return (
            <Link
              href={feature.href}
              key={idx}
              onClick={(e) => handleCardClick(e, feature)}
              className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between group cursor-pointer h-full relative overflow-hidden min-h-[160px]"
            >
              {feature.overlay && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}

              {/* Header with icon and info button */}
              <div className="flex items-start justify-between mb-4">
                <div className={`size-10 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shrink-0`}>
                  <IconComponent className="text-white w-6 h-6" />
                </div>

                {/* Info button */}
                <button
                  onClick={(e) => handleInfoClick(e, feature)}
                  className="p-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 hover:scale-110 z-20 shrink-0"
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

      {/* Streaming Stats Platform Selection Modal */}
      <AnimatePresence>
        {streamingModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStreamingModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto overflow-x-hidden flex items-center justify-center p-4 md:p-6"
            />
            <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-[#121212] border border-white/10 rounded-[28px] w-full max-w-lg shadow-2xl relative overflow-hidden pointer-events-auto"
              >
                {/* Decorative gradient */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />

                {/* Close button */}
                <button
                  onClick={() => setStreamingModalOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="p-8 text-center relative z-0">
                  <div className="size-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-900/20">
                    <BarChart className="text-white w-8 h-8" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">Streaming Stats</h3>
                  <p className="text-white/60 mb-8 max-w-sm mx-auto">
                    Track streaming performance across platforms. Which one would you like to view?
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                      href="/spotify"
                      className="group relative overflow-hidden rounded-2xl bg-[#1DB954] p-1 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-green-900/20"
                    >
                      <div className="relative h-full px-6 py-5 flex flex-col items-center justify-center gap-3 bg-[#1DB954] group-hover:bg-[#1ed760] transition-colors rounded-xl">
                        <Music2 className="w-8 h-8 text-black" />
                        <span className="font-bold text-black text-lg">Spotify</span>
                      </div>
                    </Link>

                    <Link
                      href="/youtube"
                      className="group relative overflow-hidden rounded-2xl bg-[#FF0000] p-1 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-red-900/20"
                    >
                      <div className="relative h-full px-6 py-5 flex flex-col items-center justify-center gap-3 bg-[#FF0000] group-hover:bg-[#ff1a1a] transition-colors rounded-xl">
                        <Youtube className="w-8 h-8 text-white" />
                        <span className="font-bold text-white text-lg">YouTube</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}