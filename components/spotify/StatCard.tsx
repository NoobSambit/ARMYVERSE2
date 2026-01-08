'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import ChangeIndicator from './ChangeIndicator'

interface StatCardProps {
  title: string
  value: number
  change24h?: number
  change7d?: number
  icon?: LucideIcon
  loading?: boolean
  variant?: 'purple' | 'blue' | 'pink' | 'gray'
}

export default function StatCard({
  title,
  value,
  change24h,
  change7d,
  icon: Icon,
  loading = false,
  variant = 'gray'
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 md:p-6 border border-white/5 animate-pulse min-h-[120px] sm:min-h-[130px] md:min-h-[140px]">
        <div className="h-2.5 sm:h-3 bg-white/10 rounded w-1/3 mb-3 sm:mb-4" />
        <div className="h-6 sm:h-8 bg-white/10 rounded w-1/2 mb-3 sm:mb-4" />
        <div className="h-3 sm:h-4 bg-white/10 rounded w-1/4" />
      </div>
    )
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'purple':
        return 'bg-gradient-to-br from-[#2E1D46] to-[#1A1625] border-white/5'
      case 'blue':
        return 'bg-gradient-to-br from-[#1D2B46] to-[#1A1625] border-white/5'
      case 'pink':
        return 'bg-gradient-to-br from-[#461D32] to-[#1A1625] border-white/5'
      case 'gray':
      default:
        return 'bg-[#18181B] border-white/5'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl p-4 sm:p-5 md:p-6 border transition-all relative overflow-hidden ${getVariantStyles()}`}
    >
      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/5 blur-3xl rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="text-[10px] sm:text-[11px] font-bold text-white/50 tracking-wider uppercase mb-1">
            {title}
          </div>
          <div className="flex items-end gap-2 sm:gap-3 mb-1">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
              {value.toLocaleString()}
            </span>
            {(change24h !== undefined || change7d !== undefined) && (
              <div className="mb-1 mb-1.5">
                <ChangeIndicator change24h={change24h} change7d={change7d} mode="pill" />
              </div>
            )}
          </div>
        </div>

        {Icon && (
          <div className="absolute right-3 top-3 sm:right-4 sm:top-4 text-white/5">
            <Icon className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
          </div>
        )}

        {/* Optional footer text or description if needed */}
        {change24h === 0 && change7d === 0 && (
          <div className="text-[10px] sm:text-xs text-white/30 font-medium">No change</div>
        )}
      </div>
    </motion.div>
  )
}
