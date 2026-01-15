'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Lock } from 'lucide-react'
import ProfilePreview from './ProfilePreview'

interface ProfileViewModalProps {
  userId: string | null
  onClose: () => void
}

export default function ProfileViewModal({ userId, onClose }: ProfileViewModalProps) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setError(null)
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/user/${userId}/profile`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to load profile')
        }

        const data = await response.json()
        setProfile(data.profile)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  if (!userId) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-[90vw] max-w-[450px] max-h-[95vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="overflow-y-auto max-h-[95vh] relative">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-20 p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white/80 hover:text-white transition-all backdrop-blur-sm border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
            {loading && (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                <Lock className="w-16 h-16 text-red-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Profile Unavailable</h3>
                <p className="text-gray-400 text-center">{error}</p>
              </div>
            )}

            {!loading && !error && profile && (
              <ProfilePreview profile={profile} variant="sidebar" />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
