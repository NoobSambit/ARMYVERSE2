import React from 'react'

async function getData() {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/spotify/kworb/latest`
  const res = await fetch(url || '/api/spotify/kworb/latest', { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function SpotifyAnalyticsPage() {
  const data = await getData()
  const snap = data?.snapshot
  if (!snap) return <div className="text-white">No data yet. Check back after the daily update.</div>

  const fmt = (n?: number) => (typeof n === 'number' ? n.toLocaleString() : '-')

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Spotify Analytics (Kworb)</h1>
        <div className="text-sm text-white/70">Last update: {snap.dateKey} • Source: <a className="underline" href="https://kworb.net/spotify/">kworb.net</a></div>
      </div>

      {/* Overview */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Total Songs" value={snap.songs?.length || 0} />
        <Card title="Total Albums" value={snap.albums?.length || 0} />
        <Card title="Daily 200 Entries" value={snap.daily200?.length || 0} />
        <Card title="Artists List Count" value={snap.artistsAllTime?.length || 0} />
      </section>

      {/* Songs grouped by artist */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">BTS & Members — Songs Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(snap.songsByArtist || snap.songs || []).map((g: any) => (
            <details key={g.artist} className="group rounded-xl border border-white/10 bg-white/5">
              <summary className="cursor-pointer select-none p-4 text-white flex items-center justify-between">
                <div>
                  <div className="font-semibold">{g.artist}</div>
                  <div className="text-sm text-white/70">Streams: {fmt(g.totals?.streams)} • Daily: {fmt(g.totals?.daily)} • Tracks: {fmt(g.totals?.tracks)}</div>
                </div>
                <a href={g.pageUrl} className="underline text-sm" target="_blank">Source</a>
              </summary>
              <div className="p-4 pt-0">
                <Table
                  headers={["Track", "Total Streams", "Daily Gain"]}
                  rows={(g.songs || []).map((r: any) => [
                    r.url ? <a className="underline" href={r.url}>{r.name}</a> : r.name,
                    fmt(r.totalStreams),
                    fmt(r.dailyGain)
                  ])}
                />
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Albums grouped by artist */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">BTS & Members — Albums Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(snap.albumsByArtist || snap.albums || []).map((g: any) => (
            <details key={g.artist} className="group rounded-xl border border-white/10 bg-white/5">
              <summary className="cursor-pointer select-none p-4 text-white flex items-center justify-between">
                <div>
                  <div className="font-semibold">{g.artist}</div>
                  <div className="text-sm text-white/70">Streams: {fmt(g.totals?.streams)} • Daily: {fmt(g.totals?.daily)} • Albums: {fmt(g.totals?.tracks)}</div>
                </div>
                <a href={g.pageUrl} className="underline text-sm" target="_blank">Source</a>
              </summary>
              <div className="p-4 pt-0">
                <Table
                  headers={["Album", "Total Streams", "Daily Gain"]}
                  rows={(g.albums || []).map((r: any) => [
                    r.url ? <a className="underline" href={r.url}>{r.name}</a> : r.name,
                    fmt(r.totalStreams),
                    fmt(r.dailyGain)
                  ])}
                />
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Daily 200 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Global Daily Top 200 (BTS & Members)</h2>
        <Table
          headers={['Rank', 'Artist', 'Track']}
          rows={(snap.daily200 || []).map((r: any) => [r.rank, r.artist, r.name || '-'])}
        />
      </section>

      {/* Global Ranks */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Most Streamed Artists (All Time)</h2>
        <Table
          headers={['Rank', 'Artist', 'Streams']}
          rows={(snap.artistsAllTime || []).slice(0, 50).map((r: any) => [
            r.rank,
            r.url ? <a className="underline" href={r.url}>{r.artist}</a> : r.artist,
            fmt(r.streams)
          ])}
        />
      </section>

      {/* Monthly Listeners */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Monthly Listener Rankings</h2>
        <Table
          headers={['Rank', 'Artist', 'Listeners']}
          rows={(snap.monthlyListeners || []).slice(0, 50).map((r: any) => [
            r.rank,
            r.url ? <a className="underline" href={r.url}>{r.artist}</a> : r.artist,
            fmt(r.listeners)
          ])}
        />
      </section>
    </div>
  )
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-4 text-white">
      <div className="text-sm text-white/70">{title}</div>
      <div className="text-2xl font-bold">{value?.toLocaleString?.() ?? value}</div>
    </div>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: any[][] }) {
  return (
    <div className="overflow-x-auto border border-white/10 rounded-xl">
      <table className="min-w-full text-sm text-white">
        <thead className="bg-white/10">
          <tr>
            {headers.map(h => <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-white/10">
              {r.map((c, j) => <td key={j} className="px-3 py-2">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


