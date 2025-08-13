import Hero from '@/components/sections/Hero'
import TrendingSection from '@/components/trending/TrendingSection'
import ValueProps from '@/components/sections/ValueProps'
import Footer from '@/components/layout/Footer'
import FloatingConnect from '@/components/auth/FloatingConnect'
import type { Metadata } from 'next'
import StreamingCTA from '@/components/sections/StreamingCTA'

export default function Home() {
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