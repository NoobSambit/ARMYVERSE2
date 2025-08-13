'use client'

import React from 'react'
import SignUpForm from '@/components/auth/SignUpForm'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] to-[#3b1d60] relative overflow-hidden flex items-center justify-center py-10 px-6">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(1200px_1200px_at_0%_0%,rgba(255,255,255,0.06),transparent_60%),radial-gradient(1200px_1200px_at_100%_100%,rgba(255,255,255,0.06),transparent_60%)]" />
      <div className="w-full max-w-5xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left: Form */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] flex">
            <div className="w-full self-center">
              <SignUpForm embedded hideHeader />
            </div>
          </div>

          {/* Right: Benefits */}
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-purple-500/20 flex">
            <div className="self-center w-full">
              <div className="text-center lg:text-left mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Why join ARMYVERSE?</h2>
                <p className="text-gray-300 mt-1">Unlock tools built for ARMY — no clutter, just vibes.</p>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block w-2.5 h-2.5 rounded-full bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.8)]" />
                  <p className="text-white/90">Create and manage custom BTS playlists with ease</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.8)]" />
                  <p className="text-white/90">AI-assisted recommendations and mood-based curation</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                  <p className="text-white/90">Connect Spotify to see BTS listening insights</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
                  <p className="text-white/90">Track trends and discover what’s hot right now</p>
                </li>
              </ul>

              <div className="mt-8">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                <p className="text-xs text-gray-400 mt-3 text-center lg:text-left">No spam. You can delete your account anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
