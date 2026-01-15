'use client'

import React, { useState } from 'react'
import { X, Copy, Check, ExternalLink, Share2, Music2 } from 'lucide-react'

interface SharePlaylistModalProps {
    isOpen: boolean
    onClose: () => void
    playlistName: string
    spotifyUrl: string | null
    trackCount: number
}

export default function SharePlaylistModal({
    isOpen,
    onClose,
    playlistName,
    spotifyUrl,
    trackCount
}: SharePlaylistModalProps) {
    const [copied, setCopied] = useState(false)

    if (!isOpen) return null

    const handleCopy = async () => {
        if (!spotifyUrl) return

        try {
            await navigator.clipboard.writeText(spotifyUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleOpenSpotify = () => {
        if (spotifyUrl) {
            window.open(spotifyUrl, '_blank')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#16161a] border border-white/10 rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl shadow-purple-500/10">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center shadow-lg shadow-green-500/20">
                        <Music2 className="w-7 h-7 text-black" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{playlistName}</h3>
                        <p className="text-sm text-gray-400">{trackCount} tracks</p>
                    </div>
                </div>

                {spotifyUrl ? (
                    <>
                        {/* URL Display */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                                Spotify Playlist URL
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 truncate">
                                    {spotifyUrl}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className={`p-3 rounded-xl transition-all ${copied
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                    title={copied ? 'Copied!' : 'Copy URL'}
                                >
                                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleOpenSpotify}
                                className="flex-1 flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-3 px-4 rounded-xl transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open in Spotify
                            </button>
                            <button
                                onClick={handleCopy}
                                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                        </div>

                        {/* Info */}
                        <p className="text-center text-xs text-gray-500 mt-4">
                            This playlist has been saved to your Spotify account
                        </p>
                    </>
                ) : (
                    /* No URL yet */
                    <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                            <Share2 className="w-8 h-8 text-gray-600" />
                        </div>
                        <h4 className="text-gray-300 font-medium mb-2">Not exported yet</h4>
                        <p className="text-sm text-gray-500">
                            Export this playlist to Spotify first to get a shareable link
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
