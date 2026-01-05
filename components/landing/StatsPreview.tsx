import { Link as LinkIcon, BarChart2 } from 'lucide-react'

export default function StatsPreview() {
  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-1 glass-panel rounded-2xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
        <BarChart2 className="w-16 h-16 text-white" />
      </div>
      <div className="relative z-10">
        <h4 className="text-lg font-bold text-white mb-2">Your Listening DNA</h4>
        <p className="text-sm text-gray-400 mb-6">Connect Last.fm to visualize your streaming impact.</p>
        <button className="w-full py-2 px-4 rounded-xl bg-[#b90000] hover:bg-[#d60000] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors">
          <LinkIcon className="w-4 h-4" />
          Connect Last.fm
        </button>
      </div>
    </div>
  )
}