'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function StreamingCTA() {
  return (
    <section aria-labelledby="streaming-cta" className="px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mx-auto rounded-3xl bg-black/30 backdrop-blur-md border border-white/10 shadow-xl p-6 sm:p-8 text-center">
          <h2 id="streaming-cta" className="text-2xl sm:text-3xl font-semibold text-white">Create Streaming Playlist</h2>
          <p className="mt-2 text-white/80 max-w-2xl mx-auto">
            Build playlists optimized for streaming goals (duration, skips, gaps). Export to Spotify in one click.
          </p>
          <div className="mt-6">
            <Link
              href="/create-playlist"
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#FF9AD5] to-[#A274FF] text-white shadow-lg hover:scale-105 transition-transform"
              aria-label="Create streaming playlist"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create streaming playlist
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}


