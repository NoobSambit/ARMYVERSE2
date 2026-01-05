import Link from 'next/link'
import { LogIn, Sparkles } from 'lucide-react'

export default async function BoralandTeaser() {
  let topPlayer = '@Chimmy95'
  let poolAmount = '15k Boras'

  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/game/leaderboard?limit=1`
    const res = await fetch(url, { cache: 'no-store' })

    if (res.ok) {
      const data = await res.json()
      if (data.entries && data.entries.length > 0) {
        const top = data.entries[0]
        topPlayer = top.displayName ? `@${top.displayName}` : 'Anonymous'

        const score = top.score || 0
        if (score >= 1000) {
          poolAmount = `${(score / 1000).toFixed(1)}k Boras`
        } else {
          poolAmount = `${score} Boras`
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
  }

  return (
    <div className="col-span-1 md:col-span-2 md:row-span-2 glass-panel rounded-2xl p-0 overflow-hidden relative group min-h-[300px]">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCQ7kAwnBQ9HXqT0Bd6gqq8apjmhRHVQ_Xa11r06Z9-414gYMLYCX3yESU9F2BuEzs7STMvigLWy6FIv-dilcROVIPhSHVBZhT9O25rF8rZMzB6uKO1Hr6cANQUIKMzMSzMiuseuaYDYTekLljvr7YogYV4CJi2Obp8ws9W0fI4TemwpbvH_wM3LHKGx0RE33nAt1elCOAXx92em9rjDWGAZ2iHDcjtyri9jFh6Dcq_kibMl4qkucgDrI-XnQaM44hxAZ9qM1uPRWU')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent"></div>

      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-yellow-400 flex items-center gap-1">
        <Sparkles className="w-4 h-4" /> Season 4
      </div>

      <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
        <h3 className="text-2xl md:text-3xl font-black text-white mb-2">Boraland</h3>
        <p className="text-gray-300 mb-6 text-sm max-w-sm">Complete daily quests, collect rare photocards, and climb the leaderboard.</p>

        <div className="flex gap-3 mb-6">
          <div className="bg-secondary/60 backdrop-blur-sm rounded-xl p-3 border border-white/5 flex-1">
            <p className="text-[10px] text-gray-400 uppercase">Weekly Top</p>
            <p className="font-bold text-white truncate">{topPlayer}</p>
          </div>
          <div className="bg-secondary/60 backdrop-blur-sm rounded-xl p-3 border border-white/5 flex-1">
            <p className="text-[10px] text-gray-400 uppercase">Pool</p>
            <p className="font-bold text-white truncate">{poolAmount}</p>
          </div>
        </div>

        <Link href="/boraland" className="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-colors flex items-center justify-center gap-2">
          Enter World
          <LogIn className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}