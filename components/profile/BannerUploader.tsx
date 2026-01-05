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
  const [croppingImage, setCroppingImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number } | null>(null)
  const [cropAxis, setCropAxis] = useState<'vertical' | 'horizontal'>('vertical')
  const [cropPosition, setCropPosition] = useState(0.5)
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

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      const compressedFile = await compressImage(file)
      
      const formData = new FormData()
      formData.append('file', compressedFile, 'banner.jpg')
      formData.append('type', 'banner')

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
  }, [onUpload])

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (!result) return
      setCroppingImage(result)
      const img = new window.Image()
      img.onload = () => {
        const width = img.naturalWidth
        const height = img.naturalHeight
        setImageMeta({ width, height })
        const targetRatio = 16 / 6
        const imageRatio = width / height
        if (imageRatio > targetRatio) {
          setCropAxis('horizontal')
        } else {
          setCropAxis('vertical')
        }
        setCropPosition(0.5)
      }
      img.src = result
    }
    reader.readAsDataURL(file)
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

  const closeCropper = useCallback(() => {
    setCroppingImage(null)
    setSelectedFile(null)
    setImageMeta(null)
    setCropPosition(0.5)
  }, [])

  const handleCropCancel = useCallback(() => {
    closeCropper()
  }, [closeCropper])

  const handleCropConfirm = useCallback(async () => {
    if (!croppingImage || !selectedFile || !imageMeta) {
      return
    }
    try {
      const targetRatio = 16 / 6
      let cropWidth = imageMeta.width
      let cropHeight = cropWidth / targetRatio
      let offsetX = 0
      let offsetY = 0

      if (cropHeight > imageMeta.height) {
        cropHeight = imageMeta.height
        cropWidth = cropHeight * targetRatio
        const maxOffsetX = imageMeta.width - cropWidth
        offsetX = maxOffsetX * cropPosition
      } else {
        const maxOffsetY = imageMeta.height - cropHeight
        offsetY = maxOffsetY * cropPosition
      }

      const canvas = document.createElement('canvas')
      const outputWidth = 1200
      canvas.width = outputWidth
      canvas.height = outputWidth / targetRatio
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Failed to process image')
      }

      const img = new window.Image()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = croppingImage
      })

      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height
      )

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) {
            resolve(result)
          } else {
            reject(new Error('Failed to create image blob'))
          }
        }, 'image/jpeg', 0.9)
      })

      const croppedFile = new File([blob], selectedFile.name || 'banner.jpg', { type: 'image/jpeg' })

      setPreview(dataUrl)
      closeCropper()
      await uploadFile(croppedFile)
    } catch (err) {
      console.error('Crop error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process image')
    }
  }, [closeCropper, cropPosition, croppingImage, imageMeta, selectedFile, uploadFile])

  const displayUrl = preview || currentUrl

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative w-full h-32 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
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
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl transition-colors text-sm"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        {displayUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading || loading}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-xl transition-colors text-sm"
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
            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
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
        <p>• Adjust the visible section before saving</p>
      </div>

      <AnimatePresence>
        {croppingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6"
          >
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-purple-500/30 bg-[#150424]">
              <div className="relative aspect-[16/6] w-full bg-black/80">
                <img
                  src={croppingImage}
                  alt="Crop preview"
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition:
                      cropAxis === 'vertical'
                        ? `50% ${Math.round(cropPosition * 100)}%`
                        : `${Math.round(cropPosition * 100)}% 50%`
                  }}
                />
                <div className="pointer-events-none absolute inset-0 border-2 border-purple-500/60" />
              </div>
              <div className="flex flex-col gap-4 border-t border-purple-500/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full max-w-sm items-center gap-3">
                  <span className="text-xs text-gray-400 capitalize">
                    {cropAxis === 'vertical' ? 'Vertical' : 'Horizontal'} focus
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(cropPosition * 100)}
                    onChange={(e) => setCropPosition(Number(e.target.value) / 100)}
                    className="h-1 flex-1 appearance-none rounded-full bg-gray-700"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCropCancel}
                    className="rounded-xl bg-gray-700 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCropConfirm}
                    disabled={uploading}
                    className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Save selection
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
