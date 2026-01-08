export default async function Ticker() {
  let items = [
    'New &quot;Golden&quot; album metrics added',
    'Boraland Quest Season 4 is LIVE',
    'Server maintenance scheduled for Sunday 2AM KST',
    'Community Goal: 1B streams for &quot;Seven&quot; reached!'
  ]

  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/blogs?limit=5&tags=announcement&sortBy=newest&compact=true`
    const res = await fetch(url, { cache: 'no-store' })

    if (res.ok) {
      const data = await res.json()
      if (data.blogs && data.blogs.length > 0) {
        const announcements = data.blogs.map((post: any) => post.title)
        items = [...announcements, ...items].slice(0, 6)
      }
    }
  } catch (error) {
    console.error('Failed to fetch announcements:', error)
  }

  const displayItems = [...items, ...items]

  return (
    <div className="col-span-1 md:col-span-3 lg:col-span-4 rounded-xl overflow-hidden bg-gradient-to-r from-primary/20 via-secondary to-primary/20 border border-primary/20 h-9 sm:h-10 flex items-center relative">
      <div className="flex items-center px-2.5 sm:px-4 bg-primary text-[10px] sm:text-xs font-bold uppercase tracking-wider h-full shrink-0 z-10 shadow-lg text-white whitespace-nowrap">
        What&apos;s New
      </div>
      <div className="marquee-container w-full overflow-hidden whitespace-nowrap">
        <div className="marquee-content inline-block animate-marquee">
          {displayItems.map((item, idx) => (
            <span key={idx} className="mx-4 sm:mx-8 text-xs sm:text-sm font-medium text-white/90">• {item}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
