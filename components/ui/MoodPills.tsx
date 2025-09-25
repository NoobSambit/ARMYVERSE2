'use client'

import React from 'react'

interface MoodPillsProps {
  selectedMoods: string[]
  onMoodChange: (moods: string[]) => void
  className?: string
}

const MOOD_OPTIONS = [
  { value: 'energetic', label: 'Energetic', emoji: '⚡', color: 'from-red-500 to-orange-500' },
  { value: 'chill', label: 'Chill', emoji: '😌', color: 'from-blue-500 to-indigo-500' },
  { value: 'uplifting', label: 'Uplifting', emoji: '✨', color: 'from-yellow-500 to-orange-500' },
  { value: 'melancholic', label: 'Melancholic', emoji: '🌧️', color: 'from-gray-500 to-blue-500' },
  { value: 'romantic', label: 'Romantic', emoji: '💕', color: 'from-pink-500 to-rose-500' },
  { value: 'nostalgic', label: 'Nostalgic', emoji: '🕰️', color: 'from-purple-500 to-indigo-500' },
  { value: 'confident', label: 'Confident', emoji: '💪', color: 'from-green-500 to-emerald-500' },
  { value: 'peaceful', label: 'Peaceful', emoji: '🕊️', color: 'from-teal-500 to-blue-500' },
  { value: 'dramatic', label: 'Dramatic', emoji: '🎭', color: 'from-purple-500 to-pink-500' },
  { value: 'playful', label: 'Playful', emoji: '🎈', color: 'from-pink-500 to-purple-500' }
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
      <label className="block text-white font-medium mb-2">
        Mood Selection
        <span className="text-gray-400 text-sm ml-2">(Optional)</span>
      </label>
      
      <div className="flex flex-wrap gap-2">
        {MOOD_OPTIONS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodToggle(mood.value)}
            className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center space-x-2 ${
              selectedMoods.includes(mood.value)
                ? `bg-gradient-to-r ${mood.color} border-white text-white shadow-lg`
                : 'bg-white/10 border-white/20 text-gray-300 hover:border-purple-400/50'
            }`}
          >
            <span className="text-lg">{mood.emoji}</span>
            <span className="text-sm font-medium">{mood.label}</span>
          </button>
        ))}
      </div>
      
      {selectedMoods.length > 0 && (
        <div className="flex items-center justify-between mt-3 p-3 bg-black/30 rounded-lg backdrop-blur-sm border border-white/20">
          <span className="text-sm text-gray-300">
            Selected: {selectedMoods.length} mood{selectedMoods.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => onMoodChange([])}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
} 