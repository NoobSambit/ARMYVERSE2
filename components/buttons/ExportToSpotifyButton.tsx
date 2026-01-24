'use client'

import React, { useState, useCallback } from 'react'
import { ExternalLink, Loader2, Bug } from 'lucide-react'
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth'

interface Track {
  title: string
  artist: string
  spotifyId?: string
  albumArt?: string
  spotifyUrl?: string
  duration?: number
  popularity?: number
}

interface ExportToSpotifyButtonProps {
  tracks: Track[]
  onExportSuccess?: (playlistUrl: string, fallbackReason?: string) => void
  onExportError?: (error: string) => void
}

export default function ExportToSpotifyButton({
  tracks,
  onExportSuccess,
  onExportError
}: ExportToSpotifyButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isDebugging, setIsDebugging] = useState(false)
  const { isAuthenticated, status, refreshStatus } = useSpotifyAuth()
  const isTrackEmpty = !tracks?.length
  const isExportDisabled = isExporting || isTrackEmpty

  const getValidAccessToken = useCallback(async () => {
    let accessToken = status?.accessToken

    if (!accessToken) {
      const refreshed = await refreshStatus()
      accessToken = refreshed?.accessToken
    }

    return accessToken || null
  }, [status, refreshStatus])

  const debugToken = useCallback(async () => {
    if (!isAuthenticated) {
      onExportError?.('Please connect your Spotify account first')
      return
    }

    setIsDebugging(true)

    try {
      const accessToken = await getValidAccessToken()
      if (!accessToken) {
        onExportError?.('Unable to retrieve Spotify token. Please reconnect your account.')
        return
      }

      const response = await fetch('/api/playlist/export', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const data = await response.json()

      if (response.ok && data.tokenValid) {
        onExportSuccess?.(`Token is valid! User: ${data.userData.display_name}, Scopes: ${data.scopes}`)
      } else {
        onExportError?.(`Token validation failed: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Debug error:', error)
      onExportError?.(error instanceof Error ? error.message : 'Debug failed')
    } finally {
      setIsDebugging(false)
    }
  }, [isAuthenticated, getValidAccessToken, onExportError, onExportSuccess])

  const handleExport = useCallback(async () => {
    if (!tracks || tracks.length === 0) {
      onExportError?.('No tracks to export')
      return
    }

    setIsExporting(true)

    try {
      const accessToken = await getValidAccessToken()

      // Helper to make export request
      const makeExportRequest = async (token?: string | null, useFallback: boolean = false) => {
        const requestBody = {
          name: 'AI Generated BTS Playlist',
          songs: tracks,
          fallbackToOwner: useFallback
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        }

        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        return fetch('/api/playlist/export', {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody)
        })
      }

      let response: Response
      let data: any

      if (accessToken) {
        response = await makeExportRequest(accessToken, false)
        data = await response.json()

        if (!response.ok) {
          if (response.status === 401) {
            // Try to refresh the token first
            const refreshed = await refreshStatus()
            if (refreshed?.accessToken) {
              // Retry with refreshed token
              response = await makeExportRequest(refreshed.accessToken, false)
              data = await response.json()

              if (!response.ok) {
                // If still failing, try fallback to owner
                if (response.status === 401 && data.canFallback) {
                  console.log('Token refresh succeeded but still invalid, using fallback')
                  response = await makeExportRequest(refreshed.accessToken, true)
                  data = await response.json()
                }
              }
            } else {
              // Refresh failed - use fallback with the original (expired) token
              console.log('Token refresh failed, using owner fallback')
              response = await makeExportRequest(accessToken, true)
              data = await response.json()
            }
          }

          // Check final response
          if (!response.ok) {
            throw new Error(data.error || data.details || 'Failed to export playlist')
          }
        }
      } else {
        response = await makeExportRequest(null, false)
        data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || data.details || 'Failed to export playlist')
        }
      }

      if (data.searchErrors && data.searchErrors.length > 0) {
        console.warn('Some tracks could not be found:', data.searchErrors)
      }

      // If fallback was used, we should notify the user through the success message
      if (data.usedFallback && data.fallbackReason) {
        // Still call success with the URL, but the parent can show a warning
        onExportSuccess?.(data.playlistUrl, data.fallbackReason)
      } else if (data.mode === 'owner') {
        onExportSuccess?.(data.playlistUrl, 'Playlist created in the Armyverse Spotify account.')
      } else {
        onExportSuccess?.(data.playlistUrl)
      }
    } catch (error) {
      console.error('Error exporting playlist:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to export playlist'
      onExportError?.(errorMessage)
    } finally {
      setIsExporting(false)
    }
  }, [tracks, getValidAccessToken, onExportError, onExportSuccess, refreshStatus])

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        disabled={isExportDisabled}
        className={`flex items-center justify-center px-6 py-3 rounded-full font-semibold transition-all duration-300 ${isTrackEmpty
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : isExporting
            ? 'bg-green-600 text-white cursor-wait'
            : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transform hover:scale-105'
          }`}
      >
        {isExporting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <ExternalLink className="w-5 h-5 mr-2" />
            Export to Spotify
          </>
        )}
      </button>

      <button
        onClick={debugToken}
        disabled={!isAuthenticated || isDebugging}
        className={`flex items-center justify-center px-3 py-3 rounded-full font-semibold transition-all duration-300 ${!isAuthenticated
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : isDebugging
            ? 'bg-blue-600 text-white cursor-wait'
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-105'
          }`}
        title="Debug Spotify token"
      >
        {isDebugging ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Bug className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}
