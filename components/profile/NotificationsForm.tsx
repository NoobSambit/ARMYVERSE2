'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Bell, Mail, Clock, MessageSquare, Music, BarChart3, Zap } from 'lucide-react'

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
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Australia/Sydney'
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
    <div className="space-y-8">
      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
        >
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Delivery Channels */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Delivery Channels</h3>
        </div>
        
        <p className="text-sm text-gray-400">
          Choose how you want to receive notifications
        </p>
        
        <div className="space-y-4">
          {/* In-App Notifications */}
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-purple-400" />
              <div>
                <h4 className="text-white font-medium">In-App Notifications</h4>
                <p className="text-gray-400 text-sm">
                  Show notifications within ARMYVERSE
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleChannelChange('inApp', !profile.notifications?.channels?.inApp)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                profile.notifications?.channels?.inApp ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  profile.notifications?.channels?.inApp ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-purple-400" />
              <div>
                <h4 className="text-white font-medium">Email Notifications</h4>
                <p className="text-gray-400 text-sm">
                  Send notifications to your email address
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleChannelChange('email', !profile.notifications?.channels?.email)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                profile.notifications?.channels?.email ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  profile.notifications?.channels?.email ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Quiet Hours</h3>
        </div>
        
        <div className="p-4 bg-black/20 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Enable Quiet Hours</h4>
              <p className="text-gray-400 text-sm">
                Pause notifications during specific hours
              </p>
            </div>
            <button
              type="button"
              onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                quietHoursEnabled ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  quietHoursEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {quietHoursEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quietStart" className="block text-sm font-medium text-gray-300 mb-2">
                    Start Time
                  </label>
                  <input
                    id="quietStart"
                    type="time"
                    value={profile.notifications?.quietHours?.start || ''}
                    onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label htmlFor="quietEnd" className="block text-sm font-medium text-gray-300 mb-2">
                    End Time
                  </label>
                  <input
                    id="quietEnd"
                    type="time"
                    value={profile.notifications?.quietHours?.end || ''}
                    onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="quietTimezone" className="block text-sm font-medium text-gray-300 mb-2">
                  Timezone
                </label>
                <select
                  id="quietTimezone"
                  value={profile.notifications?.quietHours?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                  onChange={(e) => handleQuietHoursChange('timezone', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700 text-white focus:border-purple-500 focus:outline-none transition-colors"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Notification Categories */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Notification Types</h3>
        </div>
        
        <div className="space-y-6">
          {NOTIFICATION_CATEGORIES.map((category) => {
            const Icon = category.icon
            
            return (
              <div key={category.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-purple-400" />
                  <div>
                    <h4 className="text-white font-medium">{category.name}</h4>
                    <p className="text-gray-400 text-sm">{category.description}</p>
                  </div>
                </div>
                
                <div className="space-y-3 ml-8">
                  {category.fields.map((field) => {
                    const catKey = category.id as 'blog' | 'playlists' | 'spotify'
                    const isEnabled = (profile.notifications?.[catKey] as Record<string, boolean> | undefined)?.[field.id] ?? true
                    
                    return (
                      <div
                        key={field.id}
                        className="flex items-center justify-between p-3 bg-black/20 rounded-xl"
                      >
                        <div>
                          <h5 className="text-white text-sm font-medium">{field.name}</h5>
                          <p className="text-gray-400 text-xs">{field.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCategoryChange(catKey, field.id, !isEnabled)}
                          className={`relative w-10 h-5 rounded-full transition-colors ${
                            isEnabled ? 'bg-purple-600' : 'bg-gray-700'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                              isEnabled ? 'translate-x-5' : 'translate-x-0.5'
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

      {/* Notification Summary */}
      <div className="p-4 bg-gray-800/50 rounded-xl">
        <h4 className="text-white font-medium mb-3">Notification Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${profile.notifications?.channels?.inApp ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span className="text-gray-300">In-App</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${profile.notifications?.channels?.email ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span className="text-gray-300">Email</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${quietHoursEnabled ? 'bg-yellow-500' : 'bg-gray-500'}`} />
            <span className="text-gray-300">Quiet Hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${(['blog','playlists','spotify'] as Array<'blog'|'playlists'|'spotify'>).some((k) => {
              const cat = profile.notifications?.[k] as Record<string, boolean> | undefined
              return !!cat && Object.values(cat).some((v) => v === true)
            }) ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span className="text-gray-300">Active Types</span>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <h4 className="text-blue-300 font-medium mb-2">Notification Tips</h4>
        <ul className="text-blue-300/80 text-sm space-y-1">
          <li>• Quiet hours pause all notifications during the specified time</li>
          <li>• In-app notifications appear in your ARMYVERSE dashboard</li>
          <li>• Email notifications are sent to your registered email address</li>
          <li>• You can customize each notification type independently</li>
        </ul>
      </div>
    </div>
  )
}
