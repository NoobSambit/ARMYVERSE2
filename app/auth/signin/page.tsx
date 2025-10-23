'use client'

import React from 'react'
import SignInForm from '@/components/auth/SignInForm'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] to-[#3b1d60] relative overflow-hidden flex items-center justify-center py-10 px-6">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(1200px_1200px_at_0%_0%,rgba(255,255,255,0.06),transparent_60%),radial-gradient(1200px_1200px_at_100%_100%,rgba(255,255,255,0.06),transparent_60%)]" />
      <div className="w-full max-w-5xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left: Form */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] flex">
            <div className="w-full self-center">
              <SignInForm embedded hideHeader />
            </div>
          </div>

          {/* Right: Welcome Back */}
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-purple-500/20 flex">
            <div className="self-center w-full">
              {/* BTS Image */}
              <div className="mb-6 rounded-xl overflow-hidden border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <img 
                  src="https://res.cloudinary.com/dacgtjw7w/image/upload/v1761222091/1000_gjhkhd.webp"
                  alt="BTS"
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              <div className="text-center lg:text-left mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Welcome Back, ARMY!</h2>
                <p className="text-gray-300 mt-1">Continue your journey in the ARMYVERSE.</p>
              </div>
              <ul className="space-y-3.5">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block w-2.5 h-2.5 rounded-full bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.8)] flex-shrink-0" />
                  <p className="text-white/90 text-sm">Your playlists and collections are waiting</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.8)] flex-shrink-0" />
                  <p className="text-white/90 text-sm">Continue your mastery progress and quests</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)] flex-shrink-0" />
                  <p className="text-white/90 text-sm">Check out new trending content and analytics</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)] flex-shrink-0" />
                  <p className="text-white/90 text-sm">Share your latest blog posts with the community</p>
                </li>
              </ul>

              <div className="mt-8">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                <p className="text-xs text-gray-400 mt-3 text-center lg:text-left">Missed us? We missed you too! 💜</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
