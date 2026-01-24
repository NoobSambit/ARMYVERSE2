export default function Ticker() {
  const items = [
    "Site is developed by an inexperienced developer; apologies in advance for any bugs or inconvenience.",
    "If the site is slow, it's because of heavy traffic—site runs on free hosting services. Donate to help us improve!",
    "Site can have bugs—report any issues to Twitter user @BoyWithLuvBytes (creator)."
  ]

  const displayItems = [...items, ...items, ...items, ...items]

  return (
    <div className="col-span-1 md:col-span-3 lg:col-span-4 rounded-xl overflow-hidden bg-gradient-to-r from-primary/20 via-secondary to-primary/20 border border-primary/20 h-9 sm:h-10 flex items-center relative">
      <div className="flex items-center px-2.5 sm:px-4 bg-primary text-[10px] sm:text-xs font-bold uppercase tracking-wider h-full shrink-0 z-20 shadow-lg text-white whitespace-nowrap">
        NOTICE
      </div>
      <div className="marquee-container w-full overflow-hidden whitespace-nowrap">
        <div className="marquee-content inline-flex animate-marquee-slow">
          {displayItems.map((item, idx) => (
            <span key={idx} className="mx-4 sm:mx-8 text-xs sm:text-sm font-medium text-white/90 whitespace-nowrap flex items-center justify-center shrink-0">• {item}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

