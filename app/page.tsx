import Hero from '@/components/landing/Hero'
import StatsWidget from '@/components/landing/StatsWidget'
import FeatureGrid from '@/components/landing/FeatureGrid'
import Ticker from '@/components/landing/Ticker'
import BoralandTeaser from '@/components/landing/BoralandTeaser'
import TrendingWidget from '@/components/landing/TrendingWidget'
import StatsPreview from '@/components/landing/StatsPreview'
import AiPlaylistWidget from '@/components/landing/AiPlaylistWidget'
import KworbWidget from '@/components/landing/KworbWidget'
import MemberSpotlight from '@/components/landing/MemberSpotlight'
import CommunityWidget from '@/components/landing/CommunityWidget'
import Footer from '@/components/layout/Footer'

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

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark text-white font-display overflow-x-hidden selection:bg-primary selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 bg-aurora pointer-events-none opacity-40"></div>
      <div className="fixed inset-0 z-0 bg-noise pointer-events-none opacity-50 mix-blend-overlay"></div>
      {/* Top Sphere Glow */}
      <div className="fixed top-[-20%] left-[20%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-primary rounded-full blur-[150px] opacity-20 z-0 pointer-events-none"></div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-3 sm:px-4 py-6 sm:py-8 lg:px-10 max-w-[1400px] mx-auto w-full flex flex-col gap-6 sm:gap-8">
        <Hero />

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-[minmax(160px,auto)] sm:auto-rows-[minmax(180px,auto)]">
          <StatsWidget />
          <FeatureGrid />
          <Ticker />
          <BoralandTeaser />
          <TrendingWidget />
          <StatsPreview />
          <AiPlaylistWidget />
          <KworbWidget />
          <MemberSpotlight />
          <CommunityWidget />
        </div>
      </main>
    </div>
  )
}
