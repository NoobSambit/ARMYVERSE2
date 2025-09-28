'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Palette, Monitor, Image, Layout, Zap, Award } from 'lucide-react'

interface PersonalizationFormProps {
  profile: any
  onUpdate: (updates: any) => void
  loading: boolean
  error: string | null
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

const DENSITY_OPTIONS = [
  { id: 'comfortable', name: 'Comfortable', description: 'More spacing between elements' },
  { id: 'compact', name: 'Compact', description: 'Tighter spacing for more content' }
]

const BADGE_STYLES = [
  { id: 'minimal', name: 'Minimal', description: 'Simple, clean badge design' },
  { id: 'collectible', name: 'Collectible', description: 'Detailed, collectible-style badges' }
]

export default function PersonalizationForm({ profile, onUpdate, loading, error }: PersonalizationFormProps) {
  const [customColor, setCustomColor] = useState('')

  const handleInputChange = useCallback((field: string, value: any) => {
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
                  profile.personalization?.accentColor === color.value
                    ? 'border-purple-500'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className={`w-full h-8 rounded ${color.class}`} />
                <p className="text-xs text-gray-400 mt-2 text-center">{color.name}</p>
                {profile.personalization?.accentColor === color.value && (
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
                value={customColor || profile.personalization?.accentColor || '#8B5CF6'}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-12 h-12 rounded-lg border border-gray-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={customColor || profile.personalization?.accentColor || ''}
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
            value={profile.personalization?.themeIntensity || 50}
            onChange={(e) => handleInputChange('themeIntensity', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          
          <div className="flex justify-center">
            <span className="text-sm text-gray-300">
              {profile.personalization?.themeIntensity || 50}%
            </span>
          </div>
        </div>
      </div>

      {/* Background Style */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Image className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Background Style</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {BACKGROUND_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => handleInputChange('backgroundStyle', style.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                profile.personalization?.backgroundStyle === style.id
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

      {/* Card Density */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layout className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Card Density</h3>
        </div>
        
        <div className="space-y-3">
          {DENSITY_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleInputChange('density', option.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                profile.personalization?.density === option.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 hover:border-gray-600 bg-black/20'
              }`}
            >
              <h4 className="text-white font-medium mb-1">{option.name}</h4>
              <p className="text-gray-400 text-sm">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Motion Preferences */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Motion Preferences</h3>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Reduce Animations</h4>
            <p className="text-gray-400 text-sm">
              Minimize motion for better accessibility
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleInputChange('reduceMotion', !profile.personalization?.reduceMotion)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              profile.personalization?.reduceMotion ? 'bg-purple-600' : 'bg-gray-700'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                profile.personalization?.reduceMotion ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
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
                profile.personalization?.badgeStyle === style.id
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
      <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <p className="text-purple-300 text-sm">
          💡 Changes are applied instantly to the preview panel. Your preferences are saved automatically.
        </p>
      </div>
    </div>
  )
}
