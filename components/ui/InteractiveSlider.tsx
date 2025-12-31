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
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-white font-medium">{label}</label>
          <span className="text-purple-300 font-semibold text-sm">{value} songs</span>
        </div>
      )}
      
      {!label && (
         <div className="flex justify-end mb-1">
            <span className="text-white font-medium text-sm bg-white/10 px-2 py-0.5 rounded-md border border-white/5">{value} songs</span>
         </div>
      )}
      
      <div className="relative py-2">
        <div
          ref={sliderRef}
          className="h-2 bg-white/5 rounded-full cursor-pointer relative border border-white/10"
          onMouseDown={handleMouseDown}
        >
          {/* Progress */}
          <div 
            className="absolute inset-y-0 left-0 bg-purple-500 rounded-full transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
          
          {/* Thumb */}
          <div
            className={`absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 border-2 border-purple-500 ${
              isDragging ? 'scale-125 ring-2 ring-purple-500/30' : 'hover:scale-110'
            }`}
            style={{ left: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
} 