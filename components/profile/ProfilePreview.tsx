'use client'

import React from 'react'
import Image from 'next/image'
import { MapPin, Calendar, Music, Globe, Twitter, Instagram, Youtube, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { getPublicProfile, isFieldVisible } from '@/lib/utils/profile'

interface ProfilePreviewProps {
  profile: any
}

const BTS_ERAS = [
  '2 Cool 4 Skool',
  'O!RUL8,2?',
  'Skool Luv Affair',
  'Dark & Wild',
  'The Most Beautiful Moment in Life',
  'Wings',
  'Love Yourself',
  'Map of the Soul',
  'BE',
  'Proof',
  'Take Two'
]

const BTS_MEMBERS = [
  'RM', 'Jin', 'SUGA', 'j-hope', 'Jimin', 'V', 'Jungkook'
]

export default function ProfilePreview({ profile }: ProfilePreviewProps) {
  const publicProfile = getPublicProfile(profile)
  const originalPrivacy = profile?.privacy
  
  const formatDate = (year: number) => {
    if (!year) return ''
    const currentYear = new Date().getFullYear()
    const yearsSince = currentYear - year
    return `${year} (${yearsSince} year${yearsSince !== 1 ? 's' : ''} ARMY)`
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-4 h-4" />
      case 'instagram':
        return <Instagram className="w-4 h-4" />
      case 'youtube':
        return <Youtube className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  const getSocialUrl = (platform: string, handle: string) => {
    if (!handle) return ''
    
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/${handle.replace('@', '')}`
      case 'instagram':
        return `https://instagram.com/${handle.replace('@', '')}`
      case 'youtube':
        return `https://youtube.com/@${handle}`
      default:
        return handle.startsWith('http') ? handle : `https://${handle}`
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-purple-500/20">
        <h3 className="text-lg font-semibold text-white mb-2">Public Profile Preview</h3>
        <p className="text-sm text-gray-400">
          This is how your profile appears to others
        </p>
      </div>
      
      {/* Preview content */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Banner */}
          {publicProfile.bannerUrl && (
            <div className="relative h-32 rounded-lg overflow-hidden">
              <Image
                src={publicProfile.bannerUrl}
                alt="Profile banner"
                fill
                className="object-cover"
              />
            </div>
          )}
          
          {/* Avatar and basic info */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-purple-500/30">
                <Image
                  src={publicProfile.avatarUrl || '/avatar-placeholder.svg'}
                  alt="Profile avatar"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover"
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white truncate">
                {publicProfile.displayName || 'ARMY Member'}
              </h2>
              
              {publicProfile.handle && (
                <p className="text-purple-400 text-sm">
                  @{publicProfile.handle}
                </p>
              )}
              
              {publicProfile.pronouns && (
                <p className="text-gray-400 text-sm">
                  {publicProfile.pronouns}
                </p>
              )}
            </div>
          </div>
          
          {/* Bio */}
          {publicProfile.bio && (
            <div className="bg-black/20 rounded-lg p-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                {publicProfile.bio}
              </p>
            </div>
          )}
          
          {/* ARMY Info */}
          <div className="space-y-4">
            {/* Bias */}
            {isFieldVisible('bias', originalPrivacy) && publicProfile.bias && publicProfile.bias.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Bias</h4>
                <div className="flex flex-wrap gap-2">
                  {publicProfile.bias.map((bias: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm"
                    >
                      {bias}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Bias Wrecker */}
            {publicProfile.biasWrecker && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Bias Wrecker</h4>
                <span className="px-3 py-1 bg-pink-600/20 text-pink-300 rounded-full text-sm">
                  {publicProfile.biasWrecker}
                </span>
              </div>
            )}
            
            {/* Favorite Era */}
            {isFieldVisible('era', originalPrivacy) && publicProfile.favoriteEra && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Favorite Era</h4>
                <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">
                  {publicProfile.favoriteEra}
                </span>
              </div>
            )}
            
            {/* ARMY Since */}
            {publicProfile.armySinceYear && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>ARMY since {formatDate(publicProfile.armySinceYear)}</span>
              </div>
            )}
          </div>
          
          {/* Top Song/Album */}
          {(publicProfile.topSong || publicProfile.topAlbum) && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-400">Current Favorites</h4>
              
              {publicProfile.topSong && (
                <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                  <Music className="w-5 h-5 text-purple-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {publicProfile.topSong.name}
                    </p>
                    <p className="text-gray-400 text-xs truncate">
                      {publicProfile.topSong.artist}
                    </p>
                  </div>
                </div>
              )}
              
              {publicProfile.topAlbum && (
                <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                  <Music className="w-5 h-5 text-purple-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {publicProfile.topAlbum.name}
                    </p>
                    <p className="text-gray-400 text-xs truncate">
                      {publicProfile.topAlbum.artist}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Location */}
          {publicProfile.location && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{publicProfile.location}</span>
            </div>
          )}
          
          {/* Social Links */}
          {isFieldVisible('socials', originalPrivacy) && publicProfile.socials && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Connect</h4>
              <div className="flex flex-wrap gap-3">
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
                      className="flex items-center gap-2 px-3 py-2 bg-black/20 hover:bg-black/40 rounded-lg transition-colors group"
                    >
                      {getSocialIcon(platform)}
                      <span className="text-sm text-gray-300 group-hover:text-white">
                        {platform}
                      </span>
                      <ExternalLink className="w-3 h-3 text-gray-500" />
                    </a>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Stats */}
          {isFieldVisible('stats', originalPrivacy) && publicProfile.stats && (
            <div className="border-t border-purple-500/20 pt-4">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Activity</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-white">
                    {publicProfile.stats.totalPlaylists || 0}
                  </p>
                  <p className="text-xs text-gray-400">Playlists</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    {publicProfile.stats.totalLikes || 0}
                  </p>
                  <p className="text-xs text-gray-400">Likes</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    {publicProfile.stats.totalSaves || 0}
                  </p>
                  <p className="text-xs text-gray-400">Saves</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
