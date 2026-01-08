'use client'

import { useEffect, useRef, useState } from 'react'

interface TimerBarProps {
  durationMs?: number
  onComplete: () => void
  onTick?: (remainingMs: number) => void
}

export default function TimerBar({ durationMs = 20000, onComplete, onTick }: TimerBarProps) {
  const [remaining, setRemaining] = useState(durationMs)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const endTimeRef = useRef<number>(0)
  const announcedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  const onTickRef = useRef(onTick)

  // Keep latest callbacks without restarting timer
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])
  useEffect(() => {
    onTickRef.current = onTick
  }, [onTick])

  useEffect(() => {
    // Reset timer state when component mounts
    endTimeRef.current = Date.now() + durationMs
    setRemaining(durationMs)
    announcedRef.current = false

    // Set up interval to update remaining time
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const newRemaining = Math.max(0, endTimeRef.current - now)

      setRemaining(newRemaining)

      // Call onTick callback if provided
      if (onTickRef.current) {
        onTickRef.current(newRemaining)
      }

      // Check if time is up
      if (newRemaining <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        if (onCompleteRef.current) onCompleteRef.current()
      }
    }, 100) // Update every 100ms for smooth animation

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [durationMs])

  // Calculate progress percentage
  const progress = Math.max(0, Math.min(1, remaining / durationMs))

  return (
    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-2 bg-gradient-to-r from-fuchsia-400 to-rose-400 transition-all duration-100 ease-linear"
        style={{ width: `${progress * 100}%` }}
      />
      <div id="timer-live" aria-live="polite" className="sr-only" />
    </div>
  )
}

