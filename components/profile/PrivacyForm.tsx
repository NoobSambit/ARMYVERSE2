'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Shield, Eye, Users, Lock, AlertTriangle, Download, Trash2, UserX, Check } from 'lucide-react'
import { track } from '@/lib/utils/analytics'
import { useAuth } from '@/contexts/AuthContext'

type FieldVisibilityKey = 'bias' | 'socials' | 'stats'

interface PrivacyFormProps {
  profile: Record<string, unknown> & {
    privacy: {
      visibility?: string
      fieldVisibility?: Partial<Record<FieldVisibilityKey, boolean>>
      explicitContentFilter?: boolean
      allowMentions?: boolean
      allowDMs?: boolean
      blockedUserIds?: string[]
    }
  }
  onUpdate: (updates: Record<string, unknown>) => void
  loading?: boolean
  error: string | null
  onError?: (message: string | null) => void
}

const VISIBILITY_OPTIONS = [
  {
    id: 'public',
    name: 'Public',
    description: 'Anyone can view your profile',
    icon: Eye
  },
  {
    id: 'followers',
    name: 'Followers Only',
    description: 'Only your followers can view your profile',
    icon: Users
  },
  {
    id: 'private',
    name: 'Private',
    description: 'Only you can view your profile',
    icon: Lock
  }
]

const FIELD_VISIBILITY_OPTIONS: Array<{ id: FieldVisibilityKey; name: string; description: string }> = [
  {
    id: 'bias',
    name: 'Bias & Era',
    description: 'Your favorite members and eras'
  },
  {
    id: 'socials',
    name: 'Social Links',
    description: 'Your connected social media accounts'
  },
  {
    id: 'stats',
    name: 'Activity Stats',
    description: 'Your playlists, likes, and saves count'
  }
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
      if (!user) {
        throw new Error('You must be signed in to export data.')
      }

      const token = await user.getIdToken()
      const response = await fetch('/api/user/export-data', {
        headers: {
          Authorization: `Bearer ${token}`
        }
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
      const message = err instanceof Error ? err.message : 'Failed to export data'
      console.error('Export failed:', err)
      onError?.(message)
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
      const token = await user.getIdToken()
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (response.ok) {
        // Redirect to home page or show success message
        window.location.href = '/'
        return
      }

      const body = await response.json().catch(() => ({}))
      throw new Error(body.error || 'Failed to delete account')
    } catch (err) {
      console.error('Delete account failed:', err)
      onError?.(err instanceof Error ? err.message : 'Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }, [deleteConfirmText, user, onError])

  const isDeleteEnabled = deleteConfirmText === 'DELETE'

  return (
    <div className="space-y-8">
      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Profile Visibility */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Profile Visibility</h3>
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
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 hover:border-gray-600 bg-black/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-purple-400" />
                  <div>
                    <h4 className="text-white font-medium">{option.name}</h4>
                    <p className="text-gray-400 text-sm">{option.description}</p>
                  </div>
                  {isSelected && (
                    <div className="ml-auto">
                      <Check className="w-5 h-5 text-purple-400" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Field-Level Visibility */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Field Visibility</h3>
        </div>
        
        <p className="text-sm text-gray-400">
          Control which specific fields are visible on your public profile
        </p>
        
        <div className="space-y-3">
          {FIELD_VISIBILITY_OPTIONS.map((option) => {
            const isVisible = profile.privacy?.fieldVisibility?.[option.id] ?? true
            
            return (
              <div
                key={option.id}
                className="flex items-center justify-between p-4 bg-black/20 rounded-lg"
              >
                <div>
                  <h4 className="text-white font-medium">{option.name}</h4>
                  <p className="text-gray-400 text-sm">{option.description}</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleFieldVisibilityChange(option.id, !isVisible)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isVisible ? 'bg-purple-600' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      isVisible ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Content & Communication */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Content & Communication</h3>
        </div>
        
        <div className="space-y-4">
          {/* Explicit Content Filter */}
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Explicit Content Filter</h4>
              <p className="text-gray-400 text-sm">
                Hide explicit content in playlists and recommendations
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('explicitContentFilter', !profile.privacy?.explicitContentFilter)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                profile.privacy?.explicitContentFilter ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  profile.privacy?.explicitContentFilter ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {/* Allow Mentions */}
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Allow Mentions</h4>
              <p className="text-gray-400 text-sm">
                Let other users mention you in comments and posts
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('allowMentions', !profile.privacy?.allowMentions)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                profile.privacy?.allowMentions ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  profile.privacy?.allowMentions ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {/* Allow DMs */}
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Allow Direct Messages</h4>
              <p className="text-gray-400 text-sm">
                Let other users send you direct messages
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('allowDMs', !profile.privacy?.allowDMs)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                profile.privacy?.allowDMs ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  profile.privacy?.allowDMs ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Blocked Users */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <UserX className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Blocked Users</h3>
        </div>
        
        <div className="p-4 bg-black/20 rounded-lg">
          <p className="text-gray-400 text-sm mb-3">
            Manage users you&apos;ve blocked from interacting with you
          </p>
          
          {profile.privacy?.blockedUserIds && profile.privacy.blockedUserIds.length > 0 ? (
            <div className="space-y-2">
              {profile.privacy.blockedUserIds.map((userId: string) => (
                <div key={userId} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <span className="text-gray-300 text-sm">{userId}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newBlocked = (profile.privacy?.blockedUserIds || []).filter((id: string) => id !== userId)
                      handleInputChange('blockedUserIds', newBlocked)
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No blocked users</p>
          )}
        </div>
      </div>

      {/* Data Controls */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Data Controls</h3>
        </div>
        
        <div className="space-y-4">
          {/* Export Data */}
          <div className="p-4 bg-black/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Download Your Data</h4>
                <p className="text-gray-400 text-sm">
                  Export all your profile data, playlists, and preferences
                </p>
              </div>
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>
          
          {/* Delete Account */}
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="space-y-4">
              <div>
                <h4 className="text-red-400 font-medium">Delete Account</h4>
                <p className="text-gray-400 text-sm">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Preparing...' : 'Delete Account'}
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="deleteConfirm" className="block text-sm font-medium text-gray-300 mb-2">
                      Type &quot;DELETE&quot; to confirm
                    </label>
                    <input
                      id="deleteConfirm"
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-black/40 border border-gray-700 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                      placeholder="DELETE"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={!isDeleteEnabled || deleting}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeleteConfirmText('')
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
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

      {/* Privacy Notice */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <h4 className="text-yellow-300 font-medium mb-2">Privacy Notice</h4>
        <ul className="text-yellow-300/80 text-sm space-y-1">
          <li>• Your privacy settings are respected across all ARMYVERSE features</li>
          <li>• Blocked users cannot see your content or interact with you</li>
          <li>• Data exports include all your information except passwords</li>
          <li>• Account deletion is permanent and irreversible</li>
        </ul>
      </div>
    </div>
  )
}
