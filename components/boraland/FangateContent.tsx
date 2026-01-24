import React from 'react'
import { Radio, GraduationCap, Swords, Download, Lock } from 'lucide-react'

export default function FangateContent() {
  return (
    <section className="flex-grow flex flex-col gap-6 overflow-y-auto scrollbar-hide">
      {/* Hero Section */}
      <div className="relative w-full rounded-3xl overflow-hidden p-8 md:p-10 border border-white/10 bg-gradient-to-br from-[#1a082a] via-[#2d1b4e] to-[#1a082a] shadow-2xl">
        <div className="absolute top-4 left-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span> Live Access
          </div>
        </div>
        
        <div className="flex flex-col items-start z-10 relative mt-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
            FANGATE
          </h1>
          <h2 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent mb-6">
            Verify Your BTS Fandom
          </h2>
          
          <p className="text-gray-300 max-w-2xl text-lg mb-8 leading-relaxed">
            Verify yourself as ARMY to get access to BTS concert ticketing pages. Complete challenges, prove your knowledge, and boost your Fan Score.
          </p>
          
          <div className="flex items-center gap-6 flex-wrap">
            <a
              href="https://fangate.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined">rocket_launch</span>
              Launch Fangate
            </a>
            <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
              <span className="material-symbols-outlined text-lg">verified_user</span>
              Fan Score verification unlocks access
            </div>
          </div>
        </div>
        
        {/* Background 'FANGATE' Text Overlay */}
        <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.03] select-none">
          <span className="font-display text-[12rem] font-bold text-white leading-none">FANGATE</span>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Last.fm Integration */}
        <div className="bora-glass-panel p-6 rounded-2xl flex flex-col gap-4 group hover:border-bora-primary/50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white mb-2">Last.fm Integration</h3>
            <p className="text-sm text-gray-400">Sync your streaming history to prove your dedication and top listener status.</p>
          </div>
        </div>

        {/* Fan Score Calc */}
        <div className="bora-glass-panel p-6 rounded-2xl flex flex-col gap-4 group hover:border-bora-primary/50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
            <span className="material-symbols-outlined text-2xl">calculate</span>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white mb-2">Fan Score Calc</h3>
            <p className="text-sm text-gray-400">Real-time calculation based on quiz performance, streaming, and community activity.</p>
          </div>
        </div>

        {/* Single-Player Quiz */}
        <div className="bora-glass-panel p-6 rounded-2xl flex flex-col gap-4 group hover:border-bora-primary/50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white mb-2">Single-Player Quiz</h3>
            <p className="text-sm text-gray-400">Test your knowledge on specific eras like &quot;BE&quot; or &quot;Map of the Soul&quot;.</p>
          </div>
        </div>

        {/* Multiplayer Battle */}
        <div className="bora-glass-panel p-6 rounded-2xl flex flex-col gap-4 group hover:border-bora-primary/50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white mb-2">Multiplayer Battle</h3>
            <p className="text-sm text-gray-400">Challenge friends or random opponents to timed trivia battles.</p>
          </div>
        </div>

        {/* Downloadable Score Cards */}
        <div className="bora-glass-panel p-6 rounded-2xl flex flex-col gap-4 group hover:border-bora-primary/50 transition-colors md:col-span-2">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex-shrink-0 flex items-center justify-center text-green-400">
              <Download className="w-6 h-6" />
            </div>
            <div className="flex-grow">
              <h3 className="font-display text-lg font-bold text-white mb-2">Downloadable Score Cards</h3>
              <p className="text-sm text-gray-400 mb-4">Get a beautifully generated image of your stats to share on social media.</p>
              <button className="px-4 py-1.5 rounded-full border border-bora-primary/50 text-bora-primary text-sm font-medium hover:bg-bora-primary/10 transition-colors">
                Preview Card
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scoring Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Combined Scoring */}
        <div className="bora-glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400">pie_chart</span>
              <h3 className="font-display text-lg font-bold text-white">Combined Scoring</h3>
            </div>
            <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded">Weightage</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Quiz Accuracy</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[40%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Streaming Data</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500 w-[30%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Community Activity</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[20%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Pass Requirement */}
        <div className="bora-glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          <Lock className="absolute top-4 right-4 text-white/5 w-16 h-16" />
          
          <div className="relative z-10">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">PASS REQUIREMENT</div>
            <div className="font-display text-6xl font-bold text-white mb-2">80%</div>
            <p className="text-sm text-gray-400 mb-6 max-w-[200px] mx-auto">Minimum Fan Score required to unlock ticketing access code.</p>
            
          </div>
        </div>
      </div>
    </section>
  )
}
