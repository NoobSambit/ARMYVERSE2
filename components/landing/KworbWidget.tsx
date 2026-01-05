import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export default async function KworbWidget() {
  // Fetch latest Kworb snapshot
  let snap: any = null
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/spotify/kworb/latest`
    const res = await fetch(url, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      snap = data?.snapshot || null
    }
  } catch {}

  return (
    <div className="col-span-1 glass-panel rounded-2xl p-5 flex flex-col justify-between hover:border-green-500/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-white">Spotify Global Daily</h4>
        <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-end border-b border-white/5 pb-2">
          <span className="text-xs text-gray-400">Total Streams</span>
          <span className="text-sm font-mono font-bold text-white">{snap?.totalStreams ? snap.totalStreams.toLocaleString() : 'Loading...'}</span>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-xs text-gray-400">Top Artist Rank</span>
          <span className="text-sm font-mono font-bold text-accent-green">#{snap?.artistRank || '-'}</span>
        </div>
      </div>
      <Link href="/spotify" className="text-xs text-primary hover:text-white mt-3 flex items-center gap-1 transition-colors">
        View Full Chart <ExternalLink className="w-3 h-3" />
      </Link>
    </div>
  )
}