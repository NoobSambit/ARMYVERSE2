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
  stats?: {
    totalPlaylists?: number;
    totalLikes?: number;
    totalSaves?: number;
    totalCards?: number;
    totalXp?: number;
    leaderboardRank?: number;
  }
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
  variant?: 'full' | 'sidebar'
}

export default function ProfilePreview({ profile, variant = 'full' }: ProfilePreviewProps) {
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
    if (handle.startsWith('http')) return handle

    switch (platform) {
      case 'twitter': return `https://twitter.com/${handle.replace('@', '')}`
      case 'instagram': return `https://instagram.com/${handle.replace('@', '')}`
      case 'youtube': return `https://youtube.com/@${handle}`
      default: return handle.startsWith('http') ? handle : `https://${handle}`
    }
  }

  const isSidebar = variant === 'sidebar'

  return (
    <div className={`${isSidebar ? 'w-full' : 'h-full flex flex-col items-center justify-center p-4'}`}>
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
          className={`w-full ${isSidebar ? 'max-w-none' : 'max-w-4xl'} rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden relative shadow-2xl`}
          style={{
            boxShadow: `0 20px 40px -10px ${withAlpha(accentColor, 0.15)}`,
            border: `1px solid ${withAlpha(accentColor, 0.1)}`,
            ...(currentBackgroundStyle || { background: '#151518' })
          }}
        >
          {/* Banner Area */}
          <div className="h-24 sm:h-28 md:h-32 relative w-full overflow-hidden rounded-t-[1.5rem] sm:rounded-t-[2rem]">
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
          <div className="px-4 pb-5 sm:px-5 sm:pb-5 md:px-6 md:pb-6 relative"
          >
            {/* Avatar */}
            <div className="relative -mt-10 sm:-mt-12 mb-4 flex justify-between items-end">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full p-1 relative z-10 bg-black/40 backdrop-blur-md"
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
                <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-black" />
              </div>

              <div className="flex gap-2 mb-1">
                {/* Removed Message/Follow buttons as requested */}
              </div>
            </div>

            {/* Name & Handle */}
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight drop-shadow-sm">
                {publicProfile.displayName || 'ARMY Member'}
              </h2>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 mt-0.5 sm:mt-1">
                <span>{publicProfile.handle ? `@${publicProfile.handle}` : '@username'}</span>
                <span className="w-1 h-1 rounded-full bg-gray-500" />
                <span>{publicProfile.pronouns || 'They/Them'}</span>
              </div>
            </div>

            {/* Bio */}
            {publicProfile.bio && (
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed mb-4 line-clamp-3 font-medium">
                {publicProfile.bio}
              </p>
            )}

            {/* Private Profile Notice */}
            {isPrivate && (
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5 mb-4 sm:mb-6">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <p className="text-xs sm:text-sm text-gray-400">This account is private</p>
              </div>
            )}

            {/* Tags (Bias, Wrecker, Era, Year) */}
            {!isPrivate && (
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                {/* Bias Badges */}
                {isFieldVisible('bias', originalPrivacy) && publicProfile.bias && publicProfile.bias.map((biasMember: string) => (
                  <span
                    key={biasMember}
                    className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wide uppercase shadow-sm border border-white/5"
                    style={{ backgroundColor: accentSoft, color: accentText }}
                  >
                    {biasMember} BIAS
                  </span>
                ))}

                {/* Bias Wrecker */}
                {isFieldVisible('bias', originalPrivacy) && publicProfile.biasWrecker && (
                  <span
                    className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wide uppercase bg-pink-500/10 text-pink-300 border border-pink-500/20"
                  >
                    {publicProfile.biasWrecker} WRECKER
                  </span>
                )}

                {/* Favorite Era */}
                {isFieldVisible('era', originalPrivacy) && publicProfile.favoriteEra && (
                  <span
                    className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wide uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20"
                  >
                    {publicProfile.favoriteEra} ERA
                  </span>
                )}

                {/* ARMY Year Badge */}
                {publicProfile.armySinceYear && (
                  <span
                    className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wide uppercase bg-black/40 text-gray-300 border border-white/10"
                  >
                    {formatDate(publicProfile.armySinceYear)}
                  </span>
                )}
              </div>
            )}

            {/* Boraland Stats Row */}
            {!isPrivate && isFieldVisible('stats', originalPrivacy) && (
              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 py-3 sm:py-4 border-t border-white/10 mb-4 sm:mb-6 bg-white/5 rounded-xl sm:rounded-2xl mx-0.5 sm:mx-1">
                <div className="text-center">
                  <p className="text-base sm:text-lg font-bold text-white drop-shadow-sm">{publicProfile.stats?.totalCards || 0}</p>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-bold">Total Cards</p>
                </div>
                <div className="text-center border-l border-white/10">
                  <p className="text-base sm:text-lg font-bold text-white drop-shadow-sm">
                    {publicProfile.stats?.totalXp ? Math.floor(publicProfile.stats.totalXp).toLocaleString() : 0}
                  </p>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-bold">Total XP</p>
                </div>
                <div className="text-center border-l border-white/10">
                  <div className="flex items-center justify-center gap-1">
                    <Activity className="w-3 h-3 text-yellow-500" />
                    <span className="text-base sm:text-lg font-bold text-white drop-shadow-sm">
                      {publicProfile.stats?.leaderboardRank && publicProfile.stats.leaderboardRank > 0
                        ? `#${publicProfile.stats.leaderboardRank}`
                        : '-'}
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-bold">Rank</p>
                </div>
              </div>
            )}

            {/* Listening To Widget */}
            {!isPrivate && (publicProfile.topSong || publicProfile.topAlbum) && (
              <div
                className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center gap-3 relative overflow-hidden group cursor-default backdrop-blur-md"
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
                  <p className="text-xs sm:text-sm font-bold text-white truncate shadow-black drop-shadow-sm">
                    {publicProfile.topSong?.name || publicProfile.topAlbum?.name || 'Nothing playing'}
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-300 truncate">
                    {publicProfile.topSong?.artist || publicProfile.topAlbum?.artist || ''}
                  </p>
                </div>
              </div>
            )}

            {/* Social Links (Prominent) */}
            {!isPrivate && isFieldVisible('socials', originalPrivacy) && publicProfile.socials && Object.keys(publicProfile.socials).length > 0 && (
              <div className="flex justify-center gap-3 mt-4 sm:mt-6">
                {Object.entries(publicProfile.socials).map(([platform, handle]) => {
                  if (!handle || platform === 'visibility') return null
                  const url = getSocialUrl(platform, handle as string)
                  if (!url) return null

                  // Platform specific colors/styling
                  const getPlatformStyle = (p: string) => {
                    switch (p) {
                      case 'twitter': return 'hover:bg-[#1DA1F2]/20 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30';
                      case 'instagram': return 'hover:bg-[#E1306C]/20 hover:text-[#E1306C] hover:border-[#E1306C]/30';
                      case 'youtube': return 'hover:bg-[#FF0000]/20 hover:text-[#FF0000] hover:border-[#FF0000]/30';
                      default: return 'hover:bg-white/20 hover:text-white hover:border-white/30';
                    }
                  }

                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5 text-gray-400 transition-all duration-300 ${getPlatformStyle(platform)}`}
                    >
                      {React.cloneElement(getSocialIcon(platform) as React.ReactElement, { className: "w-4 h-4 sm:w-5 sm:h-5" })}
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
