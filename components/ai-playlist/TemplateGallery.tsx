'use client'

import React from 'react'
import { X, Sparkles, Dumbbell, Heart, Clock, Mic, Music } from 'lucide-react'

interface PlaylistConfig {
  name: string
  prompt: string
  moods: string[]
  members: string[]
  era: string
  format: string
  length: number
  audioFeatures: {
    danceability: number
    valence: number
  }
  genreMix: {
    ballad: number
    hiphop: number
    edm: number
    rnb: number
    rock: number
    dancePop: number
  }
  flowPattern: string
  context: string
  lyricalMatch: boolean
  seedTracks: any[]
}

interface TemplateGalleryProps {
  onClose: () => void
  onApplyTemplate: (config: PlaylistConfig) => void
}

const TEMPLATES: Array<PlaylistConfig & { icon: any; description: string; color: string }> = [
  {
    icon: Dumbbell,
    name: 'Gym Beast Mode',
    description: 'High-energy workout playlist with rap line focus',
    prompt: 'Intense high-energy workout songs with powerful rap and heavy beats',
    moods: ['energetic', 'dark'],
    members: ['BTS', 'SUGA', 'RM', 'j-hope'],
    era: 'all',
    format: 'standard',
    length: 25,
    audioFeatures: { danceability: 85, valence: 70 },
    genreMix: { ballad: 5, hiphop: 50, edm: 20, rnb: 10, rock: 10, dancePop: 5 },
    flowPattern: 'slow-build',
    context: 'workout',
    lyricalMatch: false,
    seedTracks: [],
    color: 'from-red-600 to-orange-600'
  },
  {
    icon: Heart,
    name: 'Healing Hour',
    description: 'Calm ballads and soothing vocal line tracks',
    prompt: 'Comforting and healing songs with beautiful vocals and emotional lyrics',
    moods: ['sentimental', 'acoustic', 'chill'],
    members: ['BTS', 'Jin', 'Jimin', 'V', 'Jung Kook'],
    era: 'all',
    format: 'standard',
    length: 20,
    audioFeatures: { danceability: 25, valence: 40 },
    genreMix: { ballad: 60, hiphop: 5, edm: 0, rnb: 20, rock: 5, dancePop: 10 },
    flowPattern: 'consistent',
    context: 'sleep',
    lyricalMatch: true,
    seedTracks: [],
    color: 'from-purple-600 to-pink-600'
  },
  {
    icon: Clock,
    name: '2013-2015 Nostalgia',
    description: 'Early era classics from the School Trilogy and HYYH',
    prompt: 'Nostalgic songs from BTS early eras capturing their debut sound and HYYH vibes',
    moods: ['retro', 'energetic'],
    members: ['BTS'],
    era: '2013-2014',
    format: 'standard',
    length: 20,
    audioFeatures: { danceability: 65, valence: 60 },
    genreMix: { ballad: 15, hiphop: 40, edm: 10, rnb: 15, rock: 10, dancePop: 10 },
    flowPattern: 'wave',
    context: 'auto',
    lyricalMatch: false,
    seedTracks: [],
    color: 'from-blue-600 to-cyan-600'
  },
  {
    icon: Sparkles,
    name: 'Chapter 2 Solo Journey',
    description: 'Recent solo releases and member projects',
    prompt: 'Diverse solo tracks showcasing each member\'s unique artistry and style',
    moods: ['energetic', 'dark', 'chill'],
    members: ['RM', 'Jin', 'SUGA', 'j-hope', 'Jimin', 'V', 'Jung Kook'],
    era: '2022-2023',
    format: 'standard',
    length: 30,
    audioFeatures: { danceability: 60, valence: 55 },
    genreMix: { ballad: 20, hiphop: 25, edm: 15, rnb: 20, rock: 10, dancePop: 10 },
    flowPattern: 'random',
    context: 'auto',
    lyricalMatch: false,
    seedTracks: [],
    color: 'from-indigo-600 to-purple-600'
  },
  {
    icon: Music,
    name: 'Study Focus',
    description: 'Calm and focused instrumentals and soft vocals',
    prompt: 'Calm, focused songs perfect for studying or deep work',
    moods: ['chill', 'acoustic'],
    members: ['BTS'],
    era: 'all',
    format: 'instrumental',
    length: 35,
    audioFeatures: { danceability: 30, valence: 50 },
    genreMix: { ballad: 40, hiphop: 10, edm: 5, rnb: 30, rock: 5, dancePop: 10 },
    flowPattern: 'consistent',
    context: 'study',
    lyricalMatch: false,
    seedTracks: [],
    color: 'from-green-600 to-emerald-600'
  },
  {
    icon: Mic,
    name: 'Rap Line Takeover',
    description: 'Pure hip-hop with RM, SUGA, and j-hope',
    prompt: 'Powerful rap tracks showcasing the rap line\'s incredible skills and wordplay',
    moods: ['dark', 'energetic'],
    members: ['RM', 'SUGA', 'j-hope'],
    era: 'all',
    format: 'standard',
    length: 25,
    audioFeatures: { danceability: 70, valence: 50 },
    genreMix: { ballad: 5, hiphop: 70, edm: 10, rnb: 10, rock: 5, dancePop: 0 },
    flowPattern: 'slow-build',
    context: 'auto',
    lyricalMatch: true,
    seedTracks: [],
    color: 'from-gray-700 to-gray-900'
  }
]

export default function TemplateGallery({ onClose, onApplyTemplate }: TemplateGalleryProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel rounded-3xl w-full max-w-6xl max-h-[85vh] flex flex-col border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Template Gallery</h2>
            <p className="text-sm text-gray-400 mt-1">
              Quick-start your playlist with pre-configured templates
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map((template) => {
              const Icon = template.icon
              return (
                <button
                  key={template.name}
                  onClick={() => onApplyTemplate(template)}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-900/30 p-6 text-left"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>

                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">{template.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {template.moods.slice(0, 3).map(mood => (
                        <span
                          key={mood}
                          className="px-2 py-1 rounded-full bg-white/10 text-[10px] text-gray-300"
                        >
                          {mood}
                        </span>
                      ))}
                      <span className="px-2 py-1 rounded-full bg-purple-500/20 text-[10px] text-purple-300">
                        {template.length} tracks
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
