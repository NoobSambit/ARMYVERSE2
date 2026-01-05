'use client'

import React from 'react'

export default function ActivityChart() {
  const bars = [
    { value: '40M', height: '40%' },
    { value: '55M', height: '55%' },
    { value: '45M', height: '45%' },
    { value: '70M', height: '70%' },
    { value: '65M', height: '65%' },
    { value: '85M', height: '85%' },
    { value: '90M', height: '90%' },
    { value: 'Now', height: '75%', isActive: true },
  ]

  return (
    <div className="bg-[#2e2249] rounded-xl p-6 border border-white/5 flex flex-col h-full min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-white font-bold text-lg">Listening Activity</h3>
          <p className="text-[#a290cb] text-xs">Last 30 Days • Global Audience</p>
        </div>
        <select className="bg-[#151022] border-none text-xs text-white rounded-xl px-3 py-1.5 focus:ring-1 focus:ring-[#895af6] cursor-pointer outline-none">
          <option>Streams</option>
          <option>Listeners</option>
        </select>
      </div>
      
      {/* Chart */}
      <div className="flex-1 w-full flex items-end gap-2 sm:gap-4 px-2 relative">
        {/* Y-axis lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-[#a290cb]/30 z-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b border-white/5 w-full h-0" />
          ))}
        </div>

        {/* Bars */}
        {bars.map((bar, i) => (
          <div 
            key={i}
            className={`flex-1 rounded-t-sm transition-all relative group z-10 ${
              bar.isActive 
                ? 'bg-[#895af6] shadow-[0_0_15px_rgba(137,90,246,0.5)]' 
                : 'bg-[#895af6]/20 hover:bg-[#895af6]'
            }`}
            style={{ height: bar.height }}
          >
            <div className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded transition-opacity ${bar.isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {bar.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
