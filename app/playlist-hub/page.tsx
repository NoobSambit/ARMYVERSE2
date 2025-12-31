'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Search,
  Plus,
  Brain,
  Users,
  Palette,
  Target,
  TrendingUp,
  Shield,
  CheckCircle,
  Music
} from 'lucide-react'
import Link from 'next/link'
import SpotifyAuth from '@/components/auth/SpotifyAuth'
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth'

interface PlaylistFeature {
  icon: React.ElementType
  title: string
  description: string
  color: string
}

export default function PlaylistHub() {
  const { isAuthenticated } = useSpotifyAuth()

  const handleAuthenticated = () => {
    // This will be called when user successfully authenticates
    // The useSpotifyAuth hook will automatically update the status
  }

  const aiFeatures: PlaylistFeature[] = [
    {
      icon: Brain,
      title: "AI Generation",
      description: "Smart playlists that understand your mood and preferences",
      color: "text-purple-400"
    },
    {
      icon: Target,
      title: "Mood Based",
      description: "Curated for specific vibes, from energetic to melancholic",
      color: "text-blue-400"
    },
    {
      icon: Users,
      title: "Member Focus",
      description: "Playlists highlighting specific members or units",
      color: "text-green-400"
    },
    {
      icon: TrendingUp,
      title: "Era Selection",
      description: "Journey through specific albums and time periods",
      color: "text-orange-400"
    }
  ]

  const customFeatures: PlaylistFeature[] = [
    {
      icon: Search,
      title: "Deep Search",
      description: "Filter through the complete discography",
      color: "text-indigo-400"
    },
    {
      icon: Plus,
      title: "Manual Curation",
      description: "Hand-pick tracks for your perfect mix",
      color: "text-pink-400"
    },
    {
      icon: Palette,
      title: "Organization",
      description: "Sort by album, year, or custom criteria",
      color: "text-teal-400"
    },
    {
      icon: Shield,
      title: "Quality Audio",
      description: "High-quality track metadata and info",
      color: "text-yellow-400"
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

  return (
    <div className="min-h-screen page-gradient relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              Playlist Hub
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
              Your command center for BTS sonic experiences
            </p>
          </motion.div>

          {/* Spotify Status - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex justify-center"
          >
            {!isAuthenticated ? (
              <div className="glass-effect rounded-2xl p-6 border border-white/10 max-w-sm w-full bg-black/40 backdrop-blur-xl">
                 <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                        <Music className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-white font-medium">Connect Spotify</h3>
                        <p className="text-xs text-gray-400">Sync your creations instantly</p>
                      </div>
                    </div>
                    <div className="w-full">
                       <SpotifyAuth onAuthSuccess={handleAuthenticated} />
                    </div>
                 </div>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Connected to Spotify</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Feature Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
           {/* AI Features */}
           <motion.div
             variants={containerVariants}
             initial="hidden"
             animate="visible"
             className="space-y-6"
           >
             <div className="flex items-center justify-between mb-4 px-2">
               <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                 <Sparkles className="w-6 h-6 text-purple-400" />
                 AI Powered
               </h2>
               <Link href="/ai-playlist">
                 <span className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors cursor-pointer">
                   Launch Generator &rarr;
                 </span>
               </Link>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {aiFeatures.map((feature, index) => {
                 const Icon = feature.icon
                 return (
                   <motion.div
                     key={index}
                     variants={itemVariants}
                     className="glass-effect p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 group"
                   >
                     <Icon className={`w-8 h-8 ${feature.color} mb-4 group-hover:scale-110 transition-transform`} />
                     <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                     <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                   </motion.div>
                 )
               })}
             </div>
           </motion.div>

           {/* Manual Tools */}
           <motion.div
             variants={containerVariants}
             initial="hidden"
             animate="visible"
             className="space-y-6"
           >
             <div className="flex items-center justify-between mb-4 px-2">
               <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                 <Music className="w-6 h-6 text-pink-400" />
                 Manual Creation
               </h2>
               <Link href="/create-playlist">
                 <span className="text-sm font-medium text-pink-400 hover:text-pink-300 transition-colors cursor-pointer">
                   Open Creator &rarr;
                 </span>
               </Link>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {customFeatures.map((feature, index) => {
                 const Icon = feature.icon
                 return (
                   <motion.div
                     key={index}
                     variants={itemVariants}
                     className="glass-effect p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 group"
                   >
                     <Icon className={`w-8 h-8 ${feature.color} mb-4 group-hover:scale-110 transition-transform`} />
                     <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                     <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                   </motion.div>
                 )
               })}
             </div>
           </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="glass-effect rounded-3xl p-8 sm:p-12 border border-white/10 bg-black/40 backdrop-blur-xl max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Start Curating</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Choose your path to the perfect playlist.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/ai-playlist" className="w-full sm:w-auto">
                <button className="w-full bg-white text-black hover:bg-gray-100 font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Generator
                </button>
              </Link>
              <Link href="/create-playlist" className="w-full sm:w-auto">
                <button className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-8 rounded-xl border border-white/10 transition-all duration-300 flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  Manual Creator
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}