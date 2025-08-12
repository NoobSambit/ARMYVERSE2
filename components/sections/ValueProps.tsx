'use client'

import { Music, BrainCircuit, BarChart3, Sparkles } from 'lucide-react'
import React from 'react'

export default function ValueProps() {
  const cards = [
    {
      icon: <TrendingIcon />,
      title: 'Live BTS Trends',
      desc: 'See what’s trending across Spotify and YouTube for BTS and each member.'
    },
    {
      icon: <BrainCircuit className="w-6 h-6 text-purple-300" />,
      title: 'AI Playlists',
      desc: 'Generate curated playlists from your vibe, mood, or activity in seconds.'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-300" />,
      title: 'Personal Stats',
      desc: 'Dive into your Spotify habits, top artists, and listening patterns.'
    }
  ]

  return (
    <div className="bg-black/30 backdrop-blur-lg rounded-2xl border border-purple-500/20 px-4 py-8 sm:px-6">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">What is ARMYVERSE?</h2>
        <p className="text-gray-300 text-sm sm:text-base">Your one-stop hub to explore BTS trends, craft AI-powered playlists, and track your listening analytics — made with love for ARMY.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.title} className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4">
            <div className="flex items-center gap-3 mb-2">
              {c.icon}
              <h3 className="text-white font-semibold text-base">{c.title}</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrendingIcon() {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-purple-600/20 text-purple-300">
      <Music className="w-4 h-4" />
    </span>
  )
}

