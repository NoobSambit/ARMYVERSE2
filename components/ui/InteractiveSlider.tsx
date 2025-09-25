'use client'

import React, { useState, useRef, useEffect } from 'react'

interface InteractiveSliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  label: string
  className?: string
}

export default function InteractiveSlider({ 
  value, 
  onChange, 
  min, 
  max, 
  step, 
  label, 
  className = '' 
}: InteractiveSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    handleMouseMove(e)
  }

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isDragging || !sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    const newValue = Math.round((percentage * (max - min) + min) / step) * step
    onChange(newValue)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-white font-medium">{label}</label>
        <span className="text-pink-400 font-semibold">{value} songs</span>
      </div>
      
      <div className="relative">
        <div
          ref={sliderRef}
          className="h-4 bg-white/10 rounded-full cursor-pointer relative border border-white/20 backdrop-blur-sm"
          onMouseDown={handleMouseDown}
        >
          {/* Track */}
          <div className="absolute inset-0 bg-white/10 rounded-full backdrop-blur-sm" />
          
          {/* Progress */}
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-200 shadow-lg"
            style={{ width: `${percentage}%` }}
          />
          
          {/* Thumb */}
          <div
            className={`absolute top-1/2 w-6 h-6 bg-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
              isDragging ? 'scale-110 shadow-xl ring-2 ring-purple-400' : 'hover:scale-105'
            }`}
            style={{ left: `${percentage}%` }}
          />
        </div>
        
        {/* Tick marks */}
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          {[min, Math.round((min + max) / 2), max].map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
      </div>
    </div>
  )
} 