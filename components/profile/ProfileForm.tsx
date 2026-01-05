'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Check, X, AlertCircle, Copy, ExternalLink, Search, Music } from 'lucide-react'
import { slugifyHandle } from '@/lib/utils/profile'
import { track } from '@/lib/utils/analytics'
import AvatarUploader from './AvatarUploader'
import BannerUploader from './BannerUploader'

interface TopSong { id: string; name: string; artist: string }
type Socials = {
  twitter?: string
  instagram?: string
  youtube?: string
  website?: string
  visibility?: Record<string, boolean>
  [key: string]: string | Record<string, boolean> | undefined
}

interface ProfileData {
  handle?: string
  displayName?: string
  avatarUrl?: string
  bannerUrl?: string
  pronouns?: string
  bio?: string
  bias?: string[]
  biasWrecker?: string
  favoriteEra?: string
  armySinceYear?: number | null
  topSong?: TopSong | null
  location?: string
  language?: string
  socials?: Socials
}

interface ProfileFormProps {
  profile: ProfileData
  onUpdate: (updates: any) => void
  loading?: boolean
  error?: string | null
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

const PRONOUN_SUGGESTIONS = [
  'she/her', 'he/him', 'they/them', 'she/they', 'he/they', 'any pronouns'
]

export default function ProfileForm({ profile, onUpdate, loading, error }: ProfileFormProps) {
  const [handleCheck, setHandleCheck] = useState<{ checking: boolean; available?: boolean; error?: string }>({ checking: false })
  const [showMore, setShowMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; artists: Array<{ name: string }> }>>([])
  const [, setSearching] = useState(false)
  
  const handleCheckTimeoutRef = useRef<NodeJS.Timeout>()

  // Handle availability check
  const checkHandleAvailability = useCallback(async (handle: string) => {
    if (!handle || handle.length < 3) {
      setHandleCheck({ checking: false })
      return
    }

    setHandleCheck({ checking: true })

    if (handleCheckTimeoutRef.current) {
      clearTimeout(handleCheckTimeoutRef.current)
    }

    handleCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/user/profile?handle=${encodeURIComponent(handle)}`)
        if (response.ok) {
          setHandleCheck({ checking: false, available: true })
          await track('handle_availability_checked', { handle, available: true })
        } else if (response.status === 409) {
          setHandleCheck({ checking: false, available: false, error: 'Handle already taken' })
          await track('handle_availability_checked', { handle, available: false })
        } else {
          setHandleCheck({ checking: false, available: false, error: 'Error checking availability' })
        }
      } catch (err) {
        setHandleCheck({ checking: false, available: false, error: 'Network error' })
      }
    }, 500)
  }, [])

  // Handle input changes
  const handleInputChange = useCallback((field: keyof ProfileData | string, value: any) => {
    const updates = { [field]: value }
    
    // Special handling for handle
    if (field === 'handle') {
      const slugified = slugifyHandle(value)
      updates.handle = slugified
      if (slugified !== profile.handle) {
        checkHandleAvailability(slugified)
      }
    }
    
    // Handle empty strings for URL fields
    if (['avatarUrl', 'bannerUrl'].includes(field) && value === '') {
      updates[field] = ''
    }
    
    // Handle empty strings for social URLs
    if (field.startsWith('socials.') && value === '') {
      const socialField = field.split('.')[1]
      updates.socials = {
        ...profile.socials,
        [socialField]: ''
      }
    }
    
    onUpdate(updates)
  }, [onUpdate, profile.handle, profile.socials, checkHandleAvailability])

  // Spotify search
  const searchSpotify = useCallback(async (query: string, type: 'track' | 'album') => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&type=${type}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.items || [])
        await track('spotify_search_performed', { query, type, resultsCount: data.items?.length || 0 })
      }
    } catch (err) {
      console.error('Spotify search error:', err)
    } finally {
      setSearching(false)
    }
  }, [])

  // Debounced search
  const debouncedSearch = useCallback((query: string, type: 'track' | 'album') => {
    if (handleCheckTimeoutRef.current) {
      clearTimeout(handleCheckTimeoutRef.current)
    }
    
    handleCheckTimeoutRef.current = setTimeout(() => {
      searchSpotify(query, type)
    }, 300)
  }, [searchSpotify])

  // Copy profile link
  const copyProfileLink = useCallback(async () => {
    if (!profile.handle) return
    
    const url = `${window.location.origin}/u/${profile.handle}`
    try {
      await navigator.clipboard.writeText(url)
      await track('profile_link_copied', { handle: profile.handle })
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }, [profile.handle])

  // View public profile
  const viewPublicProfile = useCallback(() => {
    if (!profile.handle) return
    window.open(`/u/${profile.handle}`, '_blank')
  }, [profile.handle])

  return (
    <div className="space-y-8">
      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Basic Information</h3>
        
        {/* Avatar and Banner */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Profile Picture
            </label>
            <AvatarUploader
              currentUrl={profile.avatarUrl ?? ''}
              onUpload={(url: string) => handleInputChange('avatarUrl', url)}
              loading={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Banner Image
            </label>
            <BannerUploader
              currentUrl={profile.bannerUrl ?? ''}
              onUpload={(url: string) => handleInputChange('bannerUrl', url)}
              loading={loading}
            />
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
            Display Name *
          </label>
          <input
            id="displayName"
            type="text"
            value={profile.displayName ?? ''}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
            placeholder="How should ARMY see you?"
            maxLength={40}
          />
          <p className="text-xs text-gray-500 mt-1">
            {(profile.displayName ?? '').length}/40 characters
          </p>
        </div>

        {/* Handle */}
        <div>
          <label htmlFor="handle" className="block text-sm font-medium text-gray-300 mb-2">
            Username
          </label>
          <div className="relative">
            <input
              id="handle"
              type="text"
              value={profile.handle || ''}
              onChange={(e) => handleInputChange('handle', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="your-username"
              maxLength={24}
            />
            {handleCheck.checking && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {handleCheck.available === true && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Check className="w-5 h-5 text-green-400" />
              </div>
            )}
            {handleCheck.available === false && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-5 h-5 text-red-400" />
              </div>
            )}
          </div>
          {handleCheck.error && (
            <p className="text-xs text-red-400 mt-1">{handleCheck.error}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Forms your public URL: armyverse.app/u/{profile.handle || 'your-username'}
          </p>
        </div>

        {/* Pronouns */}
        <div>
          <label htmlFor="pronouns" className="block text-sm font-medium text-gray-300 mb-2">
            Pronouns
          </label>
          <input
            id="pronouns"
            type="text"
            value={profile.pronouns || ''}
            onChange={(e) => handleInputChange('pronouns', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
            placeholder="e.g., she/her, they/them"
            maxLength={50}
            list="pronoun-suggestions"
          />
          <datalist id="pronoun-suggestions">
            {PRONOUN_SUGGESTIONS.map((pronoun) => (
              <option key={pronoun} value={pronoun} />
            ))}
          </datalist>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            value={profile.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors resize-none"
            placeholder="Tell ARMY about yourself..."
            rows={3}
            maxLength={160}
          />
          <p className="text-xs text-gray-500 mt-1">
            {(profile.bio || '').length}/160 characters
          </p>
        </div>
      </div>

      {/* ARMY Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">ARMY Information</h3>
        
        {/* Bias */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bias
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {BTS_MEMBERS.map((member) => (
              <button
                key={member}
                type="button"
                onClick={() => {
                  const currentBias = profile.bias || []
                  const newBias = currentBias.includes(member)
                    ? currentBias.filter((b: string) => b !== member)
                    : [...currentBias, member]
                  handleInputChange('bias', newBias)
                }}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  profile.bias?.includes(member)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {member}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Select one or more members you bias
          </p>
        </div>

        {/* Bias Wrecker */}
        <div>
          <label htmlFor="biasWrecker" className="block text-sm font-medium text-gray-300 mb-2">
            Bias Wrecker
          </label>
          <select
            id="biasWrecker"
            value={profile.biasWrecker || ''}
            onChange={(e) => handleInputChange('biasWrecker', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white focus:border-purple-500 focus:outline-none transition-colors"
          >
            <option value="">Select bias wrecker</option>
            {BTS_MEMBERS.map((member) => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </select>
        </div>

        {/* Favorite Era */}
        <div>
          <label htmlFor="favoriteEra" className="block text-sm font-medium text-gray-300 mb-2">
            Favorite Era
          </label>
          <select
            id="favoriteEra"
            value={profile.favoriteEra || ''}
            onChange={(e) => handleInputChange('favoriteEra', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white focus:border-purple-500 focus:outline-none transition-colors"
          >
            <option value="">Select favorite era</option>
            {BTS_ERAS.map((era) => (
              <option key={era} value={era}>
                {era}
              </option>
            ))}
          </select>
        </div>

        {/* ARMY Since */}
        <div>
          <label htmlFor="armySinceYear" className="block text-sm font-medium text-gray-300 mb-2">
            ARMY Since
          </label>
          <select
            id="armySinceYear"
            value={profile.armySinceYear || ''}
            onChange={(e) => handleInputChange('armySinceYear', e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white focus:border-purple-500 focus:outline-none transition-colors"
          >
            <option value="">Select year</option>
            {Array.from({ length: new Date().getFullYear() - 2012 }, (_, i) => {
              const year = 2013 + i
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {/* Show More Toggle */}
      <div className="border-t border-purple-500/20 pt-6">
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <span>{showMore ? 'Show Less' : 'Show More'}</span>
          <motion.div
            animate={{ rotate: showMore ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>
      </div>

      {/* Advanced Options */}
      {showMore && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-6"
        >
          {/* Top Song */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Top Song
            </label>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    debouncedSearch(e.target.value, 'track')
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Search for a song..."
                />
              </div>
              
              {searchResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {searchResults.map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        handleInputChange('topSong', {
                          id: track.id,
                          name: track.name,
                          artist: track.artists[0]?.name || 'Unknown Artist'
                        })
                        setSearchQuery('')
                        setSearchResults([])
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-black/20 hover:bg-black/40 rounded-xl transition-colors text-left"
                    >
                      <Music className="w-4 h-4 text-purple-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {track.name}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          {track.artists[0]?.name || 'Unknown Artist'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {profile.topSong && (
                <div className="flex items-center gap-3 p-3 bg-purple-600/20 rounded-xl">
                  <Music className="w-4 h-4 text-purple-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {profile.topSong.name}
                    </p>
                    <p className="text-gray-400 text-xs truncate">
                      {profile.topSong.artist}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('topSong', null)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={profile.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="e.g., Seoul, South Korea"
              maxLength={100}
            />
          </div>

          {/* Language */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
              Language
            </label>
            <select
              id="language"
              value={profile.language || 'en'}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white focus:border-purple-500 focus:outline-none transition-colors"
            >
              <option value="en">English</option>
              <option value="ko">한국어</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      {profile.handle && (
        <div className="border-t border-purple-500/20 pt-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Actions</h4>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={copyProfileLink}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy Profile Link
            </button>
            <button
              type="button"
              onClick={viewPublicProfile}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Public Profile
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
