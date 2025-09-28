'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { X, Save, Eye, EyeOff, Copy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { track } from '@/lib/utils/analytics'
import { getDefaultProfile } from '@/lib/utils/profile'
// import { auth } from '@/lib/firebase/config'
import ProfileForm from './ProfileForm'
import PersonalizationForm from './PersonalizationForm'
import ConnectionsForm from './ConnectionsForm'
import PrivacyForm from './PrivacyForm'
import NotificationsForm from './NotificationsForm'
import ProfilePreview from './ProfilePreview'

interface ProfileModalProps {
  trigger: React.ReactNode
  defaultTab?: string
}

interface ProfileData {
  displayName?: string
  handle?: string
  pronouns?: string
  bio?: string
  avatarUrl?: string
  bannerUrl?: string
  bias: string[]
  biasWrecker?: string
  favoriteEra?: string
  armySinceYear?: number
  topSong?: { id: string; name: string; artist: string } | null
  topAlbum?: { id: string; name: string; artist: string } | null
  socials: {
    twitter?: string
    instagram?: string
    youtube?: string
    website?: string
    visibility: {
      twitter: boolean
      instagram: boolean
      youtube: boolean
      website: boolean
    }
  }
  location?: string
  timezone?: string
  language?: string
  personalization: {
    accentColor: string
    themeIntensity: number
    backgroundStyle: 'gradient' | 'noise' | 'bts-motif' | 'clean'
    density: 'comfortable' | 'compact'
    reduceMotion: boolean
    badgeStyle: 'minimal' | 'collectible'
  }
  privacy: {
    visibility: 'public' | 'followers' | 'private'
    fieldVisibility: {
      bias: boolean
      era: boolean
      socials: boolean
      stats: boolean
    }
    explicitContentFilter: boolean
    allowMentions: boolean
    allowDMs: boolean
    blockedUserIds: string[]
  }
  notifications: {
    channels: {
      inApp: boolean
      email: boolean
    }
    quietHours: {
      start: string
      end: string
      timezone: string
    }
    blog: {
      comments: boolean
      reactions: boolean
      saves: boolean
    }
    playlists: {
      exports: boolean
      likes: boolean
    }
    spotify: {
      weeklyRecap: boolean
      recommendations: boolean
    }
  }
  stats?: {
    totalPlaylists: number
    totalLikes: number
    totalSaves: number
  }
}

const tabs = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'personalization', label: 'Personalization', icon: '🎨' },
  { id: 'connections', label: 'Connections', icon: '🔗' },
  { id: 'privacy', label: 'Privacy & Safety', icon: '🔒' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' }
]

