import Hero from '@/components/sections/Hero'
import TrendingSection from '@/components/trending/TrendingSection'
import ValueProps from '@/components/sections/ValueProps'

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
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
    </div>
  )
}