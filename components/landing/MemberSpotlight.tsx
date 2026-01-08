import { Stars } from 'lucide-react'

export default function MemberSpotlight() {
  return (
    <div className="col-span-1 md:col-span-3 lg:col-span-4 mt-6 sm:mt-8">
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 px-2 flex items-center gap-2">
        <Stars className="text-primary w-5 h-5 sm:w-6 sm:h-6" /> Member Spotlight
      </h3>
      <div className="glass-panel rounded-2xl p-6 sm:p-8 md:p-12 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent-pink/10"></div>
        <div className="absolute top-4 right-4 w-24 h-24 sm:w-32 sm:h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 sm:w-32 sm:h-32 bg-accent-pink/10 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Placeholder Icons */}
          <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
              >
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/20"></div>
              </div>
            ))}
          </div>

          <h4 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3">Coming Soon</h4>
          <p className="text-white/60 text-xs sm:text-sm max-w-md mx-auto px-4">
            Individual member playlists, solo discographies, and spotlight features are on the way. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  )
}