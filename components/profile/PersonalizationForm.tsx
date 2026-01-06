'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Palette, Monitor, Image as ImageIcon, RotateCcw, Check } from 'lucide-react'
import { getDefaultProfile } from '@/lib/utils/profile'
import { BACKGROUND_STYLE_DEFINITIONS, type AnyBackgroundStyleId } from './backgroundStyles'

interface PersonalizationShape {
  accentColor?: string
  themeIntensity?: number
  backgroundStyle?: AnyBackgroundStyleId
  badgeStyle?: 'minimal' | 'collectible'
}
interface ProfilePersonalization { personalization?: PersonalizationShape }
interface PersonalizationFormProps {
  profile: ProfilePersonalization
  onUpdate: (updates: any) => void
  loading?: boolean
  error?: string | null
}

const ACCENT_PRESETS = [
  { id: 'bora', name: 'Bora', color: '#8B5CF6' },      // Purple
  { id: 'butter', name: 'Butter', color: '#FBBF24' },  // Yellow/Gold
  { id: 'dyna', name: 'Dyna', color: '#EC4899' },      // Pink
  { id: 'kosmos', name: 'Kosmos', color: '#3B82F6' },  // Blue
  { id: 'mint', name: 'Mint', color: '#10B981' },      // Green
  { id: 'fire', name: 'Fire', color: '#EF4444' },      // Red
  { id: 'ptd', name: 'PTD', color: '#F97316' },        // Orange
  { id: 'mono', name: 'Mono', color: '#E5E7EB' },      // Light Grey/White
]

type PersonalizationFieldValue = string | number | boolean

export default function PersonalizationForm({ profile, onUpdate, error }: PersonalizationFormProps) {
  const defaults = useMemo(() => getDefaultProfile().personalization, [])
  const [customColorInput, setCustomColorInput] = useState('')

  const handleInputChange = useCallback((field: string, value: PersonalizationFieldValue) => {
    onUpdate({
      personalization: {
        ...profile.personalization,
        [field]: value
      }
    })
  }, [onUpdate, profile.personalization])

  const resetPersonalization = useCallback(() => {
    onUpdate({ personalization: { ...defaults } })
    setCustomColorInput('')
  }, [defaults, onUpdate])

  const accentColor = profile.personalization?.accentColor || defaults.accentColor
  const themeIntensity = profile.personalization?.themeIntensity ?? defaults.themeIntensity
  const backgroundStyle = profile.personalization?.backgroundStyle || defaults.backgroundStyle

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-400" />
            Personalize your profile
          </h2>
          <p className="text-sm text-gray-400 mt-1">Fine-tune colors and presentation instantly</p>
        </div>
        <button
          type="button"
          onClick={resetPersonalization}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
          title="Reset to defaults"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Sync Banner */}
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        <p className="text-sm text-purple-200/80 font-medium">
          Adjustments are synced instantly with the preview and saved automatically.
        </p>
      </div>

      {/* Accent Color Section */}
      <div className="p-8 bg-[#151518] rounded-[2rem] border border-white/5">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          Accent Color
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Presets */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">PRESETS</label>
            <div className="grid grid-cols-4 gap-y-6 gap-x-4">
              {ACCENT_PRESETS.map((preset) => {
                const isSelected = accentColor.toLowerCase() === preset.color.toLowerCase()
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleInputChange('accentColor', preset.color)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isSelected 
                          ? 'ring-2 ring-offset-2 ring-offset-[#151518] scale-110' 
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                      style={{ 
                        backgroundColor: preset.color,
                        borderColor: preset.color,
                        boxShadow: isSelected ? `0 0 15px ${preset.color}66` : 'none'
                      }}
                    >
                      {isSelected && <Check className="w-5 h-5 text-black/50" />}
                    </div>
                    <span className={`text-xs font-bold transition-colors ${isSelected ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                      {preset.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom Color */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">CUSTOM COLOR</label>
            <div className="p-4 bg-black/20 rounded-2xl border border-white/5 flex items-center gap-4">
               <div className="relative group cursor-pointer">
                 <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => handleInputChange('accentColor', e.target.value)}
                    className="w-14 h-14 rounded-full overflow-hidden cursor-pointer border-none p-0 opacity-0 absolute inset-0 z-10"
                  />
                  <div 
                    className="w-14 h-14 rounded-full border-2 border-white/10 flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Palette className="w-6 h-6 text-white mix-blend-difference" />
                  </div>
               </div>
               
               <div className="flex-1">
                 <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Hex Code</p>
                 <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">#</span>
                    <input
                      type="text"
                      value={accentColor.replace('#', '').toUpperCase()}
                      onChange={(e) => {
                        const val = e.target.value
                        if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                           handleInputChange('accentColor', `#${val}`)
                        }
                      }}
                      maxLength={6}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-sm font-mono font-bold text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Intensity */}
      <div className="p-8 bg-[#151518] rounded-[2rem] border border-white/5">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Theme Intensity
          </h3>
          <span className="text-3xl font-bold text-white tracking-tight">{themeIntensity}%</span>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-gray-500 font-medium">Adjust how vibrant the interface glows</p>
          <div className="relative h-8 flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={themeIntensity}
              onChange={(e) => handleInputChange('themeIntensity', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer z-10 focus:outline-none"
              style={{
                background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${themeIntensity}%, #333 ${themeIntensity}%, #333 100%)`
              }}
            />
            <div 
              className="absolute h-6 w-6 bg-white rounded-full shadow-lg pointer-events-none transition-all duration-75 border-2 border-[#151518]"
              style={{ 
                left: `calc(${themeIntensity}% - 12px)`,
                boxShadow: `0 0 15px ${accentColor}`
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <span>Subtle</span>
            <span>Vibrant</span>
          </div>
        </div>
      </div>

      {/* Background Style */}
      <div className="p-8 bg-[#151518] rounded-[2rem] border border-white/5">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Background Style
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {BACKGROUND_STYLE_DEFINITIONS.map((style) => (
            <button
              key={style.id}
              onClick={() => handleInputChange('backgroundStyle', style.id)}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all text-left h-28 p-5 ${
                backgroundStyle === style.id
                  ? 'border-purple-500 shadow-lg shadow-purple-900/10'
                  : 'border-white/5 hover:border-white/10 hover:bg-white/5'
              }`}
            >
              {/* Preview Background */}
              <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-gray-800 to-black transition-opacity group-hover:opacity-40" />
              {backgroundStyle === style.id && (
                 <div className="absolute inset-0 bg-purple-500/10" />
              )}
              
              <div className="relative z-10 flex flex-col justify-between h-full">
                <h4 className={`font-bold text-sm ${backgroundStyle === style.id ? 'text-white' : 'text-gray-300'}`}>
                  {style.name}
                </h4>
                {backgroundStyle === style.id && (
                  <div className="absolute top-0 right-0 p-1.5 bg-purple-500 rounded-bl-xl">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
