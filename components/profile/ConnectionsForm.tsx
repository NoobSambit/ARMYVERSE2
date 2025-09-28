'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Music, Twitter, Instagram, Youtube, Globe, Link, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react'
import { formatSocialUrl, extractSocialHandle, validateUrl } from '@/lib/utils/profile'
import { track } from '@/lib/utils/analytics'

type SocialVisibility = Record<string, boolean>
type ProfileSocials = {
  twitter?: string
  instagram?: string
  youtube?: string
  website?: string
  visibility?: SocialVisibility
  [key: string]: string | SocialVisibility | undefined
}
interface ProfileShape { socials?: ProfileSocials }
interface ConnectionsFormProps {
  profile: ProfileShape
  onUpdate: (updates: any) => void
  loading?: boolean
  error?: string | null
}

const SOCIAL_PLATFORMS = [
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: Twitter,
    placeholder: 'https://twitter.com/username',
    example: 'https://twitter.com/username'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    placeholder: 'https://instagram.com/username',
    example: 'https://instagram.com/username'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    placeholder: 'https://youtube.com/@username',
    example: 'https://youtube.com/@username'
  },
  {
    id: 'website',
    name: 'Website',
    icon: Globe,
    placeholder: 'https://yourwebsite.com',
    example: 'https://yourwebsite.com'
  }
]

