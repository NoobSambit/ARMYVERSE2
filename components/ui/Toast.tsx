'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  type: ToastType
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

const toastStyles = {
  success: 'bg-green-500/20 border-green-500 text-green-300',
  error: 'bg-red-500/20 border-red-500 text-red-300',
  warning: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
  info: 'bg-blue-500/20 border-blue-500 text-blue-300'
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: AlertCircle
}

export default function Toast({ type, message, isVisible, onClose, duration = 5000 }: ToastProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const Icon = toastIcons[type]

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-2">
      <div className={`
        flex items-center space-x-3 p-4 rounded-lg border backdrop-blur-sm shadow-lg
        ${toastStyles[type]}
        ${isAnimating ? 'animate-in slide-in-from-right-2' : 'animate-out slide-out-to-right-2'}
      `}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-current hover:opacity-70 transition-opacity"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Toast context for managing multiple toasts
interface ToastContextType {
  showToast: (type: ToastType, message: string) => void
}

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<{ id: string; type: ToastType; message: string }>>([])

  const showToast = (type: ToastType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, type, message }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          isVisible={true}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
} 