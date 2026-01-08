import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function AiPlaylistWidget() {
  return (
    <Link href="/ai-playlist" className="col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-4 sm:p-6 relative overflow-hidden flex items-center shadow-lg group cursor-pointer hover:scale-[1.02] transition-transform min-h-[160px] sm:min-h-[180px]">
      <div className="absolute right-[-20px] top-[-20px] w-32 h-32 sm:w-40 sm:h-40 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
      <div className="flex-1 pr-3 sm:pr-4 relative z-10">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded bg-white/20 text-[9px] sm:text-[10px] font-bold uppercase mb-1.5 sm:mb-2">New Beta</div>
        <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-1">AI Playlist Generator</h3>
        <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">Create the perfect mood mix based on your bias and vibe.</p>
        <span className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-white text-primary font-bold text-xs sm:text-sm hover:bg-gray-100 transition-colors shadow-md inline-block">
          Generate Now
        </span>
      </div>
      <div className="hidden sm:flex w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full items-center justify-center backdrop-blur-sm border border-white/20 shrink-0">
        <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
      </div>
    </Link>
  )
}