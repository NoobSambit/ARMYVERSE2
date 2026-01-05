'use client'

import { useState, useEffect } from 'react'

export default function TestTrendingPage() {
  const [spotifyData, setSpotifyData] = useState<any>(null)
  const [youtubeData, setYoutubeData] = useState<any>(null)
  const [debug, setDebug] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      try {
        // Fetch debug info
        const debugRes = await fetch('/api/debug/trending')
        const debugData = await debugRes.json()
        setDebug(debugData)

        // Fetch Spotify OT7
        const spotifyRes = await fetch('/api/trending/top-songs?platform=spotify&category=ot7&member=BTS')
        const spotifyJson = await spotifyRes.json()
        setSpotifyData(spotifyJson)

        // Fetch YouTube OT7
        const youtubeRes = await fetch('/api/trending/top-songs?platform=youtube&category=ot7&member=BTS')
        const youtubeJson = await youtubeRes.json()
        setYoutubeData(youtubeJson)
      } catch (err) {
        console.error('Error fetching:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8">Trending Section Debug Page</h1>

      {/* Debug Info */}
      <section className="mb-8 bg-gray-800 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">Database Status</h2>
        <div className="space-y-2 font-mono text-sm">
          <div>
            <strong>Spotify:</strong> {debug?.spotify?.exists ? '✅ EXISTS' : '❌ MISSING'}
            {debug?.spotify?.exists && (
              <>
                <br />Date: {debug.spotify.dateKey}
                <br />Artists: {debug.spotify.artists.map((a: any) => `${a.name} (${a.songCount})`).join(', ')}
              </>
            )}
          </div>
          <div className="mt-4">
            <strong>YouTube:</strong> {debug?.youtube?.exists ? '✅ EXISTS' : '❌ MISSING'}
            {debug?.youtube?.exists && (
              <>
                <br />Date: {debug.youtube.dateKey}
                <br />Artists: {debug.youtube.artists.map((a: any) => `${a.name} (${a.songCount})`).join(', ')}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Spotify Data */}
      <section className="mb-8 bg-gray-800 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">Spotify API Response</h2>
        <div className="font-mono text-xs bg-gray-900 p-4 rounded overflow-auto max-h-96">
          <pre>{JSON.stringify(spotifyData, null, 2)}</pre>
        </div>
      </section>

      {/* YouTube Data */}
      <section className="mb-8 bg-gray-800 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">YouTube API Response</h2>
        <div className="font-mono text-xs bg-gray-900 p-4 rounded overflow-auto max-h-96">
          <pre>{JSON.stringify(youtubeData, null, 2)}</pre>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="bg-gray-800 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="space-y-2">
          <button
            onClick={() => fetch('/api/spotify/kworb/cron', { method: 'POST' })}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded mr-2"
          >
            Trigger Spotify Cron
          </button>
          <button
            onClick={() => fetch('/api/youtube/kworb/cron', { method: 'POST' })}
            className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded"
          >
            Trigger YouTube Cron
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          After triggering crons, refresh this page to see updated data.
        </p>
      </section>
    </div>
  )
}
