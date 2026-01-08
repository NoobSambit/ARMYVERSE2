import { Globe } from 'lucide-react'
import Link from 'next/link'

type BlogPost = {
  _id: string
  title: string
  coverImage?: string
  mood?: string
  createdAt: string
  tags?: string[]
}

export default async function CommunityWidget() {
  let recentPosts: BlogPost[] = []

  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/blogs?limit=2&sortBy=newest&compact=true`
    const res = await fetch(url, { cache: 'no-store' })

    if (res.ok) {
      const data = await res.json()
      if (data.blogs && data.blogs.length > 0) {
        recentPosts = data.blogs
      }
    }
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const posted = new Date(date)
    const diffMs = now.getTime() - posted.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case 'hype': return 'text-yellow-400'
      case 'chill': return 'text-blue-400'
      case 'sad': return 'text-purple-400'
      case 'romantic': return 'text-pink-400'
      default: return 'text-primary'
    }
  }

  const getMoodLabel = (post: BlogPost) => {
    if (post.tags && post.tags.includes('analysis')) return 'Analysis'
    if (post.tags && post.tags.includes('guide')) return 'Guide'
    if (post.tags && post.tags.includes('news')) return 'News'
    return post.mood ? post.mood.charAt(0).toUpperCase() + post.mood.slice(1) : 'Post'
  }

  return (
    <div className="col-span-1 md:col-span-3 lg:col-span-4 grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
      <div className="lg:col-span-2 glass-panel rounded-2xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Recent From Blog</h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <Link key={post._id} href={`/blogs/${post._id}`} className="flex gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-xl hover:bg-secondary/40 transition-colors cursor-pointer group">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-700 bg-cover shrink-0"
                  style={{
                    backgroundImage: post.coverImage
                      ? `url('${post.coverImage}')`
                      : "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB2jiH20zV2_3KKI35iM2sa_6NDqt7uCI1HfEq8EzDDtAwXU7QnOBQ1fWdyHhjz_IO8z2vMfBxr0pRnNn7TDmwgxpwO7NvZT_qdB2PCx-piOF90K-zCETJI7DLCHx2altiA5zmAbsmd0vWGmFZsDSp4k-nZxaD28-NqJlCK0ne122CXzSGZ1mvEtUqGDO-TgOJ6CfWgSVelWNLw2fYthbLKBB_PN6MZpCgTt-ECMRN2lhxfMR8ybFhyQ_TzgHyUgim40OLfnVM1tlI')"
                  }}
                ></div>
                <div className="flex-1 min-w-0">
                  <span className={`text-[10px] sm:text-xs ${getMoodColor(post.mood)} font-bold`}>{getMoodLabel(post)}</span>
                  <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-2">{post.title}</h4>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">{getTimeAgo(post.createdAt)}</p>
                </div>
              </Link>
            ))
          ) : (
            <>
              <div className="flex gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-secondary/40 transition-colors cursor-pointer group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-700 bg-cover shrink-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB2jiH20zV2_3KKI35iM2sa_6NDqt7uCI1HfEq8EzDDtAwXU7QnOBQ1fWdyHhjz_IO8z2vMfBxr0pRnNn7TDmwgxpwO7NvZT_qdB2PCx-piOF90K-zCETJI7DLCHx2altiA5zmAbsmd0vWGmFZsDSp4k-nZxaD28-NqJlCK0ne122CXzSGZ1mvEtUqGDO-TgOJ6CfWgSVelWNLw2fYthbLKBB_PN6MZpCgTt-ECMRN2lhxfMR8ybFhyQ_TzgHyUgim40OLfnVM1tlI')" }}></div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] sm:text-xs text-primary font-bold">Analysis</span>
                  <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-2">Decoding the metaphors in Rainy Days</h4>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-secondary/40 transition-colors cursor-pointer group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-700 bg-cover shrink-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC3LZg78z45WkVI26i-GOHAagWKnRyu98-0Y0hkgfxVD8NIBZT9JLBrFSYj1nqyJp5AS3PFboY0bN2mRbaSIIvIQEPjUsLRhH-VZ90uv75UUUHbsPdtKsnAtAjLMoc-kVm15SiJ0LQEL72VOiqdzNo4XmJXDYty4owd0m6kyp5Kt7BlzARxGaBMTt3Z-wVc19IjqzPo8vR71MGoU5srlf4LaeMZypQz7c1WH0kVSvFFsemh2YhmgNPaoptM_bj79WWF84AlqZ9JBmg')" }}></div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] sm:text-xs text-green-400 font-bold">Guide</span>
                  <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-2">How to stream effectively on Stationhead</h4>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">1 day ago</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="glass-panel rounded-2xl p-4 sm:p-6 relative overflow-hidden min-h-[200px]">
        <div className="absolute inset-0 bg-[url('https://placeholder.pics/svg/300/302249/FFFFFF')] bg-cover opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <h3 className="text-base sm:text-lg font-bold text-white mb-2">Community Pulse</h3>
          <div className="flex items-center gap-3 sm:gap-4 my-3 sm:my-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center animate-pulse shrink-0">
              <Globe className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white">8,402</p>
              <p className="text-[10px] sm:text-xs text-gray-400">ARMYs online now</p>
            </div>
          </div>
          <div className="text-[10px] sm:text-xs text-gray-400 space-y-1">
            <div className="flex justify-between"><span>Seoul</span> <span className="text-primary font-bold">1.2k</span></div>
            <div className="flex justify-between"><span>New York</span> <span className="text-primary font-bold">890</span></div>
            <div className="flex justify-between"><span>Jakarta</span> <span className="text-primary font-bold">750</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}