'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Shield, Eye, Users, Lock, AlertTriangle, Download, Trash2, UserX, Check } from 'lucide-react'
import { track } from '@/lib/utils/analytics'
import { useAuth } from '@/contexts/AuthContext'
import { getAuthToken } from '@/lib/auth/token'

type FieldVisibilityKey = 'bias' | 'era' | 'socials' | 'stats'

interface ProfilePrivacySettings {
  privacy?: {
    visibility?: 'public' | 'followers' | 'private'
    fieldVisibility?: Partial<Record<FieldVisibilityKey, boolean>>
    explicitContentFilter?: boolean
    allowMentions?: boolean
    allowDMs?: boolean
    blockedUserIds?: string[]
  }
}

interface PrivacyFormProps {
  profile: ProfilePrivacySettings
  onUpdate: (updates: Partial<Pick<ProfilePrivacySettings, 'privacy'>>) => void
  loading?: boolean
  error: string | null
  onError?: (message: string | null) => void
}

const VISIBILITY_OPTIONS = [
  { id: 'public', name: 'Public', description: 'Anyone can view your profile', icon: Eye },
  { id: 'followers', name: 'Followers Only', description: 'Only your followers can view your profile', icon: Users },
  { id: 'private', name: 'Private', description: 'Only you can view your profile', icon: Lock }
]

const FIELD_VISIBILITY_OPTIONS: Array<{ id: FieldVisibilityKey; name: string; description: string }> = [
  { id: 'bias', name: 'Bias & Era', description: 'Your favorite members and eras' },
  { id: 'socials', name: 'Social Links', description: 'Your connected social media accounts' },
  { id: 'stats', name: 'Activity Stats', description: 'Your playlists, likes, and saves count' }
]

