import Link from 'next/link'
import { LogIn, Sparkles } from 'lucide-react'

export default async function BoralandTeaser() {
  let topPlayer = '@Chimmy95'

  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/game/leaderboard?limit=1`
    const res = await fetch(url, { cache: 'no-store' })

    if (res.ok) {
      const data = await res.json()
      if (data.entries && data.entries.length > 0) {
        const top = data.entries[0]
        topPlayer = top.displayName ? `@${top.displayName}` : 'Anonymous'
      }
    }
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
  }

  return (
    <div className="col-span-1 md:col-span-2 md:row-span-2 glass-panel rounded-2xl p-0 overflow-hidden relative group min-h-[280px] sm:min-h-[320px] md:min-h-[380px]">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: "url('https://res.cloudinary.com/dacgtjw7w/image/upload/v1767804617/boraland_poster_gyhq1q.png'), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCQ7kAwnBQ9HXqT0Bd6gqq8apjmhRHVQ_Xa11r06Z9-414gYMLYCX3yESU9F2BuEzs7STMvigLWy6FIv-dilcROVIPhSHVBZhT9O25rF8rZMzB6uKO1Hr6cANQUIKMzMSzMiuseuaYDYTekLljvr7YogYV4CJi2Obp8ws9W0fI4TemwpbvH_wM3LHKGx0RE33nAt1elCOAXx92em9rjDWGAZ2iHDcjtyri9jFh6Dcq_kibMl4qkucgDrI-XnQaM44hxAZ9qM1uPRWU')" }}
      ></div>
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background-dark/60 via-background-dark/30 to-transparent"></div>

      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/40 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1 rounded-full border border-white/10 text-[10px] sm:text-xs font-bold text-yellow-400 flex items-center gap-1">
        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" /> Season 4
      </div>

      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 md:p-8">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1.5 sm:mb-2 drop-shadow-lg">Boraland</h3>
        <p className="text-white/90 mb-4 sm:mb-5 md:mb-6 text-xs sm:text-sm max-w-sm drop-shadow-md line-clamp-2">Complete daily quests, collect rare photocards, and climb the leaderboard.</p>

        <div className="mb-4 sm:mb-5 md:mb-6 w-fit">
          <div className="bg-black/50 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-white/10">
            <p className="text-[9px] sm:text-[10px] text-white/60 uppercase">Weekly Top</p>
            <p className="text-sm sm:text-base font-bold text-white truncate max-w-[160px] sm:max-w-none">{topPlayer}</p>
          </div>
        </div>

        <Link href="/boraland" className="block w-full h-10 sm:h-11 md:h-12 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm sm:text-base font-bold transition-colors flex items-center justify-center gap-2">
          <span>Enter World</span>
          <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Link>
      </div>
    </div>
  )
}
