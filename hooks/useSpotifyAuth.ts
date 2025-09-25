'use client'

import { useState, useEffect } from 'react'

export function useSpotifyAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const spotifyTokenData = localStorage.getItem('spotify_token')
        if (spotifyTokenData) {
          const tokenObj = JSON.parse(spotifyTokenData)
          // Check if token exists and is not expired
          if (tokenObj.access_token) {
            // Check if token is expired (if expires_in is available)
            if (tokenObj.expires_in && tokenObj.timestamp) {
              const now = Date.now()
              const expirationTime = tokenObj.timestamp + (tokenObj.expires_in * 1000)
              if (now < expirationTime) {
                setIsAuthenticated(true)
              } else {
                // Token expired, remove it
                localStorage.removeItem('spotify_token')
                setIsAuthenticated(false)
              }
            } else {
              // No expiration info, assume valid
              setIsAuthenticated(true)
            }
          } else {
            setIsAuthenticated(false)
          }
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Error checking Spotify auth status:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()

    // Listen for storage changes (in case token is added/removed in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'spotify_token') {
        checkAuthStatus()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    // Also listen for our custom signal from the same tab when token is set
    window.addEventListener('spotify_token_set', checkAuthStatus)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const disconnect = () => {
    localStorage.removeItem('spotify_token')
    setIsAuthenticated(false)
  }

  return { isAuthenticated, isLoading, disconnect }
} 