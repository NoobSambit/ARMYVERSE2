'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */

import React from 'react'
import Image from 'next/image'
import { MapPin, Mail, Activity, Lock, Twitter, Instagram, Youtube, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { getPublicProfile, isFieldVisible, getDefaultProfile } from '@/lib/utils/profile'
import { getBackgroundStyles, type AnyBackgroundStyleId } from './backgroundStyles'

const DEFAULT_PERSONALIZATION = getDefaultProfile().personalization

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max)

const withAlpha = (hex: string, alpha: number) => {
  const normalized = hex?.replace('#', '')
  if (!normalized || normalized.length !== 6) return hex
  const alphaValue = Math.round(clamp(alpha, 0, 1) * 255)
  const alphaHex = alphaValue.toString(16).padStart(2, '0')
  return `#${normalized}${alphaHex}`
}

interface PublicProfileShape {
  displayName?: string
  handle?: string
  pronouns?: string
  bio?: string
  avatarUrl?: string
  bannerUrl?: string
  bias?: string[]
  biasWrecker?: string
  favoriteEra?: string
  armySinceYear?: number
  topSong?: { name: string; artist: string } | null
  topAlbum?: { name: string; artist: string } | null
  location?: string
  socials?: Record<string, unknown>
  stats?: { totalPlaylists?: number; totalLikes?: number; totalSaves?: number }
  privacy?: unknown
  personalization?: {
    accentColor?: string
    themeIntensity?: number
    backgroundStyle: AnyBackgroundStyleId
    badgeStyle: 'minimal' | 'collectible'
  }
}

interface ProfilePreviewProps {
  profile: PublicProfileShape
}

