'use client'

export default function BentoStats() {
  return (
    <div className="bento-card col-span-1 md:col-span-3 lg:col-span-3 row-span-1 rounded-2xl p-4 md:p-6 grid grid-cols-2 gap-3 sm:gap-4 md:flex md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col">
        <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight font-display">9,000+</span>
        <span className="text-[10px] sm:text-xs md:text-sm text-gray-400 font-medium font-body">Gallery Photocards</span>
      </div>
      <div className="hidden md:block h-10 md:h-12 w-[1px] bg-white/10"></div>
      <div className="flex flex-col">
        <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight font-display">10</span>
        <span className="text-[10px] sm:text-xs md:text-sm text-gray-400 font-medium font-body">Questions per Quiz</span>
      </div>
      <div className="hidden md:block h-10 md:h-12 w-[1px] bg-white/10 mx-0 md:mx-4"></div>
      <div className="flex flex-col">
        <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight font-display">1</span>
        <span className="text-[10px] sm:text-xs md:text-sm text-gray-400 font-medium font-body">Random Drop Mode</span>
      </div>
      <div className="hidden md:block h-10 md:h-12 w-[1px] bg-white/10 mx-0 md:mx-4"></div>
      <div className="flex flex-col">
        <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight font-display">34</span>
        <span className="text-[10px] sm:text-xs md:text-sm text-gray-400 font-medium font-body">Quest Badges</span>
      </div>
    </div>
  )
}
