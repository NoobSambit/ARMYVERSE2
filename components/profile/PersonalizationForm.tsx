'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Palette, Monitor, Image as ImageIcon, Award, RotateCcw } from 'lucide-react'
import { getDefaultProfile } from '@/lib/utils/profile'

interface PersonalizationShape {
  accentColor?: string
  themeIntensity?: number
  backgroundStyle?: 'gradient' | 'noise' | 'bts-motif' | 'clean'
  badgeStyle?: 'minimal' | 'collectible'
}
interface ProfilePersonalization { personalization?: PersonalizationShape }
interface PersonalizationFormProps {
  profile: ProfilePersonalization
  onUpdate: (updates: any) => void
  loading?: boolean
  error?: string | null
}

const ACCENT_COLORS = [
  { name: 'Purple', value: '#8B5CF6', class: 'bg-purple-500' },
  { name: 'Pink', value: '#EC4899', class: 'bg-pink-500' },
  { name: 'Blue', value: '#3B82F6', class: 'bg-blue-500' },
  { name: 'Green', value: '#10B981', class: 'bg-green-500' },
  { name: 'Orange', value: '#F59E0B', class: 'bg-orange-500' },
  { name: 'Red', value: '#EF4444', class: 'bg-red-500' },
  { name: 'Indigo', value: '#6366F1', class: 'bg-indigo-500' },
  { name: 'Teal', value: '#14B8A6', class: 'bg-teal-500' }
]

const BACKGROUND_STYLES = [
  { id: 'gradient', name: 'Gradient', description: 'Soft purple gradient background' },
  { id: 'noise', name: 'Noise', description: 'Subtle texture overlay' },
  { id: 'bts-motif', name: 'BTS Motif', description: 'BTS-inspired patterns' },
  { id: 'clean', name: 'Clean', description: 'Minimal solid background' }
]

const BADGE_STYLES = [
  { id: 'minimal', name: 'Minimal', description: 'Simple, clean badge design' },
  { id: 'collectible', name: 'Collectible', description: 'Detailed, collectible-style badges' }
]

type PersonalizationFieldValue = string | number | boolean

export default function PersonalizationForm({ profile, onUpdate, error }: PersonalizationFormProps) {
  const [customColor, setCustomColor] = useState('')
  const defaults = useMemo(() => getDefaultProfile().personalization, [])

  const handleInputChange = useCallback((field: string, value: PersonalizationFieldValue) => {
    onUpdate({
      personalization: {
        ...profile.personalization,
        [field]: value
      }
    })
  }, [onUpdate, profile.personalization])

  const handleCustomColorChange = useCallback((color: string) => {
    setCustomColor(color)
    if (color && /^#[0-9A-F]{6}$/i.test(color)) {
      handleInputChange('accentColor', color)
    }
  }, [handleInputChange])

  const resetPersonalization = useCallback(() => {
    onUpdate({ personalization: { ...defaults } })
    setCustomColor('')
  }, [defaults, onUpdate])

  const accentColor = profile.personalization?.accentColor || customColor || defaults.accentColor
  const themeIntensity = profile.personalization?.themeIntensity ?? defaults.themeIntensity
  const backgroundStyle = profile.personalization?.backgroundStyle || defaults.backgroundStyle
  const badgeStyle = profile.personalization?.badgeStyle || defaults.badgeStyle

  return (
    <div className="space-y-8">
      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-xl">Personalize your profile</h2>
          <p className="text-sm text-gray-400">Fine-tune colors and presentation instantly.</p>
        </div>
        <button
          type="button"
          onClick={resetPersonalization}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Accent Color */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Accent Color</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => handleInputChange('accentColor', color.value)}
                className={`relative p-3 rounded-lg border-2 transition-all ${
                  accentColor === color.value
                    ? 'border-purple-500'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className={`w-full h-8 rounded ${color.class}`} />
                <p className="text-xs text-gray-400 mt-2 text-center">{color.name}</p>
                {accentColor === color.value && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <div>
            <label htmlFor="customColor" className="block text-sm font-medium text-gray-300 mb-2">
              Custom Color
            </label>
            <div className="flex gap-3">
              <input
                id="customColor"
                type="color"
                value={accentColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-12 h-12 rounded-lg border border-gray-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={customColor || profile.personalization?.accentColor || accentColor || ''}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                placeholder="#8B5CF6"
                className="flex-1 px-4 py-3 rounded-lg bg-black/40 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Theme Intensity */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Theme Intensity</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Subtle</span>
            <span className="text-sm text-gray-400">Vibrant</span>
          </div>
          
          <input
            type="range"
            min="0"
            max="100"
            value={themeIntensity}
            onChange={(e) => handleInputChange('themeIntensity', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          
          <div className="flex justify-center">
            <span className="text-sm text-gray-300">
              {themeIntensity}%
            </span>
          </div>
        </div>
      </div>

      {/* Background Style */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Background Style</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {BACKGROUND_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => handleInputChange('backgroundStyle', style.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                backgroundStyle === style.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 hover:border-gray-600 bg-black/20'
              }`}
            >
              <h4 className="text-white font-medium mb-1">{style.name}</h4>
              <p className="text-gray-400 text-sm">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Badge Style */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Badge Style</h3>
        </div>
        
        <div className="space-y-3">
          {BADGE_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => handleInputChange('badgeStyle', style.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                badgeStyle === style.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 hover:border-gray-600 bg-black/20'
              }`}
            >
              <h4 className="text-white font-medium mb-1">{style.name}</h4>
              <p className="text-gray-400 text-sm">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview Note */}
      <div className="p-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
        <p className="text-purple-200 text-sm">
          💡 Adjustments are synced instantly with the preview and saved automatically.
        </p>
      </div>
    </div>
  )
}