export default function ConnectionsForm({ profile, onUpdate, error }: ConnectionsFormProps) {
  const [spotifyStatus, setSpotifyStatus] = useState<{
    connected: boolean
    loading: boolean
    error?: string
    scopes?: string[]
  }>({ connected: false, loading: true })
  
  const [urlErrors, setUrlErrors] = useState<Record<string, string>>({})

  // Check Spotify connection status
  useEffect(() => {
    const checkSpotifyStatus = async () => {
      try {
        const response = await fetch('/api/spotify/dashboard')
        if (response.ok) {
          const data = await response.json()
          setSpotifyStatus({
            connected: true,
            loading: false,
            scopes: data.scopes || []
          })
        } else {
          setSpotifyStatus({
            connected: false,
            loading: false,
            error: 'Not connected'
          })
        }
      } catch (err) {
        setSpotifyStatus({
          connected: false,
          loading: false,
          error: 'Failed to check connection'
        })
      }
    }

    checkSpotifyStatus()
  }, [])

  const handleInputChange = useCallback((field: string, value: string) => {
    onUpdate({
      socials: {
        ...profile.socials,
        [field]: value
      }
    })
  }, [onUpdate, profile.socials])

  const handleUrlChange = useCallback((platform: string, url: string) => {
    // Clear previous error
    setUrlErrors(prev => ({ ...prev, [platform]: '' }))
    
    if (!url) {
      handleInputChange(platform, '')
      return
    }

    // Validate URL
    const validation = validateUrl(url)
    if (!validation.isValid) {
      setUrlErrors(prev => ({ ...prev, [platform]: validation.error || 'Invalid URL' }))
      return
    }

    // Format URL
    const formattedUrl = formatSocialUrl(url, platform)
    handleInputChange(platform, formattedUrl)
  }, [handleInputChange])

  const handleVisibilityChange = useCallback((platform: string, visible: boolean) => {
    onUpdate({
      socials: {
        ...profile.socials,
        visibility: {
          ...profile.socials?.visibility,
          [platform]: visible
        }
      }
    })
  }, [onUpdate, profile.socials])

  const connectSpotify = useCallback(async () => {
    try {
      const response = await fetch('/api/spotify/auth-url')
      if (response.ok) {
        const { url } = await response.json()
        await track('connection_connected', { platform: 'spotify' })
        window.location.href = url
      }
    } catch (err) {
      console.error('Failed to get Spotify auth URL:', err)
    }
  }, [])

  const disconnectSpotify = useCallback(async () => {
    try {
      const response = await fetch('/api/spotify/disconnect', { method: 'POST' })
      if (response.ok) {
        setSpotifyStatus({
          connected: false,
          loading: false
        })
        await track('connection_disconnected', { platform: 'spotify' })
      }
    } catch (err) {
      console.error('Failed to disconnect Spotify:', err)
    }
  }, [])

  const getScopeDescription = (scopes: string[]) => {
    const scopeMap: Record<string, string> = {
      'user-read-private': 'View your Spotify account details',
      'user-read-email': 'View your Spotify email address',
      'user-top-read': 'View your top artists and tracks',
      'user-read-recently-played': 'View your recently played tracks',
      'playlist-read-private': 'View your private playlists',
      'playlist-modify-public': 'Modify your public playlists',
      'playlist-modify-private': 'Modify your private playlists'
    }
    
    return scopes.map(scope => scopeMap[scope] || scope).join(', ')
  }

  return (
    <div className="space-y-8">
      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Spotify Connection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Spotify Connection</h3>
        </div>
        
        <div className="p-6 bg-black/20 rounded-lg border border-gray-700">
          {spotifyStatus.loading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400">Checking connection...</span>
            </div>
          ) : spotifyStatus.connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-green-400 font-medium">Connected to Spotify</span>
              </div>
              
              {spotifyStatus.scopes && spotifyStatus.scopes.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Permissions granted:</p>
                  <p className="text-sm text-gray-300">
                    {getScopeDescription(spotifyStatus.scopes)}
                  </p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={connectSpotify}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Reconnect
                </button>
                <button
                  onClick={disconnectSpotify}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-500 rounded-full" />
                <span className="text-gray-400">Not connected to Spotify</span>
              </div>
              
              <p className="text-sm text-gray-400">
                Connect your Spotify account to access personalized playlists, recommendations, and music insights.
              </p>
              
              <button
                onClick={connectSpotify}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Connect Spotify
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Social Links</h3>
        </div>
        
        <div className="space-y-6">
          {SOCIAL_PLATFORMS.map((platform) => {
            const Icon = platform.icon
            const socialValue = profile.socials?.[platform.id]
            const currentUrl = typeof socialValue === 'string' ? socialValue : ''
            const isVisible = profile.socials?.visibility?.[platform.id] ?? true
            const hasError = urlErrors[platform.id]
            
            return (
              <div key={platform.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <h4 className="text-white font-medium">{platform.name}</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="url"
                      value={currentUrl}
                      onChange={(e) => handleUrlChange(platform.id, e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg bg-black/40 border text-white placeholder-gray-500 focus:outline-none transition-colors ${
                        hasError ? 'border-red-500' : 'border-gray-700 focus:border-purple-500'
                      }`}
                      placeholder={platform.placeholder}
                    />
                    {hasError && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <X className="w-5 h-5 text-red-400" />
                      </div>
                    )}
                    {currentUrl && !hasError && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Check className="w-5 h-5 text-green-400" />
                      </div>
                    )}
                  </div>
                  
                  {hasError && (
                    <p className="text-xs text-red-400">{hasError}</p>
                  )}
                  
                  {currentUrl && !hasError && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>Handle: {extractSocialHandle(currentUrl, platform.id)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleVisibilityChange(platform.id, !isVisible)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                          isVisible
                            ? 'bg-green-600/20 text-green-400'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {isVisible ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                    
                    {currentUrl && (
                      <a
                        href={currentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        Test link
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Help Text */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="text-blue-300 font-medium mb-2">About Social Links</h4>
        <ul className="text-blue-300/80 text-sm space-y-1">
          <li>• Links are validated and formatted automatically</li>
          <li>• Use the visibility toggle to control what appears on your public profile</li>
          <li>• Handles are extracted and displayed for verification</li>
          <li>• Changes are saved automatically</li>
        </ul>
      </div>

      {/* Connection Status Summary */}
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <h4 className="text-white font-medium mb-3">Connection Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${spotifyStatus.connected ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span className="text-gray-300">Spotify</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${Object.entries(profile.socials || {}).some(([, v]) => typeof v === 'string' && !!v) ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span className="text-gray-300">Social Links</span>
          </div>
        </div>
      </div>
    </div>
  )
}
