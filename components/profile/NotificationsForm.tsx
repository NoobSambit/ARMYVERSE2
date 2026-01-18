'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Bell, Mail, Clock, MessageSquare, Music, BarChart3, Zap, Check } from 'lucide-react'

interface NotificationsChannels { inApp?: boolean; email?: boolean }
interface NotificationsQuiet { start?: string; end?: string; timezone?: string }
interface NotificationsBlog { comments?: boolean; reactions?: boolean; saves?: boolean }
interface NotificationsPlaylists { exports?: boolean; likes?: boolean }
interface NotificationsSpotify { weeklyRecap?: boolean; recommendations?: boolean }
interface NotificationsShape {
  channels?: NotificationsChannels
  quietHours?: NotificationsQuiet
  blog?: NotificationsBlog
  playlists?: NotificationsPlaylists
  spotify?: NotificationsSpotify
}
interface ProfileNotifications { notifications?: NotificationsShape }
interface NotificationsFormProps {
  profile: ProfileNotifications
  onUpdate: (updates: any) => void
  loading?: boolean
  error?: string | null
}

const NOTIFICATION_CATEGORIES = [
  {
    id: 'blog',
    name: 'Blog & Content',
    icon: MessageSquare,
    description: 'Comments, reactions, and saves on your posts',
    fields: [
      { id: 'comments', name: 'Comments', description: 'When someone comments on your posts' },
      { id: 'reactions', name: 'Reactions', description: 'When someone reacts to your posts' },
      { id: 'saves', name: 'Saves', description: 'When someone saves your posts' }
    ]
  },
  {
    id: 'playlists',
    name: 'Playlists',
    icon: Music,
    description: 'Playlist-related notifications',
    fields: [
      { id: 'exports', name: 'Export Complete', description: 'When playlist export to Spotify is finished' },
      { id: 'likes', name: 'Likes', description: 'When someone likes your playlists' }
    ]
  },
  {
    id: 'spotify',
    name: 'Spotify Integration',
    icon: BarChart3,
    description: 'Spotify dashboard and recommendations',
    fields: [
      { id: 'weeklyRecap', name: 'Weekly Recap', description: 'Your weekly listening summary' },
      { id: 'recommendations', name: 'New Recommendations', description: 'When new music recommendations are available' }
    ]
  }
]

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Asia/Tokyo', 'Asia/Seoul', 'Asia/Shanghai', 'Australia/Sydney'
]

export default function NotificationsForm({ profile, onUpdate, error }: NotificationsFormProps) {
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false)

  const handleChannelChange = useCallback((channel: string, enabled: boolean) => {
    onUpdate({
      notifications: {
        ...profile.notifications,
        channels: {
          ...profile.notifications?.channels,
          [channel]: enabled
        }
      }
    })
  }, [onUpdate, profile.notifications])

  const handleCategoryChange = useCallback((category: 'blog' | 'playlists' | 'spotify', field: string, enabled: boolean) => {
    onUpdate({
      notifications: {
        ...profile.notifications,
        [category]: {
          ...profile.notifications?.[category],
          [field]: enabled
        }
      }
    })
  }, [onUpdate, profile.notifications])

  const handleQuietHoursChange = useCallback((field: string, value: string) => {
    onUpdate({
      notifications: {
        ...profile.notifications,
        quietHours: {
          ...profile.notifications?.quietHours,
          [field]: value
        }
      }
    })
  }, [onUpdate, profile.notifications])

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Header */}
      <div>
         <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
           Notifications
         </h2>
         <p className="text-xs sm:text-sm text-gray-400 mt-1">Control how and when you receive updates.</p>
      </div>

      {/* Delivery Channels */}
      <div className="bg-[#151518] rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 overflow-hidden p-5 sm:p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Delivery Channels</h3>
        </div>
        
        <div className="space-y-4">
          {/* In-App Notifications */}
          <div className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-purple-500/10 rounded-xl">
                <Bell className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">In-App Notifications</h4>
                <p className="text-gray-400 text-xs font-medium mt-0.5">Show notifications within ARMYVERSE</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleChannelChange('inApp', !profile.notifications?.channels?.inApp)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                profile.notifications?.channels?.inApp ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${
                  profile.notifications?.channels?.inApp ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-purple-500/10 rounded-xl">
                <Mail className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Email Notifications</h4>
                <p className="text-gray-400 text-xs font-medium mt-0.5">Send updates to your email address</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleChannelChange('email', !profile.notifications?.channels?.email)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                profile.notifications?.channels?.email ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${
                  profile.notifications?.channels?.email ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-[#151518] rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 overflow-hidden p-5 sm:p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Quiet Hours</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5">
            <div>
              <h4 className="text-white font-bold text-sm">Enable Quiet Hours</h4>
              <p className="text-gray-400 text-xs font-medium mt-0.5">Pause notifications during specific hours</p>
            </div>
            <button
              type="button"
              onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                quietHoursEnabled ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${
                  quietHoursEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {quietHoursEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-6 bg-black/20 rounded-2xl border border-white/5 space-y-5"
            >
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="quietStart" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Start Time</label>
                  <input
                    id="quietStart"
                    type="time"
                    value={profile.notifications?.quietHours?.start || ''}
                    onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-white focus:border-purple-500 focus:outline-none transition-colors font-medium"
                  />
                </div>
                <div>
                  <label htmlFor="quietEnd" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">End Time</label>
                  <input
                    id="quietEnd"
                    type="time"
                    value={profile.notifications?.quietHours?.end || ''}
                    onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-white focus:border-purple-500 focus:outline-none transition-colors font-medium"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="quietTimezone" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Timezone</label>
                <div className="relative">
                  <select
                    id="quietTimezone"
                    value={profile.notifications?.quietHours?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                    onChange={(e) => handleQuietHoursChange('timezone', e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white appearance-none focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Notification Categories */}
      <div className="bg-[#151518] rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 overflow-hidden p-5 sm:p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Notification Types</h3>
        </div>
        
        <div className="space-y-6">
          {NOTIFICATION_CATEGORIES.map((category) => {
            const Icon = category.icon
            
            return (
              <div key={category.id} className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <h4 className="text-white font-bold text-sm">{category.name}</h4>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {category.fields.map((field) => {
                    const catKey = category.id as 'blog' | 'playlists' | 'spotify'
                    const isEnabled = (profile.notifications?.[catKey] as Record<string, boolean> | undefined)?.[field.id] ?? true
                    
                    return (
                      <div key={field.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                        <div>
                          <h5 className="text-white text-sm font-bold">{field.name}</h5>
                          <p className="text-gray-400 text-xs font-medium mt-0.5">{field.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCategoryChange(catKey, field.id, !isEnabled)}
                          className={`relative w-10 h-6 rounded-full transition-colors ${
                            isEnabled ? 'bg-purple-600' : 'bg-gray-700'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                              isEnabled ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
