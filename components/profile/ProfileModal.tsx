'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { X, Save, Eye, EyeOff, Link as LinkIcon, User, Palette, Link, Shield, Bell, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { track } from '@/lib/utils/analytics'
import { getDefaultProfile } from '@/lib/utils/profile'
import { getAuthToken } from '@/lib/auth/token'
import { signOut, clearStoredAuth } from '@/lib/firebase/auth'
import { type AnyBackgroundStyleId } from './backgroundStyles'
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
    backgroundStyle: AnyBackgroundStyleId
    badgeStyle: 'minimal' | 'collectible'
  }
  privacy: {
    visibility?: 'public' | 'followers' | 'private'
    fieldVisibility?: Partial<Record<'bias' | 'era' | 'socials' | 'stats', boolean>>
    explicitContentFilter?: boolean
    allowMentions?: boolean
    allowDMs?: boolean
    blockedUserIds?: string[]
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
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'personalization', label: 'Personalization', icon: Palette },
  { id: 'connections', label: 'Connections', icon: Link },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell }
]

export default function ProfileModal({ trigger, defaultTab = 'profile' }: ProfileModalProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(true) // Default to true for desktop
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
      const token = await getAuthToken(user)
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to load profile')
      }

      const { profile: profileData } = await response.json()
      const mergedProfile = profileData || getDefaultProfile()
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
      const token = await getAuthToken(user)
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

    // Auto-save for certain fields
    const autoSaveFields = ['personalization', 'privacy', 'notifications']
    const shouldAutoSave = Object.keys(updates).some(key =>
      autoSaveFields.some(field => key.startsWith(field) || key === field)
    )

    if (shouldAutoSave) {
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

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      // Track logout event (ignore if event name is not defined)
      try {
        await track('profile_logout' as any, { source: 'profile_modal' })
      } catch { }

      // Sign out based on auth type
      if (user?.authType === 'firebase') {
        await signOut()
      } else {
        clearStoredAuth()
      }

      setOpen(false)
      // Redirect to home page
      window.location.href = '/'
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }, [user])

  // Initial load
  useEffect(() => {
    if (open && user) {
      loadProfile()
      track('profile_opened', { tab: activeTab })
    }
  }, [open, user, loadProfile, activeTab])

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setIsDirty(false)
      setError(null)
    }
  }, [open])

  // Clean up timeout
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
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />

        <Dialog.Content
          className="fixed z-50 top-[2%] left-[2%] right-[2%] bottom-[2%] max-w-[1600px] mx-auto rounded-[2.5rem] border border-white/10 bg-[#0A0A0A] shadow-2xl overflow-hidden focus:outline-none flex flex-col md:flex-row animate-in zoom-in-95 duration-200"
          aria-labelledby="profile-modal-title"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Left Column - Settings */}
          <div className="flex-1 flex flex-col min-w-0 h-full md:border-r border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between p-8 pb-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/20 rounded-2xl">
                    <User className="w-5 h-5 text-purple-400" />
                  </div>
                  <Dialog.Title id="profile-modal-title" className="text-2xl font-bold text-white tracking-tight">
                    Your Profile
                  </Dialog.Title>
                </div>
                {isDirty && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider ml-14 mt-1"
                  >
                    <AlertIcon className="w-3 h-3" />
                    Unsaved changes
                  </motion.div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-colors md:hidden"
                >
                  {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>

                <button
                  onClick={copyProfileLink}
                  className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-colors"
                  title="Copy Profile Link"
                >
                  <LinkIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={handleLogout}
                  className="p-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>

                <div className="w-px h-8 bg-white/10 mx-1" />

                <Dialog.Close className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl font-bold text-sm transition-colors">
                  Close
                </Dialog.Close>

                <button
                  onClick={handleSave}
                  disabled={saving || !isDirty}
                  className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm shadow-lg shadow-purple-900/20"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </div>

            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <div className="px-8 pt-2 pb-6">
                <Tabs.List className="flex gap-2 p-1.5 bg-white/5 rounded-2xl overflow-x-auto no-scrollbar" role="tablist">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <Tabs.Trigger
                        key={tab.id}
                        value={tab.id}
                        className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-gray-400 rounded-xl transition-all
                          hover:text-white hover:bg-white/5
                          data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="whitespace-nowrap">{tab.label}</span>
                      </Tabs.Trigger>
                    )
                  })}
                </Tabs.List>
              </div>

              <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                <form ref={formRef} onSubmit={handleSave} className="max-w-4xl mx-auto w-full py-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Tabs.Content value="profile" className="outline-none">
                        <ProfileForm
                          profile={profile}
                          onUpdate={updateProfile}
                          loading={loading}
                          error={error}
                        />
                      </Tabs.Content>

                      <Tabs.Content value="personalization" className="outline-none">
                        <PersonalizationForm
                          profile={profile}
                          onUpdate={updateProfile}
                          loading={loading}
                          error={error}
                        />
                      </Tabs.Content>

                      <Tabs.Content value="connections" className="outline-none">
                        <ConnectionsForm
                          profile={profile}
                          onUpdate={updateProfile}
                          loading={loading}
                          error={error}
                        />
                      </Tabs.Content>

                      <Tabs.Content value="privacy" className="outline-none">
                        <PrivacyForm
                          profile={profile}
                          onUpdate={updateProfile}
                          loading={loading}
                          error={error}
                        />
                      </Tabs.Content>

                      <Tabs.Content value="notifications" className="outline-none">
                        <NotificationsForm
                          profile={profile}
                          onUpdate={updateProfile}
                          loading={loading}
                          error={error}
                        />
                      </Tabs.Content>
                    </motion.div>
                  </AnimatePresence>
                </form>
              </div>
            </Tabs.Root>
          </div>

          {/* Right Column - Preview */}
          {showPreview && (
            <div className="w-full md:w-[480px] lg:w-[520px] bg-[#0F0F11] border-l border-white/10 flex flex-col h-full absolute md:relative z-20 md:z-auto inset-0 md:inset-auto">
              {/* Mobile Close Preview */}
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full md:hidden z-30"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-[#0F0F11]">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preview</h3>
                <div className="px-3 py-1.5 bg-white/5 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-wider border border-white/10">
                  Public View
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-[#0F0F11] custom-scrollbar flex flex-col">
                <div className="flex-1 flex items-center justify-center min-h-[500px]">
                  <ProfilePreview profile={profile} variant="sidebar" />
                </div>

                <div className="mt-8 flex gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                  <div className="shrink-0 pt-0.5">
                    <AlertIcon className="w-4 h-4 text-yellow-500" />
                  </div>
                  <p className="text-xs text-yellow-200/80 leading-relaxed font-medium">
                    This preview shows how your profile appears to public users. Some private info may be hidden based on your privacy settings.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
