'use client'

import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {
  X,
  Info,
  CheckCircle,
  Circle,
  ExternalLink,
  Copy,
  Code,
  Key,
  Shield,
  ArrowRight,
} from 'lucide-react'

interface SpotifyBYOGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SpotifyBYOGuideModal({
  isOpen,
  onClose,
}: SpotifyBYOGuideModalProps) {
  const steps = [
    {
      id: 1,
      title: 'Go to Spotify Developer Dashboard',
      description:
        'First, you need to create a free Spotify Developer account. This lets you connect your own Spotify account to ArmyVerse.',
      subSteps: [
        'Open your web browser',
        'Type this address: developer.spotify.com/dashboard',
        'Click link or copy-paste that address into your browser',
        'Log in with your Spotify account (same one you use for music)',
      ],
    },
    {
      id: 2,
      title: 'Create a New App',
      description:
        "You'll need to create a simple app to get your unique connection codes. This is free and takes 2 minutes.",
      subSteps: [
        'Look for a button that says "Create App" or "Create Client"',
        'Click that button',
        'Fill in name (like "My ArmyVerse App")',
        'Type a short description (like "For ArmyVerse playlists")',
      ],
      important: {
        text: 'IMPORTANT: Add this Redirect URI',
        code: 'https://armyverse.vercel.app/api/spotify/callback',
        instructions: [
          'Scroll to "Redirect URIs" or "Redirect URLs" section',
          'Click "Add URI" or "Add Redirect URL"',
          'Copy and paste: https://armyverse.vercel.app/api/spotify/callback',
          'Click "Save" or "Add"',
        ],
      },
    },
    {
      id: 3,
      title: 'Find Your Client ID',
      description:
        'After creating your app, Spotify will give you two codes. You need one of them.',
      subSteps: [
        'Scroll down on the page until you see "Client ID"',
        'It looks like a long code with letters and numbers',
        'Example: a1b2c3d4e5f6g7h8i9j0k',
        'Copy that whole code (you can click "Copy" button if available)',
      ],
    },
    {
      id: 4,
      title: 'Find Your Client Secret (Optional)',
      description:
        'You might also need your Client Secret. This is extra security for your app.',
      subSteps: [
        'Right below Client ID, look for "Client Secret"',
        'Click "Show" or eye icon to see it',
        "Copy that code too (it's similar to Client ID)",
        'Note: You may or may not need this for ArmyVerse',
      ],
    },
    {
      id: 5,
      title: 'Go to Your ArmyVerse Profile',
      description:
        'Now come back to ArmyVerse to connect your Spotify account.',
      subSteps: [
        'Go back to ArmyVerse website',
        'Click on your profile picture in top-right corner',
        'Select "Profile" or "Settings" from the menu',
        'Find the tab or section that says "Connection"',
      ],
    },
    {
      id: 6,
      title: 'Paste Your Spotify Codes in Connection Section',
      description:
        'Paste the codes you got from Spotify into the Connection section of your profile.',
      subSteps: [
        'In the Connection section, find the box for "Spotify Client ID"',
        'Paste your Client ID in that box (right-click or Ctrl+V to paste)',
        'If there\'s also a box for "Client Secret", paste that too',
        'Click "Save" or "Connect" button to finish',
      ],
    },
    {
      id: 7,
      title: 'Complete Spotify Connection',
      description:
        "Almost done! You'll go through a quick Spotify approval screen.",
      subSteps: [
        "After clicking Save, you might see Spotify's login page",
        'Log in to your Spotify account again (if asked)',
        'Click "Agree" or "Authorize" to let ArmyVerse connect',
        "You'll come back to ArmyVerse and you're all set!",
      ],
      isLast: true,
    },
  ]

  return (
    <Dialog.Root open={isOpen} onOpenChange={open => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] animate-in fade-in duration-200" />
        <Dialog.Content className="fixed z-[101] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-4xl max-h-[90vh] rounded-[28px] border border-white/10 bg-[#121212] shadow-2xl overflow-hidden focus:outline-none animate-in zoom-in-95 duration-200">
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#1DB954]/10 to-transparent pointer-events-none" />

          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10 focus:outline-none">
              <X className="w-5 h-5" />
            </button>
          </Dialog.Close>

          <div className="p-6 md:p-8 relative z-0">
            <div className="text-center mb-6">
              <div className="size-16 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-900/20">
                <Key className="text-black w-8 h-8" />
              </div>
              <Dialog.Title className="text-2xl md:text-3xl font-bold text-white mb-2">
                How to Connect Your Spotify Account
              </Dialog.Title>
              <p className="text-gray-400 text-sm md:text-base max-w-3xl mx-auto">
                Follow these steps to connect your own Spotify account to
                ArmyVerse using Spotify Developer Dashboard
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-4 md:p-5 border border-blue-500/20 mb-6">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Info className="text-blue-400 w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white text-base mb-2">
                    This is OPTIONAL!
                  </h4>
                  <p className="text-gray-400 text-sm mb-2">
                    You only need to connect your Spotify account if you want
                    playlists saved directly to{' '}
                    <strong className="text-blue-300">
                      your personal Spotify account
                    </strong>
                    .
                  </p>
                  <p className="text-gray-500 text-xs md:text-sm">
                    If you don't connect, your playlists will still be saved to
                    ArmyVerse's Spotify account and you can access them anytime.
                    You won't lose any playlists!
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar mb-6">
              {steps.map(step => (
                <div
                  key={step.id}
                  className={`rounded-2xl p-4 md:p-5 border transition-all ${
                    step.isLast
                      ? 'bg-gradient-to-r from-[#1DB954]/10 to-green-500/10 border-[#1DB954]/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div
                      className={`flex-shrink-0 size-8 md:size-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${
                        step.isLast
                          ? 'bg-[#1DB954] text-white'
                          : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {step.isLast ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-base md:text-lg mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-400 text-sm md:text-base mb-3">
                        {step.description}
                      </p>

                      <ul className="space-y-2">
                        {step.subSteps.map((subStep, subIndex) => (
                          <li
                            key={subIndex}
                            className="flex items-start gap-2 text-gray-500 text-xs md:text-sm"
                          >
                            <Circle className="w-1.5 h-1.5 md:w-2 md:h-2 flex-shrink-0 mt-1.5 md:mt-2 text-gray-600 fill-gray-600" />
                            <span>{subStep}</span>
                          </li>
                        ))}
                      </ul>

                      {step.important && (
                        <div className="mt-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4">
                          <div className="flex items-start gap-2 mb-3">
                            <div className="size-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                              <ExternalLink className="text-red-400 w-3 h-3" />
                            </div>
                            <div>
                              <h4 className="font-bold text-red-400 text-sm">
                                {step.important.text}
                              </h4>
                            </div>
                          </div>

                          <div className="bg-black/40 rounded-lg p-3 mb-3 border border-white/10">
                            <p className="text-[10px] text-gray-500 mb-1">
                              Redirect URI (Copy this exactly):
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <code className="text-[#1DB954] text-xs md:text-sm font-mono bg-[#1DB954]/10 px-3 py-2 rounded-md break-all">
                                {step.important.code}
                              </code>
                            </div>
                          </div>

                          <ul className="space-y-1.5">
                            {step.important.instructions.map(
                              (instruction, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-gray-500 text-[11px]"
                                >
                                  <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-red-400" />
                                  <span>{instruction}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 space-y-4">
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-4 md:p-5 border border-purple-500/20">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Code className="text-purple-400 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base mb-2">
                      What is Client ID & Client Secret?
                    </h4>
                    <p className="text-gray-400 text-sm mb-2">
                      These are special codes from Spotify that let ArmyVerse
                      connect to YOUR account safely. Think of them like a
                      password that only works for your app.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Key className="text-purple-400 w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-purple-400 font-semibold">
                            Client ID
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Required - identifies your app
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Shield className="text-blue-400 w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-blue-400 font-semibold">
                            Client Secret
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Optional - extra security
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <ExternalLink className="text-yellow-400 w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Need Help?</h4>
                    <p className="text-gray-500 text-xs">
                      If something doesn't work, check these:
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-400 text-xs md:text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-600" />
                    <span>
                      Make sure you copied Client ID correctly (no extra spaces)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-600" />
                    <span>
                      Click "Show" to reveal Client Secret before copying
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-600" />
                    <span>
                      <strong className="text-red-400">IMPORTANT:</strong> Add
                      the Redirect URI:
                      https://armyverse.vercel.app/api/spotify/callback
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-600" />
                    <span>
                      Only enter codes you got from YOUR Spotify Developer
                      Dashboard
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Got It!
              </button>
              <button
                onClick={() =>
                  window.open(
                    'https://developer.spotify.com/dashboard',
                    '_blank'
                  )
                }
                className="flex-1 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Go to Spotify Developer Dashboard
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
