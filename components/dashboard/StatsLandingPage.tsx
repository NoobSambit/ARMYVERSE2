'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Music, User, ArrowRight, AlertCircle, BarChart3, History, LayoutGrid } from 'lucide-react'

interface StatsLandingPageProps {
  onSubmit: (username: string, provider: 'lastfm' | 'statsfm') => void
  error?: string | null
}

export default function StatsLandingPage({ onSubmit, error }: StatsLandingPageProps) {
  const [username, setUsername] = useState('')
  const [provider, setProvider] = useState<'lastfm' | 'statsfm'>('lastfm')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onSubmit(username.trim(), provider)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen bg-[#131023] text-white font-display overflow-x-hidden relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#330df2]/20 blur-[80px] md:blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#7b1fa2]/20 blur-[60px] md:blur-[100px]"></div>
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-[#330df2]/5 blur-[50px] md:blur-[80px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-[#292249] bg-[#131023]/80 backdrop-blur-md px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="size-6 md:size-8 text-[#330df2]">
              <BarChart3 className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h2 className="text-white text-lg md:text-xl font-bold tracking-tight">ARMYVERSE</h2>
          </div>
          <a
            href="/"
            className="text-xs md:text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Home
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-3 md:p-4 lg:p-8 xl:p-12 py-8 md:py-12">
        <motion.div
          className="w-full max-w-7xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 md:gap-4 lg:gap-6 auto-rows-min lg:auto-rows-fr">
            {/* Grid Item 1: Bias Analysis (Left Top) */}
            <motion.div
              variants={itemVariants}
              className="group lg:col-span-3 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col justify-between h-48 md:h-56 lg:h-auto relative overflow-hidden bg-gradient-to-br from-[rgba(29,24,52,0.4)] to-[rgba(29,24,52,0.2)] backdrop-blur-[20px] border border-white/10 hover:border-[#330df2]/50 transition-all duration-300"
            >
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <LayoutGrid className="w-24 h-24 md:w-40 md:h-40" />
              </div>
              <div>
                <div className="size-8 md:size-12 rounded-full bg-[#330df2]/20 flex items-center justify-center mb-2 md:mb-4 border border-[#330df2]/30">
                  <BarChart3 className="w-4 h-4 md:w-6 md:h-6 text-[#330df2]" />
                </div>
                <h3 className="text-sm md:text-base lg:text-lg font-bold mb-0.5 md:mb-1">Bias Analysis</h3>
                <p className="text-[10px] md:text-xs lg:text-sm text-gray-400 line-clamp-2">Deep dive into your member-specific listening habits.</p>
              </div>
              {/* Mini Bar Chart */}
              <div className="mt-2 md:mt-4 flex gap-1.5 md:gap-2 items-end h-10 md:h-16 w-full">
                <div className="w-1/4 bg-[#330df2]/40 rounded-t h-[60%]"></div>
                <div className="w-1/4 bg-[#330df2]/60 rounded-t h-[90%]"></div>
                <div className="w-1/4 bg-[#7b1fa2]/60 rounded-t h-[40%]"></div>
                <div className="w-1/4 bg-white/20 rounded-t h-[70%]"></div>
              </div>
            </motion.div>

            {/* Grid Item 2: Central Input Module */}
            <motion.div
              variants={itemVariants}
              className="md:col-span-2 lg:col-span-6 lg:row-span-2 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 xl:p-12 flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-[rgba(29,24,52,0.4)] to-[rgba(29,24,52,0.2)] backdrop-blur-[20px] border border-white/10 shadow-[0_0_50px_rgba(51,13,242,0.15)] order-first lg:order-none"
            >
              {/* Background gradient inside card */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#330df2] to-[#7b1fa2]"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-[#330df2]/10 rounded-full blur-3xl -z-10"></div>

              <div className="relative z-10 flex flex-col gap-4 md:gap-6">
                {/* Title */}
                <div className="text-center mb-1 md:mb-2">
                  <div className="inline-flex items-center justify-center p-2 md:p-3 mb-3 md:mb-4 rounded-full bg-white/5 border border-white/10">
                    <Music className="w-5 h-5 md:w-8 md:h-8 text-white" />
                  </div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-1 md:mb-2 tracking-tight px-2">Connect Your Music Service</h1>
                  <p className="text-gray-400 text-xs md:text-sm lg:text-base px-2">Visualize your streaming journey across the ARMYVERSE.</p>
                </div>

                {/* Service Selection */}
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 px-2">
                  <div className="bg-[#131023]/60 p-1 md:p-1.5 rounded-xl flex w-full max-w-md mx-auto border border-white/5">
                    <button
                      type="button"
                      onClick={() => setProvider('lastfm')}
                      className={`flex-1 py-2 md:py-2.5 px-3 md:px-4 rounded-lg text-center text-xs md:text-sm font-medium transition-all ${
                        provider === 'lastfm'
                          ? 'bg-[#330df2] text-white shadow-lg shadow-[#330df2]/40'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Last.fm
                    </button>
                    <button
                      type="button"
                      onClick={() => setProvider('statsfm')}
                      className={`flex-1 py-2 md:py-2.5 px-3 md:px-4 rounded-lg text-center text-xs md:text-sm font-medium transition-all ${
                        provider === 'statsfm'
                          ? 'bg-[#330df2] text-white shadow-lg shadow-[#330df2]/40'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Stats.fm
                    </button>
                  </div>

                  {/* Username Input */}
                  <div className="w-full max-w-md mx-auto space-y-3 md:space-y-4">
                    <div className="relative group/input">
                      <label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-1 md:mb-1.5 ml-1">Username</label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder={provider === 'lastfm' ? 'e.g. army_listener_07' : 'e.g. bts_fan_123'}
                          className="w-full bg-[#131023]/80 border border-[#292249] text-white text-base md:text-lg rounded-xl px-4 md:px-5 py-3 md:py-4 pl-10 md:pl-12 focus:ring-2 focus:ring-[#330df2] focus:border-[#330df2] transition-all placeholder:text-gray-600"
                        />
                        <User className="absolute left-3.5 md:left-4 w-4 h-4 md:w-5 md:h-5 text-gray-500 group-focus-within/input:text-[#330df2] transition-colors" />
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-500 mt-1.5 md:mt-2 flex items-center gap-1 px-1">
                        <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                        Your profile must be public to retrieve stats.
                      </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-2 md:p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-200 text-xs md:text-sm"
                      >
                        <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    {/* CTA Button */}
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#330df2] to-[#7b1fa2] p-[1px] focus:outline-none"
                    >
                      <div className="relative flex items-center justify-center gap-2 rounded-[11px] bg-[#131023] group-hover:bg-transparent px-4 md:px-6 py-3 md:py-4 transition-colors duration-300">
                        <span className="text-sm md:text-base lg:text-lg font-bold text-white">View Stats Dashboard</span>
                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-white transition-transform group-hover:translate-x-1" />
                      </div>
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>

            {/* Grid Item 3: Timeline Feature (Right Top) */}
            <motion.div
              variants={itemVariants}
              className="group lg:col-span-3 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col justify-between h-48 md:h-56 lg:h-auto relative overflow-hidden bg-gradient-to-br from-[rgba(29,24,52,0.4)] to-[rgba(29,24,52,0.2)] backdrop-blur-[20px] border border-white/10 hover:border-[#7b1fa2]/50 transition-all duration-300"
            >
              <div className="absolute -left-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <History className="w-24 h-24 md:w-40 md:h-40" />
              </div>
              <div>
                <div className="size-8 md:size-12 rounded-full bg-[#7b1fa2]/20 flex items-center justify-center mb-2 md:mb-4 border border-[#7b1fa2]/30">
                  <History className="w-4 h-4 md:w-6 md:h-6 text-[#7b1fa2]" />
                </div>
                <h3 className="text-sm md:text-base lg:text-lg font-bold mb-0.5 md:mb-1">Timeline</h3>
                <p className="text-[10px] md:text-xs lg:text-sm text-gray-400 mb-2 md:mb-4">Track your obsession over time.</p>
              </div>
              {/* Wavy Chart Visualization */}
              <div className="mt-auto relative h-10 md:h-16 w-full flex items-end">
                <svg className="w-full h-full text-[#7b1fa2] opacity-60" preserveAspectRatio="none" viewBox="0 0 100 40">
                  <path d="M0 30 Q 10 10, 20 25 T 40 15 T 60 25 T 80 10 T 100 20 L 100 40 L 0 40 Z" fill="currentColor"></path>
                </svg>
              </div>
            </motion.div>

            {/* Grid Item 4: Recent Tracks (Left Bottom) */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-3 rounded-xl md:rounded-2xl p-0 flex flex-col overflow-hidden hover:scale-[1.02] transition-transform duration-300 h-48 md:h-56 lg:h-auto bg-gradient-to-br from-[rgba(29,24,52,0.4)] to-[rgba(29,24,52,0.2)] backdrop-blur-[20px] border border-white/10"
            >
              <div className="p-3 md:p-4 lg:p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <h3 className="text-[10px] md:text-xs lg:text-sm font-bold uppercase tracking-wider text-gray-300">Recent Tracks</h3>
                <Music className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
              </div>
              <div className="p-2 md:p-3 lg:p-4 space-y-2 md:space-y-3 flex-1 overflow-hidden">
                {/* Track Item 1 */}
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="size-8 md:size-10 rounded bg-gradient-to-br from-[#330df2] to-[#7b1fa2]"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] md:text-xs lg:text-sm font-bold truncate">Seven (feat. Latto)</p>
                    <p className="text-[9px] md:text-[10px] lg:text-xs text-gray-400 truncate">Jung Kook</p>
                  </div>
                  <span className="text-[9px] md:text-xs font-mono text-[#330df2]">Now</span>
                </div>
                {/* Track Item 2 */}
                <div className="flex items-center gap-2 md:gap-3 opacity-70">
                  <div className="size-8 md:size-10 rounded bg-gradient-to-br from-[#330df2]/60 to-[#7b1fa2]/60"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] md:text-xs lg:text-sm font-bold truncate">Dynamite</p>
                    <p className="text-[9px] md:text-[10px] lg:text-xs text-gray-400 truncate">BTS</p>
                  </div>
                  <span className="text-[9px] md:text-xs font-mono text-gray-500">4m</span>
                </div>
                {/* Track Item 3 */}
                <div className="flex items-center gap-2 md:gap-3 opacity-50">
                  <div className="size-8 md:size-10 rounded bg-gradient-to-br from-[#330df2]/30 to-[#7b1fa2]/30"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] md:text-xs lg:text-sm font-bold truncate">Like Crazy</p>
                    <p className="text-[9px] md:text-[10px] lg:text-xs text-gray-400 truncate">Jimin</p>
                  </div>
                  <span className="text-[9px] md:text-xs font-mono text-gray-500">8m</span>
                </div>
              </div>
            </motion.div>

            {/* Grid Item 5: BTS Percentage Preview (Right Bottom) */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-3 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center relative hover:scale-[1.02] transition-transform duration-300 h-48 md:h-56 lg:h-auto bg-gradient-to-br from-[rgba(51,13,242,0.1)] to-[rgba(29,24,52,0.2)] backdrop-blur-[20px] border border-white/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#330df2]/10 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 md:mb-2 flex items-baseline justify-center gap-0.5 md:gap-1">
                  100<span className="text-lg md:text-2xl text-[#330df2]">%</span>
                </div>
                <h3 className="text-[10px] md:text-xs lg:text-sm font-bold uppercase tracking-wider text-gray-300 mb-2 md:mb-4">BTS Percentage</h3>
                <div className="w-full bg-gray-800 rounded-full h-1.5 md:h-2 max-w-[80px] md:max-w-[120px] mx-auto overflow-hidden">
                  <div className="bg-[#330df2] h-full w-full rounded-full animate-pulse"></div>
                </div>
                <p className="text-[9px] md:text-xs text-gray-500 mt-2 md:mt-4 px-2">You are a certified ARMY.</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/5 bg-[#131023]/60 backdrop-blur-md mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 text-center md:text-left">
          <p className="text-gray-500 text-[10px] md:text-xs lg:text-sm">© 2024 ARMYVERSE. Fan project, not affiliated with HYBE.</p>
          <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center">
            <a className="text-gray-400 hover:text-white text-[10px] md:text-xs lg:text-sm transition-colors" href="/privacy">
              Privacy Policy
            </a>
            <div className="h-3 md:h-4 w-px bg-white/10"></div>
            <a className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs lg:text-sm text-gray-300 hover:text-white transition-colors group" href="https://www.last.fm/join" target="_blank" rel="noopener noreferrer">
              <span className="hidden sm:inline">Don&apos;t have an account?</span>
              <span className="text-[#330df2] font-bold group-hover:underline">Join Last.fm</span>
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