export default function ProfilePreview({ profile }: ProfilePreviewProps) {
  const isPrivate = (profile?.privacy as any)?.visibility === 'private'
  const publicProfile = isPrivate ? profile : getPublicProfile(profile)
  const originalPrivacy = profile?.privacy

  const accentColor = profile?.personalization?.accentColor || DEFAULT_PERSONALIZATION.accentColor
  const themeIntensity = profile?.personalization?.themeIntensity ?? DEFAULT_PERSONALIZATION.themeIntensity
  const backgroundStyle = (profile?.personalization?.backgroundStyle || DEFAULT_PERSONALIZATION.backgroundStyle) as AnyBackgroundStyleId
  
  const intensityFactor = clamp(themeIntensity / 100)
  const accentSoft = withAlpha(accentColor, 0.1 + intensityFactor * 0.2)
  const accentText = accentColor

  // Get performance-optimized background styles
  const backgroundStyles = getBackgroundStyles(accentColor, intensityFactor, withAlpha)
  const currentBackgroundStyle = backgroundStyles[backgroundStyle] || backgroundStyles[DEFAULT_PERSONALIZATION.backgroundStyle]
  
  // Debug: Log if background style is missing
  if (!currentBackgroundStyle && process.env.NODE_ENV === 'development') {
    console.warn('Background style not found:', backgroundStyle, 'Available:', Object.keys(backgroundStyles))
  }

  const formatDate = (year: number) => {
    if (!year) return ''
    return `${year} ARMY`
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="w-3 h-3" />
      case 'instagram': return <Instagram className="w-3 h-3" />
      case 'youtube': return <Youtube className="w-3 h-3" />
      default: return <Globe className="w-3 h-3" />
    }
  }

  const getSocialUrl = (platform: string, handle: string) => {
    if (!handle) return ''
    switch (platform) {
      case 'twitter': return `https://twitter.com/${handle.replace('@', '')}`
      case 'instagram': return `https://instagram.com/${handle.replace('@', '')}`
      case 'youtube': return `https://youtube.com/@${handle}`
      default: return handle.startsWith('http') ? handle : `https://${handle}`
    }
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
        className="w-full max-w-sm rounded-[2rem] overflow-hidden relative shadow-2xl"
        style={{
          boxShadow: `0 20px 40px -10px ${withAlpha(accentColor, 0.15)}`,
          border: `1px solid ${withAlpha(accentColor, 0.1)}`,
          ...(currentBackgroundStyle || { background: '#151518' })
        }}
      >
        {/* Banner Area */}
        <div className="h-32 relative w-full overflow-hidden rounded-t-[2rem]">
          {publicProfile.bannerUrl ? (
            <Image
              src={publicProfile.bannerUrl}
              alt="Banner"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full" />
          )}
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6 relative"
          style={{ 
            background: publicProfile.bannerUrl ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          {/* Avatar */}
          <div className="relative -mt-12 mb-4 flex justify-between items-end">
            <div 
              className="w-24 h-24 rounded-full p-1 relative z-10 bg-black/40 backdrop-blur-md"
            >
              <div className="w-full h-full rounded-full overflow-hidden relative border-2 border-white/10">
                <Image
                  src={publicProfile.avatarUrl || '/avatar-placeholder.svg'}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Online Status Dot */}
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
            </div>

            <div className="flex gap-2 mb-1">
              <button 
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 transition-colors border border-white/5"
                title="Message (Preview)"
              >
                <Mail className="w-4 h-4" />
              </button>
              <button 
                className="px-6 py-1.5 rounded-full text-sm font-semibold text-white transition-colors shadow-lg shadow-purple-900/20"
                style={{ backgroundColor: accentColor }}
              >
                Follow
              </button>
            </div>
          </div>

          {/* Name & Handle */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white leading-tight drop-shadow-sm">
              {publicProfile.displayName || 'ARMY Member'}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
              <span>{publicProfile.handle ? `@${publicProfile.handle}` : '@username'}</span>
              <span className="w-1 h-1 rounded-full bg-gray-500" />
              <span>{publicProfile.pronouns || 'They/Them'}</span>
            </div>
          </div>

          {/* Bio */}
          {publicProfile.bio && (
            <p className="text-sm text-gray-200 leading-relaxed mb-4 line-clamp-3 font-medium">
              {publicProfile.bio}
            </p>
          )}

          {/* Private Profile Notice */}
          {isPrivate && (
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 mb-6">
              <Lock className="w-5 h-5 text-gray-400" />
              <p className="text-sm text-gray-400">This account is private</p>
            </div>
          )}

          {/* Tags (Bias, Year) */}
          {!isPrivate && (
            <div className="flex flex-wrap gap-2 mb-6">
              {/* Bias Badge */}
              {isFieldVisible('bias', originalPrivacy) && publicProfile.bias && publicProfile.bias.length > 0 && (
                <span 
                  className="px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm"
                  style={{ backgroundColor: accentSoft, color: accentText }}
                >
                  {publicProfile.bias[0]} BIAS
                </span>
              )}
              
              {/* ARMY Year Badge */}
              {publicProfile.armySinceYear && (
                <span 
                  className="px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-black/40 text-gray-300 border border-white/10"
                >
                  {formatDate(publicProfile.armySinceYear)}
                </span>
              )}
            </div>
          )}

          {/* Stats Row */}
          {!isPrivate && isFieldVisible('stats', originalPrivacy) && (
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-white/10 mb-6">
              <div className="text-center">
                <p className="text-lg font-bold text-white drop-shadow-sm">{publicProfile.stats?.totalPlaylists || 0}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Playlists</p>
              </div>
              <div className="text-center border-l border-white/10">
                <p className="text-lg font-bold text-white drop-shadow-sm">{publicProfile.stats?.totalLikes || 0}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Likes</p>
              </div>
              <div className="text-center border-l border-white/10">
                <div className="flex items-center justify-center gap-1">
                   <Activity className="w-3 h-3 text-yellow-500" />
                   <span className="text-lg font-bold text-white drop-shadow-sm">42</span>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Activity</p>
              </div>
            </div>
          )}

          {/* Listening To Widget */}
          {!isPrivate && (publicProfile.topSong || publicProfile.topAlbum) && (
             <div 
              className="p-3 rounded-2xl flex items-center gap-3 relative overflow-hidden group cursor-default backdrop-blur-md"
              style={{ backgroundColor: withAlpha(accentColor, 0.1), border: `1px solid ${withAlpha(accentColor, 0.2)}` }}
            >
               {/* Animated EQ Bars (Mock) */}
               <div className="flex gap-0.5 items-end h-4">
                  <motion.div 
                    animate={{ height: [4, 12, 6, 14, 4] }} 
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="w-1 bg-green-500 rounded-full" 
                  />
                  <motion.div 
                    animate={{ height: [10, 5, 12, 6, 10] }} 
                    transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
                    className="w-1 bg-green-500 rounded-full" 
                  />
                  <motion.div 
                    animate={{ height: [6, 14, 4, 12, 6] }} 
                    transition={{ repeat: Infinity, duration: 1.3, ease: "linear" }}
                    className="w-1 bg-green-500 rounded-full" 
                  />
               </div>

               <div className="flex-1 min-w-0 z-10">
                  <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-0.5">Listening To</p>
                  <p className="text-sm font-bold text-white truncate shadow-black drop-shadow-sm">
                    {publicProfile.topSong?.name || publicProfile.topAlbum?.name || 'Nothing playing'}
                  </p>
                  <p className="text-xs text-gray-300 truncate">
                     {publicProfile.topSong?.artist || publicProfile.topAlbum?.artist || ''}
                  </p>
               </div>
             </div>
          )}

          {/* Social Links (if no song playing or extra space needed) */}
          {!isPrivate && isFieldVisible('socials', originalPrivacy) && publicProfile.socials && Object.keys(publicProfile.socials).length > 0 && !publicProfile.topSong && (
            <div className="flex justify-center gap-4 mt-4">
              {Object.entries(publicProfile.socials).map(([platform, handle]) => {
                if (!handle || platform === 'visibility') return null
                const url = getSocialUrl(platform, handle as string)
                if (!url) return null
                
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {getSocialIcon(platform)}
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
