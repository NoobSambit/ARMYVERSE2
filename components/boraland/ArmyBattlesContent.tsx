import React from 'react'
import { Swords, Users, Trophy, Clock, Shield, Zap } from 'lucide-react'

export default function ArmyBattlesContent() {
  return (
    <section className="flex-grow flex flex-col gap-6 overflow-y-auto scrollbar-hide">
      {/* Hero Section */}
      <div className="relative w-full rounded-3xl overflow-hidden p-8 md:p-10 border border-white/10 bg-gradient-to-br from-[#0a1628] via-[#1e3a5f] to-[#0a1628] shadow-2xl">
        <div className="absolute top-4 left-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span> Live Battles
          </div>
        </div>

        <div className="flex flex-col items-start z-10 relative mt-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
            ARMYBATTLES
          </h1>
          <h2 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
            Real-Time Music Streaming Battles
          </h2>

          <p className="text-gray-300 max-w-2xl text-lg mb-8 leading-relaxed">
            Compete by listening to Spotify playlists. Track plays through Last.fm scrobbles and climb live leaderboards. Join solo or form teams to dominate the charts.
          </p>

          <div className="flex items-center gap-6 flex-wrap">
            <a
              href="https://armybattles.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Swords className="w-5 h-5" />
              Enter Battle Arena
            </a>
          </div>
        </div>

        {/* Background 'BATTLE' Text Overlay */}
        <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.03] select-none">
          <span className="font-display text-[12rem] font-bold text-white leading-none">BATTLE</span>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Real-time Leaderboards */}
        <div className="bora-glass-panel p-6 rounded-2xl flex flex-col gap-4 group hover:border-cyan-500/50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white mb-2">Real-time Leaderboards</h3>
            <p className="text-sm text-gray-400">Live updates every 2 minutes. Watch your rank change as you scrobble more tracks.</p>
          </div>
        </div>

        {/* Team Battles */}
        <div className="bora-glass-panel p-6 rounded-2xl flex flex-col gap-4 group hover:border-cyan-500/50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white mb-2">Team Battles</h3>
            <p className="text-sm text-gray-400">Create teams with invite codes or compete solo. Aggregate scores and dominate together.</p>
          </div>
        </div>

        {/* Battle Lifecycle */}
        <div className="bora-glass-panel p-6 rounded-2xl flex flex-col gap-4 group hover:border-cyan-500/50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white mb-2">Timed Battles</h3>
            <p className="text-sm text-gray-400">Custom time windows with automatic transitions. Results freeze when battles end.</p>
          </div>
        </div>

        {/* Cheat Detection */}
        <div className="bora-glass-panel p-6 rounded-2xl flex flex-col gap-4 group hover:border-cyan-500/50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white mb-2">Anti-Cheat System</h3>
            <p className="text-sm text-gray-400">Automatic detection flags suspicious activity. Fair play guaranteed.</p>
          </div>
        </div>

        {/* Host Controls */}
        <div className="bora-glass-panel p-6 rounded-2xl flex flex-col gap-4 group hover:border-cyan-500/50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white mb-2">Host Controls</h3>
            <p className="text-sm text-gray-400">Kick participants, extend battles, or end early. Full battle management power.</p>
          </div>
        </div>

        {/* Last.fm Integration */}
        <div className="bora-glass-panel p-6 rounded-2xl flex flex-col gap-4 group hover:border-cyan-500/50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white mb-2">Last.fm Scrobbles</h3>
            <p className="text-sm text-gray-400">Automatic scrobble tracking with normalized track matching against playlists.</p>
          </div>
        </div>
      </div>


      {/* Battle Modes */}
      <div className="bora-glass-panel p-8 rounded-2xl">
        <h3 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Swords className="w-6 h-6 text-cyan-400" />
          Battle Modes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-2xl">person</span>
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Solo Battle</h4>
              <p className="text-sm text-gray-400">Compete individually. Your scrobbles, your glory.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Team Battle</h4>
              <p className="text-sm text-gray-400">Form teams, share invite codes, dominate together.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
