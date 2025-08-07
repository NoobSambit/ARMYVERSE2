'use client'

import React, { useState } from 'react'
import { ExternalLink, Loader2, Bug } from 'lucide-react'

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
  isAuthenticated: boolean
  onExportSuccess?: (playlistUrl: string) => void
  onExportError?: (error: string) => void
}

export default function ExportToSpotifyButton({
  tracks,
  isAuthenticated,
  onExportSuccess,
  onExportError
}: ExportToSpotifyButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isDebugging, setIsDebugging] = useState(false)

  const debugToken = async () => {
    setIsDebugging(true)
    
    const spotifyTokenData = localStorage.getItem('spotify_token')
    let token = null
    
    if (spotifyTokenData) {
      try {
        const tokenObj = JSON.parse(spotifyTokenData)
        token = tokenObj.access_token
      } catch (error) {
        console.error('Error parsing Spotify token:', error)
      }
    }

    if (!token) {
      onExportError?.('No Spotify token found. Please reconnect your account.')
      setIsDebugging(false)
      return
    }

    try {
      const response = await fetch('/api/playlist/export', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      console.log('Token debug info:', data)
      
      if (data.tokenValid) {
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
  }

  const handleExport = async () => {
    if (!isAuthenticated) {
      onExportError?.('Please connect your Spotify account first')
      return
    }

    if (!tracks || tracks.length === 0) {
      onExportError?.('No tracks to export')
      return
    }

    setIsExporting(true)
    
    // Get Spotify token from localStorage and extract access_token
    const spotifyTokenData = localStorage.getItem('spotify_token')
    let token = null
    let refreshToken = null
    
    if (spotifyTokenData) {
      try {
        const tokenObj = JSON.parse(spotifyTokenData)
        token = tokenObj.access_token
        refreshToken = tokenObj.refresh_token
        
        // Check if token is expired (if we have expiration info)
        if (tokenObj.expires_in && tokenObj.timestamp) {
          const now = Date.now()
          const expirationTime = tokenObj.timestamp + (tokenObj.expires_in * 1000)
          if (now > expirationTime) {
            onExportError?.('Spotify token has expired. Please reconnect your account.')
            setIsExporting(false)
            return
          }
        }
      } catch (error) {
        console.error('Error parsing Spotify token:', error)
      }
    }

    if (!token) {
      onExportError?.('Spotify access token not found. Please reconnect your account.')
      setIsExporting(false)
      return
    }

    try {
      const requestBody: any = {
        name: 'AI Generated BTS Playlist',
        songs: tracks
      }
      
      // Include refresh token if available
      if (refreshToken) {
        requestBody.refreshToken = refreshToken
      }

      const response = await fetch('/api/playlist/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          onExportError?.('Spotify token expired or invalid. Please reconnect your account.')
          return
        }
        
        if (response.status === 403) {
          onExportError?.('Insufficient permissions. Please ensure your Spotify account has playlist creation permissions.')
          return
        }
        
        throw new Error(data.error || data.details || 'Failed to export playlist')
      }

      // Show success message with details
      const successMessage = `Successfully exported ${data.tracksAdded} out of ${data.totalSongs} tracks to Spotify!`
      console.log(successMessage)
      
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
  }

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
      
      {/* Debug button for troubleshooting */}
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