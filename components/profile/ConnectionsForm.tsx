'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect, useCallback } from 'react'
import { Music, Twitter, Instagram, Youtube, Globe, Link as LinkIcon, Eye, EyeOff, Check, X, AlertCircle, RefreshCw, LogOut, Settings, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatSocialUrl, extractSocialHandle, validateUrl } from '@/lib/utils/profile'
import { track } from '@/lib/utils/analytics'
import { useAuth } from '@/contexts/AuthContext'
import { getAuthToken } from '@/lib/auth/token'

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

interface SpotifyStatusData {
  connected: boolean
  loading: boolean
  error?: string
  scopes?: string[]
  displayName?: string
  avatarUrl?: string
  mode?: 'byo' | 'standard'
  needsReauth?: boolean
  errorReason?: string
  message?: string
  hasByoCredentials?: boolean
  tokenHealth?: string
  tokenAge?: number
}

const SOCIAL_PLATFORMS = [
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, placeholder: 'https://twitter.com/username' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@username' },
  { id: 'website', name: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' }
]

const SCOPE_TAGS: Record<string, string> = {
  'user-read-private': 'USER READ PRIVATE',
  'user-read-email': 'EMAIL',
  'user-read-currently-playing': 'CURRENT PLAYING',
  'user-read-playback-state': 'PLAYBACK STATE',
  'user-top-read': 'TOP ITEMS',
  'playlist-read-private': 'PLAYLIST PRIVATE',
  'playlist-modify-public': 'PLAYLIST PUBLIC',
  'playlist-modify-private': 'PLAYLIST PRIVATE'
}

export default function ConnectionsForm({ profile, onUpdate, error }: ConnectionsFormProps) {
  const { user } = useAuth()
  const [spotifyStatus, setSpotifyStatus] = useState<SpotifyStatusData>({
    connected: false,
    loading: true
  })

  const [byo, setByo] = useState<{
    clientId: string
    clientSecret: string
    busy: boolean
    error?: string
    success?: string
  }>({
    clientId: '',
    clientSecret: '',
    busy: false
  })

  const [urlErrors, setUrlErrors] = useState<Record<string, string>>({})
  const [disconnecting, setDisconnecting] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)

  // Check Spotify connection status
  const checkSpotifyStatus = useCallback(async () => {
    if (!user) {
      setSpotifyStatus(prev => ({ ...prev, connected: false, loading: false, error: 'Sign in required' }))
      return
    }

    try {
      setSpotifyStatus(prev => ({ ...prev, loading: true }))
      const token = await getAuthToken(user)
      const response = await fetch('/api/spotify/status', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setSpotifyStatus({
          connected: !!data.connected,
          loading: false,
          scopes: data.scopes || [],
          displayName: data.displayName,
          avatarUrl: data.avatarUrl,
          mode: data.mode,
          needsReauth: data.needsReauth,
          errorReason: data.errorReason,
          message: data.message,
          hasByoCredentials: data.hasByoCredentials,
          tokenHealth: data.tokenHealth,
          tokenAge: data.tokenAge,
          error: data.connected ? undefined : (data.message || 'Not connected')
        })
      } else {
        setSpotifyStatus({ connected: false, loading: false, error: 'Failed to fetch status' })
      }
    } catch (err) {
      setSpotifyStatus({ connected: false, loading: false, error: 'Failed to check connection' })
    }
  }, [user])

  useEffect(() => {
    checkSpotifyStatus()
  }, [checkSpotifyStatus])

  // BYO Submit - Initiate OAuth flow with user's own credentials
  const submitBYO = useCallback(async () => {
    if (!user) return
    setByo(prev => ({ ...prev, busy: true, error: undefined, success: undefined }))
    try {
      const token = await getAuthToken(user)
      const response = await fetch('/api/spotify/client-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          clientId: byo.clientId.trim(),
          clientSecret: byo.clientSecret.trim() || undefined
        })
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to prepare Spotify authorization')
      }
      const { url } = await response.json()
      await track('connection_byo_started' as any, { platform: 'spotify' })
      window.location.href = url
    } catch (e) {
      setByo(prev => ({ ...prev, error: e instanceof Error ? e.message : 'Failed to start authorization' }))
    } finally {
      setByo(prev => ({ ...prev, busy: false }))
    }
  }, [user, byo.clientId, byo.clientSecret])

  // Reconnect BYO - Re-authorize using existing stored credentials
  const reconnectBYO = useCallback(async () => {
    if (!user) return
    setReconnecting(true)
    try {
      const token = await getAuthToken(user)
      // Initiate re-authorization with stored BYO credentials
      const response = await fetch('/api/spotify/reconnect-byo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to prepare reconnection')
      }

      const { url } = await response.json()
      await track('connection_byo_reconnect' as any, { platform: 'spotify' })
      window.location.href = url
    } catch (err) {
      console.error('Failed to reconnect Spotify BYO:', err)
      setSpotifyStatus(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to reconnect'
      }))
    } finally {
      setReconnecting(false)
    }
  }, [user])

  // Disconnect BYO
  const disconnectBYO = useCallback(async () => {
    if (!user) return
    setDisconnecting(true)
    try {
      const token = await getAuthToken(user)
      const response = await fetch('/api/spotify/disconnect-byo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        await track('connection_disconnected', { platform: 'spotify-byo' })
        // Refresh status from server to ensure UI is in sync
        await checkSpotifyStatus()
      } else {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to disconnect')
      }
    } catch (err) {
      console.error('Failed to disconnect Spotify BYO:', err)
      setSpotifyStatus(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Disconnect failed'
      }))
    } finally {
      setDisconnecting(false)
    }
  }, [user, checkSpotifyStatus])

  const handleInputChange = useCallback((field: string, value: string) => {
    onUpdate({
      socials: {
        ...profile.socials,
        [field]: value
      }
    })
  }, [onUpdate, profile.socials])

  const handleUrlChange = useCallback((platform: string, url: string) => {
    setUrlErrors(prev => ({ ...prev, [platform]: '' }))
    if (!url) {
      handleInputChange(platform, '')
      return
    }
    const validation = validateUrl(url)
    if (!validation.isValid) {
      setUrlErrors(prev => ({ ...prev, [platform]: validation.error || 'Invalid URL' }))
      return
    }
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

  // Standard Spotify connect (owner app)
  const connectSpotify = useCallback(async () => {
    if (!user) return
    setReconnecting(true)
    try {
      const token = await getAuthToken(user)
      const response = await fetch('/api/spotify/auth-url', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const { url } = await response.json()
        await track('connection_connected', { platform: 'spotify' })
        window.location.href = url
      }
    } catch (err) {
      console.error('Failed to get Spotify auth URL:', err)
    } finally {
      setReconnecting(false)
    }
  }, [user])

  // Disconnect standard Spotify
  const disconnectSpotify = useCallback(async () => {
    if (!user) return
    setDisconnecting(true)
    try {
      const token = await getAuthToken(user)
      const response = await fetch('/api/spotify/disconnect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        await track('connection_disconnected', { platform: 'spotify' })
        // Refresh status to ensure UI sync
        await checkSpotifyStatus()
      } else {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to disconnect')
      }
    } catch (err) {
      console.error('Failed to disconnect Spotify:', err)
      setSpotifyStatus(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Disconnect failed'
      }))
    } finally {
      setDisconnecting(false)
    }
  }, [user, checkSpotifyStatus])

  // Smart reconnect: uses BYO credentials if available, otherwise standard
  const handleReconnect = useCallback(() => {
    if (spotifyStatus.mode === 'byo' || spotifyStatus.hasByoCredentials) {
      reconnectBYO()
    } else {
      connectSpotify()
    }
  }, [spotifyStatus.mode, spotifyStatus.hasByoCredentials, reconnectBYO, connectSpotify])

  // Smart disconnect: uses BYO disconnect if in BYO mode
  const handleDisconnect = useCallback(() => {
    if (spotifyStatus.mode === 'byo') {
      disconnectBYO()
    } else {
      disconnectSpotify()
    }
  }, [spotifyStatus.mode, disconnectBYO, disconnectSpotify])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Connections
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Manage your external accounts and social links for your profile.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Spotify Integration Card */}
      <div className="bg-[#151518] rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/10 rounded-xl">
              <Music className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Spotify Integration</h3>
          </div>

          <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
            {spotifyStatus.loading ? (
              <div className="flex items-center gap-3 text-gray-400 font-medium">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Checking status...</span>
              </div>
            ) : spotifyStatus.connected ? (
              // Connected state
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-green-900/20">
                    {spotifyStatus.displayName?.[0]?.toUpperCase() || 'S'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white">Connected to Spotify</h4>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                    <p className="text-sm text-gray-400">
                      Logged in as <span className="text-white font-medium">{spotifyStatus.displayName || 'User'}</span>
                    </p>

                    {/* Scopes Badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(spotifyStatus.scopes || []).slice(0, 3).map(scope => (
                        <span key={scope} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                          {SCOPE_TAGS[scope] || 'ACCESS'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={handleReconnect}
                    disabled={reconnecting}
                    className="flex-1 md:flex-none px-5 py-2.5 bg-[#2E2E32] hover:bg-[#3E3E42] disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    {reconnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Reconnecting...
                      </>
                    ) : (
                      'Reconnect'
                    )}
                  </button>
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="flex-1 md:flex-none px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    {disconnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      'Disconnect'
                    )}
                  </button>
                </div>
              </div>
            ) : spotifyStatus.needsReauth ? (
              // Needs re-authorization state (token expired/revoked)
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-yellow-400 mb-1">Connection Issue</h4>
                    <p className="text-sm text-yellow-200/80">{spotifyStatus.message || 'Your Spotify connection needs to be refreshed.'}</p>
                    {spotifyStatus.displayName && (
                      <p className="text-xs text-gray-400 mt-2">Previously connected as: {spotifyStatus.displayName}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleReconnect}
                    disabled={reconnecting}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    {reconnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Reconnecting...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Reconnect Now
                      </>
                    )}
                  </button>
                  {(spotifyStatus.mode === 'byo' || spotifyStatus.hasByoCredentials) && (
                    <button
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                      className="px-5 py-3 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold transition-colors"
                    >
                      {disconnecting ? 'Removing...' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Not connected state
              <div className="text-center py-6">
                <p className="text-gray-400 mb-6 font-medium">Connect to show your listening activity and favorites.</p>
                <button
                  onClick={connectSpotify}
                  disabled={reconnecting}
                  className="px-8 py-3.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-2xl font-bold shadow-lg shadow-green-900/20 transition-all flex items-center gap-2 mx-auto uppercase tracking-wide text-sm"
                >
                  {reconnecting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Music className="w-5 h-5" />
                      Connect Spotify
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BYOA Card */}
      <div className="bg-[#151518] rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <Settings className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Bring Your Own App</h3>
            {spotifyStatus.mode === 'byo' && spotifyStatus.connected && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-lg flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Active
              </span>
            )}
          </div>

          <p className="text-sm text-gray-400 mb-8 leading-relaxed font-medium">
            Using your own Spotify Developer App credentials provides higher rate limits and stability for your profile widgets.
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Client ID</label>
                <input
                  type="text"
                  value={byo.clientId}
                  onChange={(e) => setByo(prev => ({ ...prev, clientId: e.target.value, error: undefined }))}
                  placeholder="Paste your Spotify Client ID"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Client Secret</label>
                <input
                  type="password"
                  value={byo.clientSecret}
                  onChange={(e) => setByo(prev => ({ ...prev, clientSecret: e.target.value, error: undefined }))}
                  placeholder="Paste your Spotify Client Secret"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors font-mono"
                />
              </div>
            </div>

            {byo.error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-300 font-medium">{byo.error}</span>
              </div>
            )}

            {byo.success && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm text-green-300 font-medium">{byo.success}</span>
              </div>
            )}

            <button
              onClick={submitBYO}
              disabled={byo.busy || !byo.clientId}
              className="w-full py-3.5 bg-[#2E2E32] hover:bg-[#3E3E42] disabled:opacity-50 text-white rounded-2xl font-bold transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
            >
              {byo.busy ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Preparing Authorization...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4" />
                  Connect Personal App
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Social Links (Simplified to list styling) */}
      <div className="bg-[#151518] rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="p-8">
          <h3 className="text-lg font-bold text-white mb-6">Social Links</h3>
          <div className="space-y-5">
            {SOCIAL_PLATFORMS.map(platform => {
              const Icon = platform.icon
              const currentUrl = typeof profile.socials?.[platform.id] === 'string' ? profile.socials[platform.id] as string : ''
              const isVisible = profile.socials?.visibility?.[platform.id] ?? true
              const hasError = urlErrors[platform.id]

              return (
                <div key={platform.id} className="flex items-start gap-4">
                  <div className="mt-3.5 text-gray-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={currentUrl}
                        onChange={(e) => handleUrlChange(platform.id, e.target.value)}
                        placeholder={platform.placeholder}
                        className={`w-full bg-black/40 border ${hasError ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors font-medium`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          onClick={() => handleVisibilityChange(platform.id, !isVisible)}
                          className={`p-2 rounded-xl transition-colors ${isVisible ? 'text-purple-400 bg-purple-500/10' : 'text-gray-500 hover:text-gray-400'}`}
                          title={isVisible ? 'Visible on profile' : 'Hidden from profile'}
                        >
                          {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {hasError && <p className="text-xs text-red-400 font-medium">{hasError}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