export default function PrivacyForm({ profile, onUpdate, error, onError }: PrivacyFormProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { user } = useAuth()

  const handleInputChange = useCallback((field: string, value: string | boolean | string[]) => {
    onUpdate({
      privacy: {
        ...profile.privacy,
        [field]: value
      }
    })
  }, [onUpdate, profile.privacy])

  const handleFieldVisibilityChange = useCallback((field: FieldVisibilityKey, visible: boolean) => {
    onUpdate({
      privacy: {
        ...profile.privacy,
        fieldVisibility: {
          ...profile.privacy?.fieldVisibility,
          [field]: visible
        }
      }
    })
  }, [onUpdate, profile.privacy])

  const handleExportData = useCallback(async () => {
    setExporting(true)
    onError?.(null)
    try {
      if (!user) throw new Error('You must be signed in to export data.')

      const token = await getAuthToken(user)
      const response = await fetch('/api/user/export-data', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `armyverse-data-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        await track('data_exported', { format: 'json' })
      } else {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to export data')
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to export data')
    } finally {
      setExporting(false)
    }
  }, [user, onError])

  const handleDeleteAccount = useCallback(async () => {
    if (deleteConfirmText !== 'DELETE') return
    if (!user) {
      onError?.('You must be signed in to delete your account.')
      return
    }

    setDeleting(true)
    onError?.(null)

    try {
      await track('account_deletion_initiated', {})
      const token = await getAuthToken(user)
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        window.location.href = '/'
        return
      }

      const body = await response.json().catch(() => ({}))
      throw new Error(body.error || 'Failed to delete account')
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }, [deleteConfirmText, user, onError])

  const isDeleteEnabled = deleteConfirmText === 'DELETE'

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
           Privacy & Safety
         </h2>
         <p className="text-xs sm:text-sm text-gray-400 mt-1">Manage who can see your profile and data.</p>
      </div>

      {/* Profile Visibility */}
      <div className="bg-[#151518] rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 overflow-hidden p-5 sm:p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Profile Visibility</h3>
        </div>
        
        <div className="space-y-3">
          {VISIBILITY_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = profile.privacy?.visibility === option.id
            
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleInputChange('visibility', option.id)}
                className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-900/10'
                    : 'border-white/5 hover:border-white/10 bg-black/20 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-400' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{option.name}</h4>
                    <p className="text-gray-400 text-xs font-medium mt-0.5">{option.description}</p>
                  </div>
                  {isSelected && (
                    <div className="ml-auto bg-purple-500 p-1 rounded-full">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Field-Level Visibility */}
      <div className="bg-[#151518] rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 overflow-hidden p-5 sm:p-6 md:p-8">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Field Visibility</h3>
        </div>
        
        <p className="text-sm text-gray-400 mb-6 font-medium">
          Control which specific fields are visible on your public profile
        </p>
        
        <div className="space-y-3">
          {FIELD_VISIBILITY_OPTIONS.map((option) => {
            const isVisible = profile.privacy?.fieldVisibility?.[option.id] ?? true
            
            return (
              <div key={option.id} className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <div>
                  <h4 className="text-white font-bold text-sm">{option.name}</h4>
                  <p className="text-gray-400 text-xs font-medium mt-0.5">{option.description}</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleFieldVisibilityChange(option.id, !isVisible)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    isVisible ? 'bg-purple-600' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${
                      isVisible ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Content & Communication */}
      <div className="bg-[#151518] rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 overflow-hidden p-5 sm:p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Content & Communication</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5">
            <div>
              <h4 className="text-white font-bold text-sm">Explicit Content Filter</h4>
              <p className="text-gray-400 text-xs font-medium mt-0.5">Hide explicit content in playlists</p>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('explicitContentFilter', !profile.privacy?.explicitContentFilter)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                profile.privacy?.explicitContentFilter ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${
                  profile.privacy?.explicitContentFilter ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5">
            <div>
              <h4 className="text-white font-bold text-sm">Allow Mentions</h4>
              <p className="text-gray-400 text-xs font-medium mt-0.5">Let users mention you in posts</p>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('allowMentions', !profile.privacy?.allowMentions)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                profile.privacy?.allowMentions ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${
                  profile.privacy?.allowMentions ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5">
            <div>
              <h4 className="text-white font-bold text-sm">Allow Direct Messages</h4>
              <p className="text-gray-400 text-xs font-medium mt-0.5">Let users send you direct messages</p>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('allowDMs', !profile.privacy?.allowDMs)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                profile.privacy?.allowDMs ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${
                  profile.privacy?.allowDMs ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Blocked Users */}
      <div className="bg-[#151518] rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 overflow-hidden p-5 sm:p-6 md:p-8">
        <div className="flex items-center gap-2 mb-2">
          <UserX className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Blocked Users</h3>
        </div>
        
        <p className="text-gray-400 text-sm mb-4 font-medium">
          Manage users you&apos;ve blocked from interacting with you
        </p>
          
        {profile.privacy?.blockedUserIds && profile.privacy.blockedUserIds.length > 0 ? (
          <div className="space-y-2">
            {profile.privacy.blockedUserIds.map((userId: string) => (
              <div key={userId} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                <span className="text-gray-300 text-sm font-bold">{userId}</span>
                <button
                  type="button"
                  onClick={() => {
                    const newBlocked = (profile.privacy?.blockedUserIds || []).filter((id: string) => id !== userId)
                    handleInputChange('blockedUserIds', newBlocked)
                  }}
                  className="text-red-400 hover:text-red-300 text-xs font-bold px-4 py-1.5 bg-red-500/10 rounded-xl transition-colors uppercase tracking-wide"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-black/20 rounded-2xl text-center text-gray-500 text-sm font-medium border border-white/5">
            No blocked users
          </div>
        )}
      </div>

      {/* Data Controls */}
      <div className="bg-[#151518] rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 overflow-hidden p-5 sm:p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Download className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Data Controls</h3>
        </div>
        
        <div className="space-y-4">
          {/* Export Data */}
          <div className="p-6 bg-black/20 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold text-sm">Download Your Data</h4>
                <p className="text-gray-400 text-xs font-medium mt-0.5">Export all your profile data</p>
              </div>
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 rounded-xl transition-colors text-xs font-bold uppercase tracking-wide"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>
          
          {/* Delete Account */}
          <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
            <div className="space-y-4">
              <div>
                <h4 className="text-red-400 font-bold">Delete Account</h4>
                <p className="text-gray-400 text-sm font-medium mt-1">
                  Permanently delete your account. This cannot be undone.
                </p>
              </div>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded-xl transition-colors text-xs font-bold uppercase tracking-wide"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Preparing...' : 'Delete Account'}
                </button>
              ) : (
                <div className="space-y-4 p-5 bg-black/40 rounded-2xl border border-red-500/20">
                  <div>
                    <label htmlFor="deleteConfirm" className="block text-xs font-bold text-red-300 mb-2 uppercase tracking-wider">
                      Type &quot;DELETE&quot; to confirm
                    </label>
                    <input
                      id="deleteConfirm"
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-2xl bg-black/40 border border-red-900/50 text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition-colors font-mono text-sm"
                      placeholder="DELETE"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={!isDeleteEnabled || deleting}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl transition-colors text-xs font-bold uppercase tracking-wide"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeleteConfirmText('')
                      }}
                      className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors text-xs font-bold uppercase tracking-wide"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
