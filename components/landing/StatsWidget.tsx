import { Monitor, TrendingUp } from 'lucide-react'

export default async function StatsWidget() {
  let stats = {
    totalTracks: 0,
    totalUsers: 0,
    boralandPlayers: 0
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stats/landing`
    const res = await fetch(url, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (data.ok) {
        stats = {
          totalTracks: data.totalTracks || stats.totalTracks,
          totalUsers: data.totalUsers || stats.totalUsers,
          boralandPlayers: data.boralandPlayers || stats.boralandPlayers
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  return (
    <div className="md:col-span-1 md:row-span-2 glass-panel rounded-2xl p-4 sm:p-6 flex flex-col justify-between gap-4 sm:gap-6 hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-white">Quick Stats</h3>
        <div className="size-7 sm:size-8 rounded-xl bg-secondary flex items-center justify-center shrink-0">
          <Monitor className="text-primary w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>
      <div className="space-y-3 sm:space-y-4">
        <div className="p-3 sm:p-4 rounded-xl bg-secondary/50 border border-glass-border">
          <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total Tracks</p>
          <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalTracks.toLocaleString()}</p>
          <div className="w-full bg-gray-700 h-1 mt-1.5 sm:mt-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[85%]"></div>
          </div>
        </div>
        <div className="p-3 sm:p-4 rounded-xl bg-secondary/50 border border-glass-border">
          <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Active Users</p>
          <p className="text-xl sm:text-2xl font-bold text-white">{formatNumber(stats.totalUsers)}</p>
          <p className="text-[10px] sm:text-xs text-green-400 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +12% this week
          </p>
        </div>
        <div className="p-3 sm:p-4 rounded-xl bg-secondary/50 border border-glass-border">
          <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Boraland Players</p>
          <p className="text-xl sm:text-2xl font-bold text-white">{formatNumber(stats.boralandPlayers)}</p>
          <div className="flex -space-x-1.5 sm:-space-x-2 mt-2">
            {[1, 2, 3].map((i) => (
                <div key={i} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-secondary bg-gray-500 bg-cover" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${i}')` }}></div>
            ))}
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-secondary bg-gray-800 text-[9px] sm:text-[10px] flex items-center justify-center text-white">+1k</div>
          </div>
        </div>
      </div>
    </div>
  )
}
