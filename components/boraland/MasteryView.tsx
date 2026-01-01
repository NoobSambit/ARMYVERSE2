'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/client/api'

type MasteryItem = {
  key: string
  level: number
  xp: number
}

export default function MasteryView() {
  const [members, setMembers] = useState<MasteryItem[]>([])
  const [eras, setEras] = useState<MasteryItem[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    try {
      const res = await apiFetch('/api/game/mastery')
      setMembers(res.members || [])
      setEras(res.eras || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    }
  }

  useEffect(() => { load() }, [])

  const claim = async (kind: 'member'|'era', key: string) => {
    try {
      await apiFetch('/api/game/mastery/claim', { method: 'POST', body: JSON.stringify({ kind, key }) })
      await load()
    } catch (e) {}
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-white text-2xl font-semibold mb-4">Mastery</h2>
      {error && <div className="mb-4 text-rose-300">{error}</div>}
      <div className="grid md:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-4">
          <h3 className="text-white/80 mb-2">Members</h3>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.key} className="flex items-center justify-between text-white/90">
                <div>{m.key}</div>
                <div className="flex items-center gap-3">
                  <div>Lvl {m.level} • {m.xp} xp</div>
                  <button onClick={() => claim('member', m.key)} className="px-3 py-1 rounded-lg border border-[#3b1a52]/60">Claim</button>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-4">
          <h3 className="text-white/80 mb-2">Eras</h3>
          <div className="space-y-2">
            {eras.map((e) => (
              <div key={e.key} className="flex items-center justify-between text-white/90">
                <div>{e.key}</div>
                <div className="flex items-center gap-3">
                  <div>Lvl {e.level} • {e.xp} xp</div>
                  <button onClick={() => claim('era', e.key)} className="px-3 py-1 rounded-lg border border-[#3b1a52]/60">Claim</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}


