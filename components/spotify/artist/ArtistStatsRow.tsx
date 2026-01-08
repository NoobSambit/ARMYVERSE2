'use client'

import React from 'react'
import { Music, Users, Heart, TrendingUp } from 'lucide-react'

interface ArtistStatsRowProps {
  stats: {
    streams: { value: string; change: number; percent: number };
    listeners: { value: string; change: number; percent: number };
    followers: { value: string; change: number; percent: number };
  }
}

interface StatCardProps {
  title: string
  value: string
  change: number
  icon: any
  colorClass: string
  bgClass: string
  barColorClass: string
  percent: number
}

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  colorClass,
  bgClass,
  barColorClass,
  percent
}: StatCardProps) => (
  <div className="bg-[#2e2249] rounded-xl p-3 sm:p-4 md:p-5 border border-white/5 hover:border-[#895af6]/30 transition-colors">
    <div className="flex justify-between items-start mb-2">
      <span className="text-[#a290cb] text-xs sm:text-sm font-medium">{title}</span>
      <div className={`p-1 sm:p-1.5 rounded-xl ${bgClass}`}>
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colorClass}`} />
      </div>
    </div>
    <div className="flex items-end gap-2 sm:gap-3">
      <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-none">{value}</span>
      <span className="text-[#0bda6f] text-[10px] sm:text-xs font-bold mb-0.5 sm:mb-1.5 flex items-center gap-0.5">
        <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {change}%
      </span>
    </div>
    <div className="w-full bg-black/20 h-1 mt-3 sm:mt-4 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${barColorClass}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
)

export default function ArtistStatsRow({ stats }: ArtistStatsRowProps) {
  return (
    <div className="flex flex-col gap-4">
      <StatCard 
        title="Total Streams"
        value={stats.streams.value}
        change={stats.streams.change}
        percent={stats.streams.percent}
        icon={Music}
        colorClass="text-[#895af6]"
        bgClass="bg-[#895af6]/10"
        barColorClass="bg-[#895af6]"
      />
      <StatCard 
        title="Monthly Listeners"
        value={stats.listeners.value}
        change={stats.listeners.change}
        percent={stats.listeners.percent}
        icon={Users}
        colorClass="text-blue-400"
        bgClass="bg-blue-400/10"
        barColorClass="bg-blue-400"
      />
      <StatCard 
        title="Followers"
        value={stats.followers.value}
        change={stats.followers.change}
        percent={stats.followers.percent}
        icon={Heart}
        colorClass="text-pink-400"
        bgClass="bg-pink-400/10"
        barColorClass="bg-pink-400"
      />
    </div>
  )
}
