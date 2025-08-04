'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Music, 
  Search, 
  Plus, 
  Heart, 
  Brain, 
  Users, 
  Star,
  ArrowRight,
  Play,
  Zap,
  Palette,
  Target,
  TrendingUp,
  Shield,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import SpotifyAuth from '@/components/auth/SpotifyAuth'

interface PlaylistFeature {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}

export default function PlaylistHub() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const handleAuthenticated = (userId: string) => {
    setIsAuthenticated(true)
    setUserId(userId)
  }

  const aiFeatures: PlaylistFeature[] = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Generation",
      description: "Create playlists using advanced AI that understands your mood, preferences, and BTS favorites",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Mood-Based Creation",
      description: "Generate playlists based on specific moods like happy, sad, energetic, or relaxed",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Member-Focused",
      description: "Create playlists featuring specific BTS members or their solo work",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Era-Based Selection",
      description: "Generate playlists from specific BTS eras and albums",
      color: "from-orange-500 to-red-500"
    }
  ]

  const customFeatures: PlaylistFeature[] = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Advanced Search",
      description: "Search through the entire BTS discography with filters and sorting options",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Plus className="w-6 h-6" />,
      title: "Manual Curation",
      description: "Hand-pick your favorite tracks and create the perfect playlist",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Custom Organization",
      description: "Organize tracks by album, year, mood, or any criteria you prefer",
      color: "from-teal-500 to-cyan-500"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Quality Control",
      description: "Ensure every track meets your standards with detailed track information",
      color: "from-yellow-500 to-orange-500"
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950">
      {/* Header */}
      <motion.div 
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-700/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Main Header */}
            <motion.div 
              className="text-center mb-16"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Playlist Hub
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Create the perfect BTS playlist with AI assistance or manual curation. 
                Connect your Spotify account to save and sync your playlists.
              </motion.p>

              {/* Spotify Auth Section */}
              {!isAuthenticated ? (
                <motion.div
                  className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 max-w-md mx-auto"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="text-center mb-6">
                    <Heart className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Connect to Spotify
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Link your account to save playlists and access your library
                    </p>
                  </div>
                  <SpotifyAuth onAuthSuccess={() => handleAuthenticated('user-123')} />
                </motion.div>
              ) : (
                <motion.div
                  className="bg-green-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30 max-w-md mx-auto"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Connected to Spotify
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Your account is linked and ready to use
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* AI Features Section */}
          <motion.div
            className="mb-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-8 text-center"
              variants={itemVariants}
            >
              AI-Powered Features
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aiFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Manual Features Section */}
          <motion.div
            className="mb-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-8 text-center"
              variants={itemVariants}
            >
              Manual Curation Tools
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {customFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20"
              variants={itemVariants}
            >
              <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Create Your Perfect Playlist?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                Choose between AI-powered generation or manual curation to create the ultimate BTS playlist experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/ai-playlist">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 flex items-center"
                  >
                    <Brain className="w-5 h-5 mr-2" />
                    AI Playlist Generator
                  </motion.button>
                </Link>
                <Link href="/create-playlist">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black/50 hover:bg-black/70 text-white font-semibold py-3 px-8 rounded-full shadow-lg border-2 border-purple-400/30 hover:border-purple-300/50 transition-all duration-300 flex items-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Manual Playlist Creator
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}