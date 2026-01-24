'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Music, Clock, Trophy, Play } from 'lucide-react'

interface UserData {
  name: string
  realname: string
  url: string
  image: string
  playcount: number
  registered: Date
  accountAge: string
}

interface OverviewData {
  totalTracks: number
  totalArtists: number
  totalListeningTime: number
  btsPlays: number
  btsPercentage: number
  accountAge: string
}

interface UserProfileProps {
  user: UserData
  overview: OverviewData
  loading?: boolean
}

export default function UserProfile({ user, overview, loading = false }: UserProfileProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  if (loading) {
    return (
      <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/5 animate-pulse">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gray-800 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-8 bg-gray-800 rounded w-48"></div>
            <div className="h-4 bg-gray-800 rounded w-24"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-[#1A103C]/40 backdrop-blur-2xl rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-10 border border-white/5 relative overflow-hidden group"
    >
      {/* Background Gradient Blob */}
      <div className="absolute -top-24 -right-24 w-64 md:w-96 h-64 md:h-96 bg-purple-600/20 rounded-full blur-3xl group-hover:bg-purple-600/30 transition-colors duration-700 pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-8 lg:gap-12 relative z-10">

        {/* Profile Info */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left shrink-0 w-full lg:w-auto">
          <div className="relative mb-3 md:mb-4">
             <motion.div
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
               className="p-1 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"
             >
                <img
                  src={user.image || 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=150&h=150'}
                  alt={user.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full object-cover border-3 md:border-4 border-[#0F0720]"
                />
             </motion.div>
          </div>

          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1">{user.name}</h2>
          <p className="text-gray-400 text-xs md:text-sm mt-2 md:mt-3 flex items-center gap-1.5 md:gap-2">
             <Calendar className="w-3 h-3" />
             Joined {new Date(user.registered).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4 w-full">
           <StatCard
             icon={Music}
             label="Scrobbles"
             value={formatNumber(user.playcount)}
             color="purple"
             delay={0.2}
           />
           <StatCard
             icon={Trophy}
             label="Top Artist"
             value="BTS"
             subValue={`${overview.btsPercentage}%`}
             color="pink"
             delay={0.3}
           />
           <StatCard
             icon={Clock}
             label="Minutes"
             value={formatNumber(Math.round(overview.totalListeningTime * 60))}
             color="blue"
             delay={0.4}
           />
           <StatCard
             icon={Play}
             label="Tracks"
             value={formatNumber(overview.totalTracks)}
             color="green"
             delay={0.5}
           />
        </div>
      </div>
    </motion.div>
  )
}

function StatCard({ icon: Icon, label, value, subValue, color, delay }: { icon: any, label: string, value: string, subValue?: string, color: 'purple' | 'pink' | 'blue' | 'green', delay: number }) {
  const colors = {
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    pink: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
  }

  const iconColors = {
    purple: 'text-purple-400',
    pink: 'text-pink-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
      className={`flex flex-col items-center justify-center p-3 md:p-4 lg:p-6 rounded-xl md:rounded-2xl border ${colors[color]} backdrop-blur-md hover:bg-opacity-20 transition-all`}
    >
      <Icon className={`w-5 h-5 md:w-6 md:h-6 mb-2 md:mb-3 ${iconColors[color]}`} />
      <span className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-0.5 md:mb-1">{value}</span>
      <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">{label}</span>
      {subValue && (
        <span className={`text-[10px] md:text-xs font-bold mt-0.5 md:mt-1 ${iconColors[color]}`}>{subValue}</span>
      )}
    </motion.div>
  )
}
