'use client'

import React, { useState } from 'react'
import { Mail, Twitter, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import DonationModal from './DonationModal'
import DisclaimerModal from './DisclaimerModal'

export default function Footer() {
  const [isDonateOpen, setIsDonateOpen] = useState(false)
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false)

  return (
    <footer className="mt-8 sm:mt-12 border-t border-glass-border bg-black/40 backdrop-blur-lg">
      <div className="layout-container px-4 sm:px-6 lg:px-10 py-8 sm:py-12 max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">

        {/* Brand Column */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative size-14 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/40 rounded-full blur-lg opacity-80"></div>
              <div className="absolute inset-0 bg-white/10 rounded-full blur-md"></div>
              <Image
                src="https://res.cloudinary.com/dacgtjw7w/image/upload/v1767245893/armyverse_logo_1_woqztj.png"
                alt="ARMYVERSE Logo"
                fill
                className="object-contain relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
              />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">ARMYVERSE</h2>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            The ultimate fan-driven dashboard for the purple ocean. Connecting ARMYs worldwide to celebrate and support BTS together.
          </p>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Non-Profit Project
          </div>
        </div>

        {/* Project Links */}
        <div>
          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider text-opacity-80">Project</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <button
                onClick={() => setIsDisclaimerOpen(true)}
                className="hover:text-primary transition-colors text-left"
              >
                About & Disclaimer
              </button>
            </li>
            <li>
              <button
                onClick={() => setIsDonateOpen(true)}
                className="hover:text-primary transition-colors text-left flex items-center gap-1.5 group"
              >
                Donate
                <Heart className="w-3 h-3 text-gray-500 group-hover:text-pink-500 transition-colors" />
              </button>
            </li>
            <li>
              <Link href="/boraland" className="hover:text-primary transition-colors">
                Boraland
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Column */}
        <div>
          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider text-opacity-80">Support</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <a
                href="https://twitter.com/BoyWithLuvBytes"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors flex items-center gap-2"
              >
                <Twitter className="w-4 h-4" />
                @BoyWithLuvBytes
              </a>
            </li>
            <li>
              <a
                href="mailto:armyverse.boraland@gmail.com"
                className="hover:text-primary transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                armyverse.boraland@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* Legal / Disclaimer Preview */}
        <div>
          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider text-opacity-80">Terms</h4>
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
            <p className="text-xs text-gray-500 leading-relaxed">
              This site is not affiliated with BigHit Music or HYBE.
              <button
                onClick={() => setIsDisclaimerOpen(true)}
                className="text-gray-400 hover:text-white underline decoration-gray-600 underline-offset-2 ml-1 transition-colors"
              >
                Read full disclaimer
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-glass-border bg-black/20">
        <div className="layout-container px-4 sm:px-6 lg:px-10 py-6 max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} ARMYVERSE. Unofficial Fan Project.
          </p>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono">
            Forever Bulletproof
          </p>
        </div>
      </div>

      <DonationModal isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} />
      <DisclaimerModal isOpen={isDisclaimerOpen} onClose={() => setIsDisclaimerOpen(false)} />
    </footer>
  )
}
