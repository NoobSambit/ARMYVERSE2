'use client'

import React, { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Image as ImageIcon, Upload, X, Check, AlertCircle } from 'lucide-react'
import { track } from '@/lib/utils/analytics'

interface BannerUploaderProps {
  currentUrl: string
  onUpload: (url: string) => void
  loading?: boolean
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function BannerUploader({ currentUrl, onUpload, loading = false }: BannerUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please upload a JPEG, PNG, or WebP image'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB'
    }
    return null
  }

  const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new window.Image()

      img.onload = () => {
        // Calculate new dimensions maintaining 16:6 aspect ratio
        let { width, height } = img
        const targetRatio = 16 / 6
        
        if (width / height > targetRatio) {
          // Image is too wide, crop width
          width = height * targetRatio
        } else {
          // Image is too tall, crop height
          height = width / targetRatio
        }

        canvas.width = maxWidth
        canvas.height = maxWidth / targetRatio

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', quality)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      // Validate file
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      // Compress image
      const compressedFile = await compressImage(file)
      
      // Create form data
      const formData = new FormData()
      formData.append('file', compressedFile, 'banner.jpg')
      formData.append('type', 'banner')

      // Upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await response.json()
      onUpload(url)
      setPreview(null)
      await track('banner_uploaded', { fileSize: file.size, fileType: file.type })
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = useCallback((file: File) => {
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    uploadFile(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleRemove = useCallback(() => {
    onUpload('')
    setPreview(null)
    setError(null)
  }, [onUpload])

  const displayUrl = preview || currentUrl

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative w-full h-32 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
          dragActive
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-dashed border-gray-600 hover:border-purple-500/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Upload banner image"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
      >
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt="Profile banner"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Upload banner image</p>
              <p className="text-xs text-gray-500">16:6 aspect ratio recommended</p>
            </div>
          </div>
        )}

        {/* Overlay */}
        {displayUrl && (
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="w-6 h-6 text-white mx-auto mb-1" />
              <p className="text-xs text-white">Change</p>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-white">Uploading...</p>
            </div>
          </div>
        )}

        {/* Success Indicator */}
        {!uploading && displayUrl && !error && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Error Indicator */}
        {error && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Select banner image file"
      />

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading || loading}
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors text-sm"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        {displayUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading || loading}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors text-sm"
          >
            <X className="w-4 h-4" />
            Remove
          </button>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        <p>• Drag and drop or click to upload</p>
        <p>• JPEG, PNG, WebP up to 10MB</p>
        <p>• Recommended: 1200x450px (16:6 aspect ratio)</p>
        <p>• Image will be automatically cropped to fit</p>
      </div>
    </div>
  )
}
