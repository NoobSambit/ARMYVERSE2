'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getAuthToken } from '@/lib/auth/token'

interface SpotifyStatusResponse {
  connected: boolean
  displayName?: string
  spotifyUserId?: string
  scopes?: string[]
  accessToken?: string
  expiresAt?: string | null
  lastUpdated?: string | null
}

export function useSpotifyAuth() {
  const { user } = useAuth()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<SpotifyStatusResponse | null>(null)

  const fetchStatus = useCallback(async (): Promise<SpotifyStatusResponse | null> => {
    if (!user) {
      setIsAuthenticated(false)
      setStatus(null)
      setIsLoading(false)
      return null
    }

    try {
      setIsLoading(true)
      const token = await getAuthToken(user)
      const response = await fetch('/api/spotify/status', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        setIsAuthenticated(false)
        setStatus(null)
        return null
      }

      const data = await response.json() as SpotifyStatusResponse
      setIsAuthenticated(!!data.connected)
      setStatus(data)
      return data
    } catch (error) {
      console.error('Error checking Spotify auth status:', error)
      setIsAuthenticated(false)
      setStatus(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const authResult = params.get('auth')
    const authError = params.get('error')

    if (authResult === 'success') {
      fetchStatus()
      params.delete('auth')
      params.delete('error')
      const nextQuery = params.toString()
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`
      window.history.replaceState({}, document.title, nextUrl)
    } else if (authError) {
      setIsAuthenticated(false)
      setStatus(null)
      params.delete('auth')
      params.delete('error')
      const nextQuery = params.toString()
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`
      window.history.replaceState({}, document.title, nextUrl)
    }
  }, [fetchStatus])

  const disconnect = useCallback(async () => {
    if (!user) {
      setIsAuthenticated(false)
      setStatus(null)
      return
    }

    try {
      const token = await getAuthToken(user)
      const response = await fetch('/api/spotify/disconnect', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect Spotify')
      }
    } catch (error) {
      console.error('Error disconnecting Spotify:', error)
    } finally {
      setIsAuthenticated(false)
      setStatus(null)
    }
  }, [user])

  return { isAuthenticated, isLoading, disconnect, status, refreshStatus: fetchStatus }
}
 