import Link from 'next/link'
import { Link as LinkIcon, BarChart2 } from 'lucide-react'

export default function StatsPreview() {
  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-1 glass-panel rounded-2xl p-4 sm:p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group min-h-[160px]">
      <div className="absolute top-0 right-0 p-2 sm:p-3 opacity-20 group-hover:opacity-40 transition-opacity">
        <BarChart2 className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
      </div>
      <div className="relative z-10">
        <h4 className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2">Your Listening DNA</h4>
        <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 px-2">Connect Last.fm to visualize your streaming impact.</p>
        <Link href="/stats" className="w-full py-2 px-4 rounded-xl bg-[#b90000] hover:bg-[#d60000] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors">
          <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Connect Last.fm</span>
        </Link>
      </div>
    </div>
  )
}