export default function ProfileModal({ trigger, defaultTab = 'profile' }: ProfileModalProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(true)
  const [isDirty, setIsDirty] = useState(false)
  const [profile, setProfile] = useState<ProfileData>(getDefaultProfile())
  
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const formRef = useRef<HTMLFormElement>(null)

  // Load profile data
  const loadProfile = useCallback(async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to load profile')
      }
      
      const { profile: profileData } = await response.json()
      console.log('API Response:', profileData)
      // Don't merge with default profile - use saved data directly
      const mergedProfile = profileData || getDefaultProfile()
      console.log('Merged Profile:', mergedProfile)
      
      setProfile(mergedProfile)
    } catch (err) {
      console.error('Failed to load profile:', err)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Save profile data
  const saveProfile = useCallback(async (data: Partial<ProfileData>) => {
    if (!user) return
    
    setSaving(true)
    setError(null)
    
    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save profile')
      }
      
      const { profile: savedProfile } = await response.json()
      // Use the saved profile data directly, don't merge with current state
      const mergedProfile = savedProfile || profile
      
      setProfile(mergedProfile)
      setIsDirty(false)
      
      await track('profile_saved', { tab: activeTab })
    } catch (err) {
      console.error('Failed to save profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }, [user, profile, activeTab])

  // Debounced save
  const debouncedSave = useCallback((data: Partial<ProfileData>) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveProfile(data)
    }, 1000)
  }, [saveProfile])

  // Update profile data
  const updateProfile = useCallback((updates: Partial<ProfileData>) => {
    const newProfile = { ...profile, ...updates }
    setProfile(newProfile)
    setIsDirty(true)
    
    // Auto-save for certain fields - only send the specific updates, not the entire profile
    const autoSaveFields = ['personalization', 'privacy', 'notifications', 'avatarUrl', 'bannerUrl']
    const shouldAutoSave = Object.keys(updates).some(key => 
      autoSaveFields.some(field => key.startsWith(field) || key === field)
    )
    
    if (shouldAutoSave) {
      // Only send the specific fields that changed, not the entire profile
      debouncedSave(updates)
    }
  }, [profile, debouncedSave])

  // Handle form submission
  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    await saveProfile(profile)
  }, [saveProfile, profile])

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

  // Focus trap and keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (formRef.current) {
          formRef.current.requestSubmit()
        }
      }
      
      if (e.key === 'Escape') {
        setOpen(false)
      }
      
      // Tab navigation within modal
      if (e.key === 'Tab') {
        const modal = document.querySelector('[role="dialog"]')
        if (!modal) return
        
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
        
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  // Load profile when modal opens
  useEffect(() => {
    if (open && user) {
      loadProfile()
      track('profile_opened', { tab: activeTab })
    }
  }, [open, user, loadProfile, activeTab])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setIsDirty(false)
      setError(null)
    }
  }, [open])

  // Track tab changes
  useEffect(() => {
    if (open) {
      track('profile_tab_changed', { tab: activeTab })
    }
  }, [activeTab, open])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  if (!user) {
    return <>{trigger}</>
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <span>{trigger}</span>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        
        <Dialog.Content 
          className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-6xl h-[90vh] rounded-2xl border border-purple-500/30 bg-[#150424]/95 shadow-2xl overflow-hidden focus:outline-none"
          aria-labelledby="profile-modal-title"
          aria-describedby="profile-modal-description"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <Dialog.Title id="profile-modal-title" className="text-xl font-semibold text-white">
                Your Profile
              </Dialog.Title>
              {isDirty && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-2 h-2 bg-orange-500 rounded-full"
                  title="Unsaved changes"
                />
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Preview toggle */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="p-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                title={showPreview ? 'Hide preview' : 'Show preview'}
                aria-label={showPreview ? 'Hide preview' : 'Show preview'}
              >
                {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              
              {/* Copy profile link */}
              {profile.handle && (
                <button
                  onClick={copyProfileLink}
                  className="p-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                  title="Copy profile link"
                  aria-label="Copy profile link"
                >
                  <Copy className="w-5 h-5" />
                </button>
              )}
              
              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving || !isDirty}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label={saving ? 'Saving profile' : 'Save profile changes'}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              
              <Dialog.Close className="p-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded" aria-label="Close profile modal">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>
          </div>
          
          <Dialog.Description id="profile-modal-description" className="sr-only">
            Edit your ARMY profile details including display name, avatar, preferences, and privacy settings.
          </Dialog.Description>
          
          {/* Content */}
          <div className="flex h-full">
            {/* Main content */}
            <div className={`flex-1 ${showPreview ? 'lg:w-2/3' : 'w-full'}`}>
              <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                {/* Tab navigation */}
                <Tabs.List className="flex border-b border-purple-500/20 px-6" role="tablist">
                  {tabs.map((tab) => (
                    <Tabs.Trigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-500 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-t"
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      aria-controls={`tabpanel-${tab.id}`}
                      id={`tab-${tab.id}`}
                    >
                      <span aria-hidden="true">{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
                
                {/* Tab content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <form ref={formRef} onSubmit={handleSave} className="h-full">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                      >
                        {activeTab === 'profile' && (
                          <div id="tabpanel-profile" role="tabpanel" aria-labelledby="tab-profile">
                            <ProfileForm
                              profile={profile}
                              onUpdate={updateProfile}
                              loading={loading}
                              error={error}
                            />
                          </div>
                        )}
                        {activeTab === 'personalization' && (
                          <div id="tabpanel-personalization" role="tabpanel" aria-labelledby="tab-personalization">
                            <PersonalizationForm
                              profile={profile}
                              onUpdate={updateProfile}
                              loading={loading}
                              error={error}
                            />
                          </div>
                        )}
                        {activeTab === 'connections' && (
                          <div id="tabpanel-connections" role="tabpanel" aria-labelledby="tab-connections">
                            <ConnectionsForm
                              profile={profile}
                              onUpdate={updateProfile}
                              loading={loading}
                              error={error}
                            />
                          </div>
                        )}
                        {activeTab === 'privacy' && (
                          <div id="tabpanel-privacy" role="tabpanel" aria-labelledby="tab-privacy">
                            <PrivacyForm
                              profile={profile}
                              onUpdate={updateProfile}
                              loading={loading}
                              error={error}
                            />
                          </div>
                        )}
                        {activeTab === 'notifications' && (
                          <div id="tabpanel-notifications" role="tabpanel" aria-labelledby="tab-notifications">
                            <NotificationsForm
                              profile={profile}
                              onUpdate={updateProfile}
                              loading={loading}
                              error={error}
                            />
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </form>
                </div>
              </Tabs.Root>
            </div>
            
            {/* Preview panel */}
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="hidden lg:block w-1/3 border-l border-purple-500/20 bg-[#0f0319]/50"
              >
                <ProfilePreview profile={profile} />
              </motion.div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
