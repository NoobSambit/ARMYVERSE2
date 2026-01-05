import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function AiPlaylistWidget() {
  return (
    <Link href="/ai-playlist" className="col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-6 relative overflow-hidden flex items-center shadow-lg group cursor-pointer hover:scale-[1.02] transition-transform">
      <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
      <div className="flex-1 pr-4 relative z-10">
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/20 text-[10px] font-bold uppercase mb-2">New Beta</div>
        <h3 className="text-2xl font-black text-white mb-1">AI Playlist Generator</h3>
        <p className="text-white/80 text-sm mb-4">Create the perfect mood mix based on your bias and vibe.</p>
        <span className="px-5 py-2 rounded-xl bg-white text-primary font-bold text-sm hover:bg-gray-100 transition-colors shadow-md inline-block">
          Generate Now
        </span>
      </div>
      <div className="hidden sm:block w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
    </Link>
  )
}