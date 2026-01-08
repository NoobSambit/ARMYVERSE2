'use client'

import React, { useState } from 'react'
import { X, ArrowLeft } from 'lucide-react'

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

interface PersonalityQuizProps {
  onClose: () => void
  onComplete: (config: PlaylistConfig) => void
}

const QUESTIONS = [
  {
    question: "What's your current vibe?",
    options: [
      { label: 'Need energy boost', moods: ['energetic'], valence: 75 },
      { label: 'Feeling emotional', moods: ['sentimental'], valence: 35 },
      { label: 'Want to relax', moods: ['chill', 'acoustic'], valence: 55 },
      { label: 'In my feels (dark)', moods: ['dark'], valence: 25 }
    ]
  },
  {
    question: 'Pick your listening scenario',
    options: [
      { label: 'Working out', context: 'workout', danceability: 85 },
      { label: 'Studying/Working', context: 'study', danceability: 30 },
      { label: 'Commuting', context: 'commute', danceability: 60 },
      { label: 'Before sleep', context: 'sleep', danceability: 20 }
    ]
  },
  {
    question: 'Which BTS era speaks to you most?',
    options: [
      { label: 'Early days (2013-2014)', era: '2013-2014' },
      { label: 'HYYH (2015-2016)', era: '2015-2016' },
      { label: 'Love Yourself (2017-2018)', era: '2017-2018' },
      { label: 'Recent/Solo work', era: '2022-2023' }
    ]
  },
  {
    question: 'Rap line or Vocal line?',
    options: [
      { label: 'Rap line all the way', members: ['RM', 'SUGA', 'j-hope'], hiphop: 60 },
      { label: 'Vocal line forever', members: ['Jin', 'Jimin', 'V', 'Jung Kook'], ballad: 50 },
      { label: 'Both equally', members: ['BTS'], balanced: true },
      { label: 'Solo work focus', members: ['RM', 'Jin', 'SUGA', 'j-hope', 'Jimin', 'V', 'Jung Kook'] }
    ]
  },
  {
    question: 'What kind of playlist flow?',
    options: [
      { label: 'Build up energy', flowPattern: 'slow-build' },
      { label: 'Consistent vibe', flowPattern: 'consistent' },
      { label: 'Mix it up', flowPattern: 'wave' },
      { label: 'Start strong, end calm', flowPattern: 'cool-down' }
    ]
  },
  {
    question: 'How long should your playlist be?',
    options: [
      { label: 'Quick (10-15 songs)', length: 12 },
      { label: 'Medium (20-25 songs)', length: 22 },
      { label: 'Long (30-40 songs)', length: 35 },
      { label: 'Marathon (40+ songs)', length: 50 }
    ]
  }
]

export default function PersonalityQuiz({ onClose, onComplete }: PersonalityQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<any[]>([])

  const handleAnswer = (answer: any) => {
    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Quiz complete, calculate config
      const config = calculateConfig(newAnswers)
      onComplete(config)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setAnswers(answers.slice(0, -1))
    }
  }

  const calculateConfig = (answers: any[]): PlaylistConfig => {
    let moods: string[] = []
    let members: string[] = ['BTS']
    let audioFeatures = { danceability: 50, valence: 50 }
    let genreMix = {
      ballad: 16.67,
      hiphop: 16.67,
      edm: 16.67,
      rnb: 16.67,
      rock: 16.67,
      dancePop: 16.66
    }
    let era = 'all'
    let context = 'auto'
    let flowPattern = 'slow-build'
    let length = 20

    answers.forEach(answer => {
      if (answer.moods) moods.push(...answer.moods)
      if (answer.members) members = answer.members
      if (answer.valence !== undefined) audioFeatures.valence = answer.valence
      if (answer.danceability !== undefined) audioFeatures.danceability = answer.danceability
      if (answer.era) era = answer.era
      if (answer.context) context = answer.context
      if (answer.flowPattern) flowPattern = answer.flowPattern
      if (answer.length) length = answer.length

      // Genre mix adjustments
      if (answer.hiphop) {
        genreMix.hiphop = answer.hiphop
        genreMix.ballad = (100 - answer.hiphop) / 5
        genreMix.edm = (100 - answer.hiphop) / 5
        genreMix.rnb = (100 - answer.hiphop) / 5
        genreMix.rock = (100 - answer.hiphop) / 5
        genreMix.dancePop = (100 - answer.hiphop) / 5
      }
      if (answer.ballad) {
        genreMix.ballad = answer.ballad
        genreMix.hiphop = (100 - answer.ballad) / 5
        genreMix.edm = (100 - answer.ballad) / 5
        genreMix.rnb = (100 - answer.ballad) / 5
        genreMix.rock = (100 - answer.ballad) / 5
        genreMix.dancePop = (100 - answer.ballad) / 5
      }
    })

    // Generate prompt based on answers
    const moodStr = moods.length > 0 ? moods.join(', ') : 'balanced'
    const prompt = `A ${moodStr} playlist for ${context} with ${members.includes('BTS') && members.length === 1 ? 'OT7' : members.filter(m => m !== 'BTS').join(', ')} focus`

    return {
      name: 'My Personality Playlist',
      prompt,
      moods,
      members,
      era,
      format: 'standard',
      length,
      audioFeatures,
      genreMix,
      flowPattern,
      context,
      lyricalMatch: false,
      seedTracks: []
    }
  }

  const question = QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel rounded-3xl w-full max-w-2xl border border-white/10 overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Personality Quiz</h2>
            <p className="text-sm text-gray-400 mt-1">
              Question {currentQuestion + 1} of {QUESTIONS.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Question */}
        <div className="p-8">
          <h3 className="text-xl font-bold text-white mb-6">{question.question}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                className="group p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-purple-500/50 transition-all text-left relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all"></div>
                <div className="relative z-10">
                  <p className="text-white font-medium">{option.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
          >
            Skip Quiz
          </button>
        </div>
      </div>
    </div>
  )
}
