export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background-dark text-white font-display overflow-x-hidden selection:bg-primary selection:text-white">
      <style>{`
        body > div.sticky,
        body > footer {
          display: none !important;
        }
      `}</style>
      <div className="fixed inset-0 z-0 bg-aurora pointer-events-none opacity-40"></div>
      <div className="fixed inset-0 z-0 bg-noise pointer-events-none opacity-50 mix-blend-overlay"></div>
      <div className="fixed top-[-20%] left-[20%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-primary rounded-full blur-[150px] opacity-20 z-0 pointer-events-none"></div>

      <main className="relative z-10 w-full max-w-3xl px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.25em] text-white/70">
          Launching Soon
        </div>
        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
          Nice try, bozo 🤡
        </h1>
        <p className="mt-4 text-base sm:text-lg text-white/70">
          ARMYVERSE is loading the stage. Check back in a few days.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 text-xs sm:text-sm text-white/60">
          <span className="rounded-full border border-white/10 px-3 py-1">Goofball emoji = active</span>
          <span className="rounded-full border border-white/10 px-3 py-1">Sneak peek: denied</span>
        </div>
      </main>
    </div>
  )
}
