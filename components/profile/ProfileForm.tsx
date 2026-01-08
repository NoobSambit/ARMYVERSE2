'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Check, X, AlertCircle, Search, Music, ChevronDown } from 'lucide-react'
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
  '2 Cool 4 Skool', 'O!RUL8,2?', 'Skool Luv Affair', 'Dark & Wild',
  'The Most Beautiful Moment in Life', 'Wings', 'Love Yourself',
  'Map of the Soul', 'BE', 'Proof', 'Take Two'
]

const BTS_MEMBERS = ['RM', 'Jin', 'SUGA', 'j-hope', 'Jimin', 'V', 'Jungkook']
const PRONOUN_SUGGESTIONS = ['she/her', 'he/him', 'they/them', 'she/they', 'he/they', 'any pronouns']

export default function ProfileForm({ profile, onUpdate, loading, error }: ProfileFormProps) {
  const [handleCheck, setHandleCheck] = useState<{ checking: boolean; available?: boolean; error?: string }>({ checking: false })
  const [showMore, setShowMore] = useState(false)
  
  const handleCheckTimeoutRef = useRef<NodeJS.Timeout>()

  const checkHandleAvailability = useCallback(async (handle: string) => {
    if (!handle || handle.length < 3) {
      setHandleCheck({ checking: false })
      return
    }

    setHandleCheck({ checking: true })
    if (handleCheckTimeoutRef.current) clearTimeout(handleCheckTimeoutRef.current)

    handleCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/user/profile?handle=${encodeURIComponent(handle)}`)
        if (response.ok) {
          setHandleCheck({ checking: false, available: true })
        } else if (response.status === 409) {
          setHandleCheck({ checking: false, available: false, error: 'Handle already taken' })
        } else {
          setHandleCheck({ checking: false, available: false, error: 'Error checking availability' })
        }
      } catch (err) {
        setHandleCheck({ checking: false, available: false, error: 'Network error' })
      }
    }, 500)
  }, [])

  const handleInputChange = useCallback((field: keyof ProfileData | string, value: any) => {
    const updates = { [field]: value }
    if (field === 'handle') {
      const slugified = slugifyHandle(value)
      updates.handle = slugified
      if (slugified !== profile.handle) checkHandleAvailability(slugified)
    }
    if (['avatarUrl', 'bannerUrl'].includes(field) && value === '') updates[field] = ''
    onUpdate(updates)
  }, [onUpdate, profile.handle, checkHandleAvailability])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Error display */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Profile Images Section */}
      <div className="bg-[#151518] rounded-[2rem] border border-white/5 p-8">
        <h3 className="text-lg font-bold text-white mb-6">Profile Images</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar */}
          <div className="col-span-1">
            <label className="block text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">Avatar</label>
            <div className="flex flex-col items-center gap-3">
              <AvatarUploader
                currentUrl={profile.avatarUrl ?? ''}
                onUpload={(url: string) => handleInputChange('avatarUrl', url)}
                loading={loading}
              />
              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Max 2MB</span>
            </div>
          </div>

          {/* Banner */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">Banner Image</label>
            <div className="w-full">
              <BannerUploader
                currentUrl={profile.bannerUrl ?? ''}
                onUpload={(url: string) => handleInputChange('bannerUrl', url)}
                loading={loading}
              />
              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mt-2 block text-right">Recommended: 1500x500px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="bg-[#151518] rounded-[2rem] border border-white/5 p-8">
        <h3 className="text-lg font-bold text-white mb-6">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={profile.displayName ?? ''}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all font-medium"
              placeholder="e.g. Hobi's Hope"
              maxLength={40}
            />
          </div>

          {/* Username */}
          <div>
            <label htmlFor="handle" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Username</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-medium">@</span>
              <input
                id="handle"
                type="text"
                value={profile.handle || ''}
                onChange={(e) => handleInputChange('handle', e.target.value)}
                className={`w-full pl-9 pr-10 py-3.5 rounded-2xl bg-black/40 border text-white placeholder-gray-600 focus:outline-none transition-all font-medium ${
                  handleCheck.available === true ? 'border-green-500/50 focus:border-green-500' :
                  handleCheck.available === false ? 'border-red-500/50 focus:border-red-500' :
                  'border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                }`}
                placeholder="jhope_world"
                maxLength={24}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {handleCheck.checking ? (
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                ) : handleCheck.available === true ? (
                  <div className="flex items-center gap-1">
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                ) : handleCheck.available === false ? (
                  <X className="w-4 h-4 text-red-500" />
                ) : null}
              </div>
            </div>
            {handleCheck.error && <p className="text-xs text-red-400 mt-1">{handleCheck.error}</p>}
          </div>

          {/* Pronouns */}
          <div>
            <label htmlFor="pronouns" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Pronouns</label>
            <div className="relative">
              <input
                id="pronouns"
                list="pronoun-suggestions"
                value={profile.pronouns || ''}
                onChange={(e) => handleInputChange('pronouns', e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all font-medium"
                placeholder="Select or type..."
              />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <datalist id="pronoun-suggestions">
                {PRONOUN_SUGGESTIONS.map((p) => <option key={p} value={p} />)}
              </datalist>
            </div>
          </div>
          
          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Location</label>
            <input
              id="location"
              type="text"
              value={profile.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all font-medium"
              placeholder="Seoul, Korea"
              maxLength={100}
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Bio</label>
          <div className="relative">
            <textarea
              id="bio"
              value={profile.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all resize-none min-h-[120px] font-medium leading-relaxed"
              placeholder="Tell us about your ARMY journey..."
              maxLength={160}
            />
            <span className="absolute bottom-3 right-3 text-[10px] text-gray-600 font-bold uppercase tracking-wider">
              {(profile.bio || '').length}/160
            </span>
          </div>
        </div>
      </div>

      {/* ARMY Information Toggle */}
      <div className="bg-[#151518] rounded-[2rem] border border-white/5 p-8">
        <div className="flex items-center justify-between cursor-pointer group" onClick={() => setShowMore(!showMore)}>
           <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">ARMY Details</h3>
           <motion.div animate={{ rotate: showMore ? 180 : 0 }}>
             <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
           </motion.div>
        </div>

        <motion.div
           initial={false}
           animate={{ height: showMore ? 'auto' : 0, opacity: showMore ? 1 : 0 }}
           className="overflow-hidden"
        >
           <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Bias */}
             <div className="col-span-1 md:col-span-2">
               <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Your Bias</label>
               <div className="flex flex-wrap gap-2">
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
                     className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                       profile.bias?.includes(member)
                         ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20 translate-y-[-1px]'
                         : 'bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                     }`}
                   >
                     {member}
                   </button>
                 ))}
               </div>
             </div>

             {/* Bias Wrecker */}
             <div>
               <label htmlFor="biasWrecker" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Bias Wrecker</label>
               <div className="relative">
                  <select
                    id="biasWrecker"
                    value={profile.biasWrecker || ''}
                    onChange={(e) => handleInputChange('biasWrecker', e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-white appearance-none focus:border-purple-500 focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="">Select Member</option>
                    {BTS_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
               </div>
             </div>

             {/* Era */}
             <div>
               <label htmlFor="favoriteEra" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Favorite Era</label>
               <div className="relative">
                  <select
                    id="favoriteEra"
                    value={profile.favoriteEra || ''}
                    onChange={(e) => handleInputChange('favoriteEra', e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-white appearance-none focus:border-purple-500 focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="">Select Era</option>
                    {BTS_ERAS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
               </div>
             </div>

             {/* ARMY Since */}
             <div>
               <label htmlFor="armySinceYear" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">ARMY Since</label>
               <div className="relative">
                  <select
                    id="armySinceYear"
                    value={profile.armySinceYear || ''}
                    onChange={(e) => handleInputChange('armySinceYear', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-white appearance-none focus:border-purple-500 focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: new Date().getFullYear() - 2012 }, (_, i) => {
                      const year = 2013 + i
                      return <option key={year} value={year}>{year}</option>
                    })}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
               </div>
             </div>
           </div>
        </motion.div>
      </div>
    </div>
  )
}
