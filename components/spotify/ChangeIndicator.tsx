import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ChangeIndicatorProps {
  change24h?: number
  change7d?: number
  mode?: 'badge' | 'inline' | 'compact' | 'pill'
  label?: string
}

export default function ChangeIndicator({
  change24h,
  change7d,
  mode = 'badge'
}: ChangeIndicatorProps) {
  const formatChange = (value: number): string => {
    const abs = Math.abs(value)
    if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
    if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return value.toLocaleString()
  }

  const getColorClasses = (value: number) => {
    if (value > 0) return 'text-emerald-400 bg-emerald-500/10'
    if (value < 0) return 'text-rose-400 bg-rose-500/10'
    return 'text-gray-400 bg-gray-500/10'
  }

  const getTextColorClass = (value: number) => {
    if (value > 0) return 'text-emerald-400'
    if (value < 0) return 'text-rose-400'
    return 'text-gray-400'
  }

  const getIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-3 h-3" />
    if (value < 0) return <TrendingDown className="w-3 h-3" />
    return <Minus className="w-3 h-3" />
  }

  const renderBadge = (value: number, periodLabel: string) => {
    const formatted = value > 0 ? `+${formatChange(value)}` : formatChange(value)

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getColorClasses(value)}`}>
        <span className="text-[10px] text-white/60">{periodLabel}:</span>
        <span>{formatted}</span>
        {getIcon(value)}
      </div>
    )
  }

  const renderPill = (value: number) => {
    const formatted = value > 0 ? `+${formatChange(value)}` : formatChange(value)
    const colorClass = value > 0 
      ? 'bg-emerald-500/20 text-emerald-400' 
      : value < 0 
        ? 'bg-rose-500/20 text-rose-400' 
        : 'bg-white/10 text-white/60'

    return (
      <div className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-bold ${colorClass}`}>
         {value > 0 && <TrendingUp className="w-3 h-3 mr-1" />}
         {value < 0 && <TrendingDown className="w-3 h-3 mr-1" />}
         {formatted}
       </div>
    )
  }

  const renderInline = (value: number, periodLabel: string) => {
    const formatted = value > 0 ? `+${formatChange(value)}` : formatChange(value)

    return (
      <span className={`inline-flex items-center gap-1 text-sm font-medium ${getTextColorClass(value)}`}>
        <span className="text-white/60 text-xs">{periodLabel}:</span>
        {formatted}
        {getIcon(value)}
      </span>
    )
  }

  const renderCompact = (value: number) => {
    const formatted = value > 0 ? `+${formatChange(value)}` : formatChange(value)

    return (
      <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${getTextColorClass(value)}`}>
        {formatted}
        {getIcon(value)}
      </span>
    )
  }

  if (change24h === undefined && change7d === undefined) {
    return <span className="text-xs text-gray-500">No data</span>
  }

  if (mode === 'badge') {
    return (
      <div className="flex gap-1.5 flex-wrap">
        {change24h !== undefined && renderBadge(change24h, '24h')}
        {change7d !== undefined && renderBadge(change7d, '7d')}
      </div>
    )
  }

  if (mode === 'inline') {
    return (
      <div className="flex gap-3">
        {change24h !== undefined && renderInline(change24h, '24h')}
        {change7d !== undefined && renderInline(change7d, '7d')}
      </div>
    )
  }

  if (mode === 'compact') {
    // For compact mode, prioritize 24h change
    const value = change24h !== undefined ? change24h : change7d
    return value !== undefined ? renderCompact(value) : null
  }

  if (mode === 'pill') {
    const value = change24h !== undefined ? change24h : change7d
    return value !== undefined ? renderPill(value) : null
  }

  return null
}
