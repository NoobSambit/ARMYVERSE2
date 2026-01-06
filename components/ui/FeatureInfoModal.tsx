'use client'

import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, LucideIcon, Check } from 'lucide-react'
import { motion } from 'framer-motion'

interface FeatureDetails {
  icon: LucideIcon
  title: string
  description: string
  longDescription: string
  features: string[]
  accentColor: string
}

interface FeatureInfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  details: FeatureDetails
}

export default function FeatureInfoModal({ open, onOpenChange, details }: FeatureInfoModalProps) {
  const { icon: Icon, title, longDescription, features, accentColor } = details

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />

        <Dialog.Content
          className="fixed z-50 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[500px] rounded-[2rem] border border-white/10 bg-[#0A0A0A] shadow-2xl overflow-hidden focus:outline-none animate-in zoom-in-95 duration-200"
        >
          <div className="relative">
            {/* Header with gradient */}
            <div
              className="p-8 pb-6 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)`
              }}
            >
              {/* Subtle glow effect */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  boxShadow: `inset 0 0 60px ${accentColor}30`
                }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="p-4 rounded-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}15)`,
                      boxShadow: `0 4px 20px ${accentColor}40`
                    }}
                  >
                    <Icon
                      className="w-8 h-8"
                      style={{ color: accentColor }}
                    />
                  </div>

                  <Dialog.Close className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                    <X className="w-5 h-5" />
                  </Dialog.Close>
                </div>

                <Dialog.Title className="text-2xl font-bold text-white mb-2">
                  {title}
                </Dialog.Title>

                <Dialog.Description className="text-white/70 leading-relaxed">
                  {longDescription}
                </Dialog.Description>
              </div>
            </div>

            {/* Features List */}
            <div className="p-8 pt-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                Features
              </h3>

              <div className="space-y-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors"
                  >
                    <div
                      className="shrink-0 p-1.5 rounded-lg mt-0.5"
                      style={{
                        background: `${accentColor}20`
                      }}
                    >
                      <Check
                        className="w-3.5 h-3.5"
                        style={{ color: accentColor }}
                      />
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">
                      {feature}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
