'use client'

import { User } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

export async function getToken(user: User | null) {
  if (!user) return null
  return await user.getIdToken()
}

export class ApiError extends Error {
  status: number
  details?: any
  constructor(status: number, message: string, details?: any) {
    super(message)
    this.status = status
    this.details = details
  }
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const user = auth.currentUser
  const token = await getToken(user)
  const headers = new Headers(init.headers || {})
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(path, { ...init, headers, cache: 'no-store' })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new ApiError(res.status, data?.error || 'Request failed', data)
  }
  return data
}

export async function demoFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {})
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json')
  const res = await fetch(path, { ...init, headers, cache: 'no-store' })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new ApiError(res.status, data?.error || 'Request failed', data)
  }
  return data
}

export function withAuth<T extends any[], R>(fn: (...args: T) => Promise<R>) {
  return async (...args: T) => {
    const user = auth.currentUser
    if (!user) throw new ApiError(401, 'Not authenticated')
    return await fn(...args)
  }
}


