import Hero from '@/components/sections/Hero'
import TrendingSection from '@/components/trending/TrendingSection'
import ValueProps from '@/components/sections/ValueProps'
import Footer from '@/components/layout/Footer'
import FloatingConnect from '@/components/auth/FloatingConnect'
import StreamingCTA from '@/components/sections/StreamingCTA'
import Link from 'next/link'

export default async function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ARMYVERSE',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://armyverse.vercel.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://armyverse.vercel.app'}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
  // Fetch latest Kworb snapshot for homepage status card (no scraping here)
  let snap: any = null
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/spotify/kworb/latest`
    const res = await fetch(url || '/api/spotify/kworb/latest', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      snap = data?.snapshot || null
    }
  } catch {}

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a082a] via-[#2b1240] to-[#0b0310]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero Section */}
      <Hero />

      {/* Value Proposition / What We Do */}
      <section id="value" className="py-12 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <ValueProps />
        </div>
      </section>

      {/* Spotify Analytics (Kworb) quick status */}
      <section id="spotify-kworb" className="py-12 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-sm text-white/70">Spotify Analytics (Kworb)</div>
              <div className="text-base">
                {snap
                  ? (<span>Last update: {snap.dateKey} • Songs: {snap.songs?.length || 0} • Albums: {snap.albums?.length || 0}</span>)
                  : (<span>No data yet. Trigger the daily cron to populate.</span>)}
              </div>
            </div>
            <Link href="/spotify" className="underline font-semibold">Open Dashboard →</Link>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section id="trending" className="py-12 sm:py-16 px-4">
        <TrendingSection />
      </section>

      {/* CTA banner */}
      <div className="py-8 sm:py-10">
        <StreamingCTA />
      </div>

      <Footer />
      <FloatingConnect />
    </div>
  )
}