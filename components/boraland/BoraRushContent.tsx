'use client'

import React, { useState } from 'react'
import { Rocket, Trophy, Users, Brain, Zap, Clock, Star } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const BORARUSH_URL = process.env.NEXT_PUBLIC_BORARUSH_URL || 'https://borarush.netlify.app'

export default function BoraRushContent() {
    const { user } = useAuth()
    const [launching, setLaunching] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const launchGame = async () => {
        const popup = window.open('', '_blank')
        if (popup) {
            popup.opener = null
        }

        if (!user?.getIdToken) {
            const target = `${BORARUSH_URL}/game`
            if (popup) {
                popup.location.href = target
                popup.focus()
            } else {
                window.open(target, '_blank', 'noopener,noreferrer')
            }
            return
        }

        setLaunching(true)
        setError(null)
        try {
            const token = await user.getIdToken()
            const response = await fetch('/api/game/borarush/handoff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({})
            })
            const data = await response.json()
            if (!response.ok || !data?.token) {
                throw new Error(data?.error || 'Failed to launch BoraRush')
            }

            const target = `${BORARUSH_URL}/game?token=${encodeURIComponent(data.token)}`
            if (popup) {
                popup.location.href = target
                popup.focus()
            } else {
                window.open(target, '_blank', 'noopener,noreferrer')
            }
        } catch (err: any) {
            console.error('[BoraRush] Launch failed:', err)
            setError(err?.message || 'Failed to launch BoraRush')
            if (popup && !popup.closed) {
                popup.close()
            }
        } finally {
            setLaunching(false)
        }
    }

    return (
        <section className="flex-grow flex flex-col gap-6 overflow-y-auto scrollbar-hide">
            {/* Hero Section */}
            <div className="relative w-full rounded-3xl overflow-hidden p-8 md:p-10 border border-white/10 bg-gradient-to-br from-[#1a082a] via-[#2d1b4e] to-[#1a082a] shadow-2xl">
                <div className="absolute top-4 left-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span> New Release
                    </div>
                </div>

                <div className="flex flex-col items-start z-10 relative mt-4">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
                        ARMY Ladder Rush
                    </h1>
                    <h2 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent mb-6">
                        Classic Game with BTS Trivia
                    </h2>

                    <p className="text-gray-300 max-w-2xl text-lg mb-8 leading-relaxed">
                        Roll the dice, navigate the 100-tile board, and answer questions to climb ladders or avoid falling on snakes. The first player to reach tile 100 wins!
                    </p>

                    <div className="flex items-center gap-6 flex-wrap">
                        <button
                            onClick={launchGame}
                            disabled={launching}
                            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-lg px-8 py-3 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                        >
                            <Rocket className="w-6 h-6" />
                            {launching ? 'Preparing...' : 'Launch Game'}
                        </button>
                        <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                            <Trophy className="w-5 h-5" />
                            Win by reaching tile 100 and earn XP + a photocard!
                        </div>
                        <div className="text-xs text-gray-400">
                            Daily rewards: 2 XP syncs • 10 photocards
                        </div>
                    </div>
                    {error && (
                        <div className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-400/30 rounded-lg px-4 py-2">
                            {error}
                        </div>
                    )}
                </div>

                {/* Background 'BORARUSH' Text Overlay */}
                <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.03] select-none">
                    <span className="font-display text-[9rem] md:text-[11rem] font-bold text-white leading-none tracking-tighter">BORARUSH</span>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-[50px] pointer-events-none"></div>
                <div className="absolute bottom-10 left-10 w-40 h-40 bg-pink-500/20 rounded-full blur-[60px] pointer-events-none"></div>
            </div>

            {/* Game Modes & Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Solo Run */}
                <div className="bora-glass-panel p-6 rounded-2xl flex flex-col gap-4 group hover:border-bora-primary/50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-display text-lg font-bold text-white mb-2">Solo Run</h3>
                        <p className="text-sm text-gray-400">Race against yourself. Practice your trivia skills and speed to become the ultimate expert!</p>
                    </div>
                </div>

                {/* 1v1 Battle */}
                <div className="bora-glass-panel p-6 rounded-2xl flex flex-col gap-4 group hover:border-bora-primary/50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-display text-lg font-bold text-white mb-2">1v1 Battle</h3>
                        <p className="text-sm text-gray-400">Play with a friend on the same device! Take turns rolling and answering. Who is the bigger fan?</p>
                    </div>
                </div>

                {/* BTS Trivia System */}
                <div className="bora-glass-panel p-6 rounded-2xl flex flex-col gap-4 group hover:border-bora-primary/50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                        <Brain className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-display text-lg font-bold text-white mb-2">BTS Trivia</h3>
                        <p className="text-sm text-gray-400">Questions on Albums, Songs, Members, General history and Awards. 3 difficulty levels.</p>
                    </div>
                </div>
            </div>

            {/* Detailed Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Game Mechanics */}
                <div className="bora-glass-panel p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Star className="w-6 h-6 text-yellow-500" />
                        <h3 className="font-display text-xl font-bold text-white">Rule The Board</h3>
                    </div>

                    <ul className="space-y-3">
                        <li className="flex gap-3 text-sm text-gray-300">
                            <span className="text-green-400 font-bold shrink-0">🪜 Ladders:</span>
                            <span>Answer correctly to climb! Includes flavor text like "Grammy Nomination!".</span>
                        </li>
                        <li className="flex gap-3 text-sm text-gray-300">
                            <span className="text-red-400 font-bold shrink-0">🐍 Snakes:</span>
                            <span>Watch out! Wrong answers send you sliding down. "Album Leaked!" consequences.</span>
                        </li>
                        <li className="flex gap-3 text-sm text-gray-300">
                            <span className="text-blue-400 font-bold shrink-0">🎲 Dice:</span>
                            <span>Animated rolling with random 1-6 generation. Visual feedback during roll.</span>
                        </li>
                    </ul>
                </div>

                {/* Immersive Experience */}
                <div className="bora-glass-panel p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-6 h-6 text-cyan-500" />
                        <h3 className="font-display text-xl font-bold text-white">Fun & Fast</h3>
                    </div>
                    <ul className="space-y-3">
                        <li className="flex gap-3 text-sm text-gray-300">
                            <span className="text-purple-400 font-bold shrink-0">🎨 Visuals:</span>
                            <span>Beautiful purple space theme with cool star animations and effects!</span>
                        </li>
                        <li className="flex gap-3 text-sm text-gray-300">
                            <span className="text-pink-400 font-bold shrink-0">⏱️ Timer:</span>
                            <span>Think fast! You only have 10 seconds to answer or you might fall!</span>
                        </li>
                        <li className="flex gap-3 text-sm text-gray-300">
                            <span className="text-indigo-400 font-bold shrink-0">� For You:</span>
                            <span>Made specially for ARMY. Completely free and built with love!</span>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    )
}
