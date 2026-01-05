'use client'

import React from 'react'
import { Zap, Coffee, Sun, CloudRain, Heart, Hourglass, Trophy, Feather, Flame, Smile } from 'lucide-react'

interface MoodPillsProps {
  selectedMoods: string[]
  onMoodChange: (moods: string[]) => void
  className?: string
}

const MOOD_OPTIONS = [
  { value: 'energetic', label: 'Energetic', icon: Zap, color: 'text-yellow-400' },
  { value: 'chill', label: 'Chill', icon: Coffee, color: 'text-blue-300' },
  { value: 'uplifting', label: 'Uplifting', icon: Sun, color: 'text-orange-400' },
  { value: 'melancholic', label: 'Melancholic', icon: CloudRain, color: 'text-gray-400' },
  { value: 'romantic', label: 'Romantic', icon: Heart, color: 'text-pink-400' },
  { value: 'nostalgic', label: 'Nostalgic', icon: Hourglass, color: 'text-purple-300' },
  { value: 'confident', label: 'Confident', icon: Trophy, color: 'text-amber-400' },
  { value: 'peaceful', label: 'Peaceful', icon: Feather, color: 'text-teal-300' },
  { value: 'dramatic', label: 'Dramatic', icon: Flame, color: 'text-red-400' },
  { value: 'playful', label: 'Playful', icon: Smile, color: 'text-pink-300' }
]

export default function MoodPills({ selectedMoods, onMoodChange, className = '' }: MoodPillsProps) {
  const handleMoodToggle = (mood: string) => {
    if (selectedMoods.includes(mood)) {
      onMoodChange(selectedMoods.filter(m => m !== mood))
    } else {
      onMoodChange([...selectedMoods, mood])
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label removed as it is handled by parent */}
      
      <div className="flex flex-wrap gap-2">
        {MOOD_OPTIONS.map((mood) => {
          const Icon = mood.icon
          const isSelected = selectedMoods.includes(mood.value)
          
          return (
            <button
              key={mood.value}
              onClick={() => handleMoodToggle(mood.value)}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all duration-200 flex items-center gap-2 ${
                isSelected
                  ? 'bg-white/10 border-purple-400/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                  : 'bg-transparent border-white/5 text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : mood.color}`} />
              <span>{mood.label}</span>
            </button>
          )
        })}
      </div>
      
      {selectedMoods.length > 0 && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          <span className="text-xs text-gray-400">
            {selectedMoods.length} selected
          </span>
          <button
            onClick={() => onMoodChange([])}
            className="text-xs text-purple-300 hover:text-purple-200 transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
} 