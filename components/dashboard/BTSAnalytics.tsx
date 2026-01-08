'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Star, ExternalLink, PauseCircle, Crown } from 'lucide-react'
import { BTSAnalytics as BTSAnalyticsType } from '@/lib/spotify/dashboard'

interface BTSAnalyticsProps {
  btsAnalytics: BTSAnalyticsType
  loading?: boolean
}

// Helper to extract image URL from Last.fm array or string
const getImageUrl = (image: any, fallback: string = ''): string => {
  if (!image) return fallback
  if (typeof image === 'string') return image
  if (Array.isArray(image)) {
    // Try to get extralarge, then large, then medium
    const sizes = ['extralarge', 'large', 'medium', 'small']
    for (const size of sizes) {
      const img = image.find((i: any) => i.size === size)
      if (img && img['#text']) return img['#text']
    }
    // Fallback to last item (usually largest) or first
    const last = image[image.length - 1]
    if (last && last['#text']) return last['#text']
  }
  return fallback
}

export default function BTSAnalytics({ btsAnalytics, loading = false }: BTSAnalyticsProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'members' | 'tracks'>('overview')

  const radarData = btsAnalytics.memberPreference.map((member) => ({
    subject: member.member,
    A: member.plays,
    fullMark: Math.max(...btsAnalytics.memberPreference.map(m => m.plays))
  }))

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/20 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/5 animate-pulse min-h-[300px] md:min-h-[400px]"
      >
      </motion.div>
    )
  }

  // Safely get top track image
  const topTrackImage = getImageUrl(
    btsAnalytics.btsTracks[0]?.album?.images?.[0]?.url,
    'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=150&h=150'
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-black/20 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 border border-white/5 relative overflow-hidden"
    >
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-50" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-3 md:gap-4">
        <div className="flex items-center gap-2.5 md:gap-3">
          <div className="bg-white/10 p-1.5 md:p-2 rounded-xl">
             <PauseCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base md:text-lg lg:text-xl font-bold text-white">BTS Analytics</h3>
            <p className="text-[10px] md:text-xs text-gray-400">Deep dive into your fandom</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 self-start md:self-auto overflow-x-auto max-w-full">
          {['overview', 'members', 'tracks'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-3 md:px-4 py-1.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 capitalize whitespace-nowrap ${
                viewMode === mode
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 md:space-y-6 lg:space-y-8"
          >
            {/* Super Fan Status Banner */}
            <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/20 rounded-xl md:rounded-2xl p-4 md:p-6 flex items-start gap-3 md:gap-4">
               <div className="bg-purple-500/20 p-2 rounded-xl shrink-0">
                 <Star className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
               </div>
               <div>
                 <h4 className="text-white font-bold mb-1 text-sm md:text-base">Super Fan Status</h4>
                 <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                   You&apos;ve listened to BTS for <span className="font-bold text-white">{btsAnalytics.totalBTSPlays} plays</span>.
                   That&apos;s more than <span className="text-purple-400 font-bold">99%</span> of users!
                 </p>
               </div>
            </div>

            {/* Member Breakdown (Progress Bars) */}
            <div>
               <h4 className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 md:mb-4">Member Breakdown</h4>
               <div className="space-y-3 md:space-y-4">
                 {btsAnalytics.memberPreference.slice(0, 4).map((member, idx) => (
                   <div key={member.member} className="space-y-1.5 md:space-y-2">
                     <div className="flex justify-between text-xs md:text-sm">
                       <span className="text-white font-medium">{member.member}</span>
                       <span className="text-gray-400">{member.plays} Streams</span>
                     </div>
                     <div className="h-1.5 md:h-2 bg-gray-800 rounded-full overflow-hidden">
                       <motion.div
                         initial={{ width: 0 }}
                         animate={{ width: `${(member.plays / Math.max(...btsAnalytics.memberPreference.map(m => m.plays))) * 100}%` }}
                         transition={{ duration: 1, delay: idx * 0.1 }}
                         className={`h-full rounded-full ${
                           idx === 0 ? 'bg-purple-500' :
                           idx === 1 ? 'bg-pink-500' :
                           idx === 2 ? 'bg-blue-500' : 'bg-green-500'
                         }`}
                       />
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                 {btsAnalytics.btsTracks.length > 0 ? (
                   <div className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/5 flex items-center gap-3 md:gap-4">
                      <img
                        src={topTrackImage}
                        alt={btsAnalytics.btsTracks[0]?.name}
                        className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=150&h=150'
                        }}
                      />
                      <div className="flex-1 min-w-0">
                         <p className="text-[10px] md:text-xs text-purple-400 font-bold uppercase mb-1">Top Track</p>
                         <p className="text-white font-bold text-sm md:text-base truncate">{btsAnalytics.btsTracks[0]?.name || 'N/A'}</p>
                         <p className="text-gray-400 text-xs md:text-sm truncate">{btsAnalytics.btsTracks[0]?.album?.name || 'Unknown Album'}</p>
                      </div>
                   </div>
                 ) : (
                   <div className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/5 flex items-center gap-4 justify-center">
                      <p className="text-gray-500 text-xs md:text-sm">No top track data available</p>
                   </div>
                 )}

                 <div className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/5 flex items-center gap-3 md:gap-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <Crown className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-[10px] md:text-xs text-purple-400 font-bold uppercase mb-1">Top Album</p>
                       <p className="text-white font-bold text-sm md:text-base truncate">{btsAnalytics.favoriteBTSAlbum || 'N/A'}</p>
                    </div>
                 </div>
            </div>

          </motion.div>
        )}

        {viewMode === 'members' && (
          <motion.div
            key="members"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 md:space-y-6"
          >
            <div className="h-56 md:h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <PolarRadiusAxis stroke="#374151" angle={30} domain={[0, 'auto']} tick={false} />
                  <Radar name="Plays" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F0720',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#F9FAFB',
                      fontSize: '12px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {viewMode === 'tracks' && (
          <motion.div
             key="tracks"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
          >
             <div className="space-y-2 max-h-[50vh] md:max-h-[400px] overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
               {btsAnalytics.btsTracks.map((track, i) => {
                  const trackImage = getImageUrl(
                    track.album?.images?.[0]?.url,
                    'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=40&h=40'
                  )

                  return (
                  <div key={track.id || i} className="flex items-center gap-2.5 md:gap-4 p-2.5 md:p-3 hover:bg-white/5 rounded-xl transition-colors group">
                     <span className="text-gray-500 font-mono w-4 shrink-0 text-xs md:text-sm">{i + 1}</span>
                     <img
                       src={trackImage}
                       alt={track.name}
                       className="w-9 h-9 md:w-10 md:h-10 rounded-xl object-cover shrink-0"
                       onError={(e) => {
                         e.currentTarget.src = 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?auto=compress&cs=tinysrgb&w=40&h=40'
                       }}
                     />
                     <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-xs md:text-sm truncate group-hover:text-purple-400 transition-colors">{track.name}</p>
                        <p className="text-gray-500 text-[10px] md:text-xs truncate">{track.album?.name || 'Unknown Album'}</p>
                     </div>
                     <button
                       onClick={() => track.external_urls?.spotify && window.open(track.external_urls.spotify, '_blank')}
                       className="text-gray-500 hover:text-white shrink-0 p-1"
                     >
                        <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                     </button>
                  </div>
               )})}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
