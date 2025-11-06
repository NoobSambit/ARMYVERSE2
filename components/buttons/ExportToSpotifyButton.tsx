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
  onExportSuccess?: (playlistUrl: string) => void
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
    if (!isAuthenticated) {
      onExportError?.('Please connect your Spotify account first')
      return
    }

    if (!tracks || tracks.length === 0) {
      onExportError?.('No tracks to export')
      return
    }

    setIsExporting(true)

    try {
      const accessToken = await getValidAccessToken()
      if (!accessToken) {
        onExportError?.('Spotify access token not available. Please reconnect your account.')
        return
      }

      const requestBody = {
        name: 'AI Generated BTS Playlist',
        songs: tracks
      }

      const response = await fetch('/api/playlist/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await refreshStatus()
          if (refreshed?.accessToken) {
            const retryResponse = await fetch('/api/playlist/export', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${refreshed.accessToken}`
              },
              body: JSON.stringify(requestBody)
            })

            const retryData = await retryResponse.json()
            if (!retryResponse.ok) {
              throw new Error(retryData.error || retryData.details || 'Failed to export playlist')
            }

            onExportSuccess?.(retryData.playlistUrl)
            return
          }
        }

        throw new Error(data.error || data.details || 'Failed to export playlist')
      }

      if (data.searchErrors && data.searchErrors.length > 0) {
        console.warn('Some tracks could not be found:', data.searchErrors)
      }

      onExportSuccess?.(data.playlistUrl)
    } catch (error) {
      console.error('Error exporting playlist:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to export playlist'
      onExportError?.(errorMessage)
    } finally {
      setIsExporting(false)
    }
  }, [isAuthenticated, tracks, getValidAccessToken, onExportError, onExportSuccess, refreshStatus])

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        disabled={!isAuthenticated || isExporting || !tracks?.length}
        className={`flex items-center justify-center px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
          !isAuthenticated || !tracks?.length
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
        className={`flex items-center justify-center px-3 py-3 rounded-full font-semibold transition-all duration-300 ${
          !isAuthenticated
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