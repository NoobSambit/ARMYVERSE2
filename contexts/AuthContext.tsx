'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { getCurrentJWTUser, getStoredAuthType, clearStoredAuth, type JWTUser } from '@/lib/firebase/auth'

// Unified user type that works with both Firebase and JWT auth
export interface UnifiedUser {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  username?: string
  authType: 'firebase' | 'jwt'
  getIdToken?: () => Promise<string>
}

interface AuthContextType {
  user: UnifiedUser | null
  isAuthenticated: boolean
  loading: boolean
  authType: 'firebase' | 'jwt' | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  authType: null,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UnifiedUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [authType, setAuthType] = useState<'firebase' | 'jwt' | null>(null)

  useEffect(() => {
    let isMounted = true

    const applyJwtUser = (jwtUser: JWTUser) => {
      setUser({
        uid: jwtUser.uid,
        displayName: jwtUser.displayName || jwtUser.username,
        email: jwtUser.email || null,
        photoURL: jwtUser.photoURL || null,
        username: jwtUser.username,
        authType: 'jwt',
        getIdToken: async () => {
          const token = localStorage.getItem('auth_token')
          if (!token) throw new Error('No JWT token found')
          return token
        }
      })
      setAuthType('jwt')
    }

    const applyFirebaseUser = (firebaseUser: User) => {
      setUser({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        username: firebaseUser.email?.split('@')[0],
        authType: 'firebase',
        getIdToken: () => firebaseUser.getIdToken()
      })
      setAuthType('firebase')
    }

    const syncJwtAuth = async () => {
      const storedAuthType = getStoredAuthType()
      if (storedAuthType !== 'jwt') {
        const firebaseUser = auth.currentUser
        if (firebaseUser) {
          applyFirebaseUser(firebaseUser)
        } else {
          setUser(null)
          setAuthType(null)
        }
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const jwtUser = await getCurrentJWTUser()
        if (!isMounted) return

        if (jwtUser) {
          applyJwtUser(jwtUser)
        } else {
          setUser(null)
          setAuthType(null)
        }
      } catch (error) {
        console.error('JWT auth error:', error)
        clearStoredAuth()
        setUser(null)
        setAuthType(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    const handleAuthChanged = () => {
      void syncJwtAuth()
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const storedAuthType = getStoredAuthType()
      if (storedAuthType === 'jwt') {
        return
      }

      if (firebaseUser) {
        applyFirebaseUser(firebaseUser)
      } else {
        setUser(null)
        setAuthType(null)
      }
      setLoading(false)
    })

    void syncJwtAuth()

    window.addEventListener('auth-changed', handleAuthChanged)
    window.addEventListener('storage', handleAuthChanged)

    return () => {
      isMounted = false
      unsubscribe()
      window.removeEventListener('auth-changed', handleAuthChanged)
      window.removeEventListener('storage', handleAuthChanged)
    }
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    authType,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
