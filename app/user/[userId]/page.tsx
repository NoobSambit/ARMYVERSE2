'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  MapPin, Calendar, Music, Globe, Twitter, Instagram, Youtube, 
  ExternalLink, ArrowLeft, Shield, Loader2 
} from 'lucide-react'

interface UserProfile {
  userId?: string
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
  topSong?: { name: string; artist: string }
  topAlbum?: { name: string; artist: string }
  location?: string
  socials?: Record<string, any>
  stats?: { totalPlaylists?: number; totalLikes?: number; totalSaves?: number }
  personalization?: {
    accentColor?: string
    themeIntensity?: number
    backgroundStyle?: 'gradient' | 'noise' | 'bts-motif' | 'clean'
    badgeStyle?: 'minimal' | 'collectible'
  }
}

const DEFAULT_ACCENT = '#8B5CF6'
const DEFAULT_INTENSITY = 50

const withAlpha = (hex: string, alpha: number) => {
  const normalized = hex?.replace('#', '')
  if (!normalized || normalized.length !== 6) return hex
  const alphaValue = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
  const alphaHex = alphaValue.toString(16).padStart(2, '0')
  return `#${normalized}${alphaHex}`
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params?.userId as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/user/${userId}/profile`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to load profile')
        }

        const data = await response.json()
        setProfile(data.profile)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

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

  const formatDate = (year: number) => {
    if (!year) return ''
    const currentYear = new Date().getFullYear()
    const yearsSince = currentYear - year
    return `${year} (${yearsSince} year${yearsSince !== 1 ? 's' : ''} ARMY)`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-red-500/30 text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Profile Not Available</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl mx-auto transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const accentColor = profile.personalization?.accentColor || DEFAULT_ACCENT
  const themeIntensity = profile.personalization?.themeIntensity ?? DEFAULT_INTENSITY
  const backgroundStyle = profile.personalization?.backgroundStyle || 'gradient'
  const badgeStyle = profile.personalization?.badgeStyle || 'minimal'

  const intensityFactor = Math.min(Math.max(themeIntensity / 100, 0), 1)
  const accentSoft = withAlpha(accentColor, 0.12 + intensityFactor * 0.25)
  const accentBorder = withAlpha(accentColor, 0.25 + intensityFactor * 0.35)
  const accentGlow = withAlpha(accentColor, 0.45 + intensityFactor * 0.35)
  const accentText = accentColor

  const backgroundStyles: Record<string, React.CSSProperties> = {
    gradient: {
      background: `linear-gradient(140deg, ${withAlpha(accentColor, 0.45 + intensityFactor * 0.35)} 0%, ${withAlpha(accentColor, 0.1)} 100%)`
    },
    noise: {
      backgroundColor: '#12021f',
      backgroundImage: `radial-gradient(circle at 20% 20%, ${withAlpha(accentColor, 0.2)} 0%, transparent 55%),
        radial-gradient(circle at 80% 0%, ${withAlpha(accentColor, 0.12)} 0%, transparent 45%),
        linear-gradient(${withAlpha('#ffffff', 0.015)} 1px, transparent 0),
        linear-gradient(90deg, ${withAlpha('#ffffff', 0.02)} 1px, transparent 0)`
    },
    'bts-motif': {
      backgroundColor: '#11041d',
      backgroundImage: `radial-gradient(circle at 15% 25%, ${withAlpha(accentColor, 0.25)} 0%, transparent 55%),
        radial-gradient(circle at 85% 35%, ${withAlpha(accentColor, 0.18)} 0%, transparent 50%),
        repeating-linear-gradient(135deg, ${withAlpha(accentColor, 0.08)} 0px, ${withAlpha(accentColor, 0.08)} 8px, transparent 8px, transparent 24px)`
    },
    clean: {
      background: `linear-gradient(120deg, ${withAlpha(accentColor, 0.18)} 0%, ${withAlpha('#000000', 0.5)} 100%)`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-xl font-bold text-white">
            {profile.displayName || 'User Profile'}
          </h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl p-8 space-y-6"
          style={backgroundStyles[backgroundStyle]}
        >
          {/* Banner */}
          {profile.bannerUrl && (
            <div className="relative h-48 rounded-xl overflow-hidden -mx-8 -mt-8 mb-8">
              <Image
                src={profile.bannerUrl}
                alt="Profile banner"
                fill
                className="object-cover"
              />
            </div>
          )}
          
          {/* Avatar and basic info */}
          <div className="flex items-start gap-6">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full overflow-hidden border-4"
                style={{ 
                  borderColor: accentBorder, 
                  boxShadow: badgeStyle === 'collectible' ? `0 0 24px ${accentGlow}` : undefined 
                }}
              >
                <Image
                  src={profile.avatarUrl || '/avatar-placeholder.svg'}
                  alt="Profile avatar"
                  width={96}
                  height={96}
                  className="w-24 h-24 object-cover"
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-bold text-white truncate">
                {profile.displayName || 'ARMY Member'}
              </h2>
              
              {profile.handle && (
                <p className="text-purple-400 text-lg">
                  @{profile.handle}
                </p>
              )}
              
              {profile.pronouns && (
                <p className="text-gray-400">
                  {profile.pronouns}
                </p>
              )}
            </div>
          </div>
          
          {/* Bio */}
          {profile.bio && (
            <div className="bg-black/20 rounded-xl p-6">
              <p className="text-gray-300 leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}
          
          {/* ARMY Info */}
          <div className="space-y-6">
            {/* Bias */}
            {profile.bias && profile.bias.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Bias</h4>
                <div className="flex flex-wrap gap-3">
                  {profile.bias.map((bias, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: accentSoft,
                        color: accentText,
                        border: badgeStyle === 'collectible' ? `1px solid ${accentBorder}` : undefined,
                        boxShadow: badgeStyle === 'collectible' ? `0 2px 12px ${withAlpha(accentColor, 0.25)}` : undefined
                      }}
                    >
                      {bias}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Bias Wrecker */}
            {profile.biasWrecker && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Bias Wrecker</h4>
                <span
                  className="px-4 py-2 rounded-full text-sm font-medium inline-block"
                  style={{
                    backgroundColor: accentSoft,
                    color: accentText,
                    border: badgeStyle === 'collectible' ? `1px solid ${accentBorder}` : undefined,
                    boxShadow: badgeStyle === 'collectible' ? `0 2px 12px ${withAlpha(accentColor, 0.25)}` : undefined
                  }}
                >
                  {profile.biasWrecker}
                </span>
              </div>
            )}
            
            {/* Favorite Era */}
            {profile.favoriteEra && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Favorite Era</h4>
                <span
                  className="px-4 py-2 rounded-full text-sm font-medium inline-block"
                  style={{
                    backgroundColor: accentSoft,
                    color: accentText,
                    border: badgeStyle === 'collectible' ? `1px solid ${accentBorder}` : undefined,
                    boxShadow: badgeStyle === 'collectible' ? `0 2px 12px ${withAlpha(accentColor, 0.25)}` : undefined
                  }}
                >
                  {profile.favoriteEra}
                </span>
              </div>
            )}
            
            {/* ARMY Since */}
            {profile.armySinceYear && (
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-5 h-5" />
                <span>ARMY since {formatDate(profile.armySinceYear)}</span>
              </div>
            )}
          </div>
          
          {/* Top Song/Album */}
          {(profile.topSong || profile.topAlbum) && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-400">Current Favorites</h4>
              
              {profile.topSong && (
                <div 
                  className="flex items-center gap-4 p-4 rounded-xl" 
                  style={{ 
                    backgroundColor: withAlpha(accentColor, 0.08), 
                    border: `1px solid ${withAlpha(accentColor, 0.18)}` 
                  }}
                >
                  <Music className="w-6 h-6" style={{ color: accentText }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {profile.topSong.name}
                    </p>
                    <p className="text-gray-400 text-sm truncate">
                      {profile.topSong.artist}
                    </p>
                  </div>
                </div>
              )}
              
              {profile.topAlbum && (
                <div 
                  className="flex items-center gap-4 p-4 rounded-xl" 
                  style={{ 
                    backgroundColor: withAlpha(accentColor, 0.08), 
                    border: `1px solid ${withAlpha(accentColor, 0.18)}` 
                  }}
                >
                  <Music className="w-6 h-6" style={{ color: accentText }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {profile.topAlbum.name}
                    </p>
                    <p className="text-gray-400 text-sm truncate">
                      {profile.topAlbum.artist}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Location */}
          {profile.location && (
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin className="w-5 h-5" />
              <span>{profile.location}</span>
            </div>
          )}
          
          {/* Social Links */}
          {profile.socials && Object.keys(profile.socials).some(k => k !== 'visibility' && profile.socials![k]) && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-4">Connect</h4>
              <div className="flex flex-wrap gap-3">
                {Object.entries(profile.socials).map(([platform, handle]) => {
                  if (!handle || platform === 'visibility') return null
                  
                  const url = getSocialUrl(platform, handle as string)
                  if (!url) return null
                  
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors group"
                      style={{
                        backgroundColor: withAlpha(accentColor, 0.08),
                        border: `1px solid ${withAlpha(accentColor, 0.15)}`
                      }}
                    >
                      {getSocialIcon(platform)}
                      <span className="text-sm text-gray-300 group-hover:text-white capitalize">
                        {platform}
                      </span>
                      <ExternalLink className="w-3 h-3" style={{ color: accentText }} />
                    </a>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Stats */}
          {profile.stats && (
            <div className="border-t pt-6" style={{ borderColor: withAlpha(accentColor, 0.2) }}>
              <h4 className="text-sm font-medium text-gray-400 mb-4">Activity</h4>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold" style={{ color: accentText }}>
                    {profile.stats.totalPlaylists || 0}
                  </p>
                  <p className="text-sm text-gray-400">Playlists</p>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: accentText }}>
                    {profile.stats.totalLikes || 0}
                  </p>
                  <p className="text-sm text-gray-400">Likes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: accentText }}>
                    {profile.stats.totalSaves || 0}
                  </p>
                  <p className="text-sm text-gray-400">Saves</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
