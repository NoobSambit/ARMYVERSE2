import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative w-full rounded-3xl overflow-hidden glass-panel min-h-[400px] flex flex-col items-center justify-center text-center p-8 lg:p-16 border border-glass-border shadow-2xl">
      {/* Hero Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-[-1] opacity-40 mix-blend-screen transition-transform duration-[20s] hover:scale-105" 
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAGSCdGA9EUlpaH0_cQTbyv25x-XEuE6KpC0lcwrzBdHJFd6i3ObmdXzW4RwVxDSH0pQLrNdv_Rplt7swDzYCzf81-IpVjFf6QWvhd6sFocYKBMbtfkx3SG42vMOilKAqk-kCQyp_4jH89uvAybCtSgVR9IHIFl5Wb_6CIAX4hV_SvfitmoChlaeeKY_eEVOfmldZoU48iy50z2iB5TKvqNA5Dukx9nBwIYYvtp2tDi9zp5ClbGXKwmzYR3tGVnKqMd_9yw-cEg74s')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent z-[-1]"></div>
      
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary-300 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse-slow">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Live Dashboard
      </span>
      
      <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
        <span className="text-white drop-shadow-lg">ARMY</span><span className="gradient-text-primary text-glow">VERSE</span>
      </h1>
      
      <p className="text-white/70 text-lg md:text-xl font-medium max-w-2xl mb-8 leading-relaxed">
        Where Streaming Meets Passion. Your central command for charts, games, and the global purple ocean.
      </p>
      
      <div className="flex flex-wrap items-center gap-4 justify-center w-full">
        <Link href="/create-playlist" className="h-12 px-8 rounded-full bg-primary hover:bg-primary-dark text-white font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(144,84,248,0.4)]">
          <span className="material-symbols-outlined">play_circle</span>
          Start Streaming
        </Link>
        <Link href="/boraland" className="h-12 px-8 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold flex items-center gap-2 backdrop-blur-md transition-all hover:border-primary/50">
          <span className="material-symbols-outlined">rocket_launch</span>
          Join Boraland
        </Link>
      </div>

      {/* Platform Badges */}
      <div className="mt-12 flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
        <span className="flex items-center gap-2 text-sm font-semibold"><span className="material-symbols-outlined">graphic_eq</span> Spotify</span>
        <span className="h-1 w-1 rounded-full bg-white/20"></span>
        <span className="flex items-center gap-2 text-sm font-semibold"><span className="material-symbols-outlined">smart_display</span> YouTube</span>
        <span className="h-1 w-1 rounded-full bg-white/20"></span>
        <span className="flex items-center gap-2 text-sm font-semibold"><span className="material-symbols-outlined">bar_chart</span> Last.fm</span>
        <span className="h-1 w-1 rounded-full bg-white/20"></span>
        <span className="flex items-center gap-2 text-sm font-semibold"><span className="material-symbols-outlined">psychology</span> Google AI</span>
      </div>
    </section>
  )
}