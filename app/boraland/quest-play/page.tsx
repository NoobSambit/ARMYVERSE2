'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import QuizScreen from '@/components/boraland/QuizScreen'

export default function Page() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const warnedRef = useRef(false)

  useEffect(() => {
    if (!authLoading && user === null && !warnedRef.current) {
      warnedRef.current = true
      showToast('warning', 'Sign in to progress quests')
      router.push('/boraland/quests')
    }
  }, [authLoading, user, router, showToast])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="h-[100dvh] bg-background-deep overflow-hidden">
      <QuizScreen questMode />
    </div>
  )
}
