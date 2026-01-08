import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative w-full rounded-3xl overflow-hidden glass-panel min-h-[400px] md:min-h-[450px] flex flex-col items-center justify-center text-center p-6 sm:p-8 lg:p-16 border border-glass-border shadow-2xl">
      {/* Hero Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-[-1] opacity-40 mix-blend-screen transition-transform duration-[20s] hover:scale-105"
        style={{ backgroundImage: "url('https://res.cloudinary.com/dacgtjw7w/image/upload/v1767807579/armyverse_banner_gerjw4.png')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent z-[-1]"></div>
      
      <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-6 animate-pulse-slow">
        <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-primary animate-pulse"></span> Live Dashboard
      </span>
      
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter mb-3 sm:mb-4 leading-tight">
        <span className="text-white drop-shadow-lg">ARMY</span><span className="gradient-text-primary text-glow">VERSE</span>
      </h1>
      
      <p className="text-white/70 text-sm sm:text-base md:text-lg lg:text-xl font-medium max-w-2xl mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0">
        Where Streaming Meets Passion. Your central command for charts, games, and the global purple ocean.
      </p>
      
      <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 sm:gap-4 justify-center w-full px-4 sm:px-0">
        <Link href="/create-playlist" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 rounded-full bg-primary hover:bg-primary-dark text-white text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(144,84,248,0.4)]">
          <span className="material-symbols-outlined text-xl">play_circle</span>
          <span>Start Streaming</span>
        </Link>
        <Link href="/boraland" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm sm:text-base font-bold flex items-center justify-center gap-2 backdrop-blur-md transition-all hover:border-primary/50">
          <span className="material-symbols-outlined text-xl">rocket_launch</span>
          <span>Join Boraland</span>
        </Link>
      </div>

      {/* Platform Badges */}
      <div className="mt-8 sm:mt-10 md:mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500 text-xs sm:text-sm">
        <span className="flex items-center gap-1.5 sm:gap-2 font-semibold whitespace-nowrap"><span className="material-symbols-outlined text-base sm:text-lg">graphic_eq</span> <span className="hidden xs:inline">Spotify</span></span>
        <span className="h-1 w-1 rounded-full bg-white/20 hidden xs:block"></span>
        <span className="flex items-center gap-1.5 sm:gap-2 font-semibold whitespace-nowrap"><span className="material-symbols-outlined text-base sm:text-lg">smart_display</span> <span className="hidden xs:inline">YouTube</span></span>
        <span className="h-1 w-1 rounded-full bg-white/20 hidden xs:block"></span>
        <span className="flex items-center gap-1.5 sm:gap-2 font-semibold whitespace-nowrap"><span className="material-symbols-outlined text-base sm:text-lg">bar_chart</span> <span className="hidden xs:inline">Last.fm</span></span>
        <span className="h-1 w-1 rounded-full bg-white/20 hidden xs:block"></span>
        <span className="flex items-center gap-1.5 sm:gap-2 font-semibold whitespace-nowrap"><span className="material-symbols-outlined text-base sm:text-lg">psychology</span> <span className="hidden xs:inline">AI</span></span>
      </div>
    </section>
  )
}