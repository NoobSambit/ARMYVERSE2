'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import QuizScreen from '@/components/boraland/QuizScreen'

export default function Page() {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()

  useEffect(() => {
    if (user === null) {
      // User is not authenticated
      showToast('warning', 'Sign in to save rewards and access your collection')
      router.push('/boraland')
    }
  }, [user, router, showToast])

  // Show loading while checking authentication
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  // If not authenticated, don't render the quiz (will redirect)
  if (!user) {
    return null
  }

  return <QuizScreen />
}


