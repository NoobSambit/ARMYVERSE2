import React from 'react'
import { Sparkles, Mail, Share2 } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-glass-border bg-black/40 backdrop-blur-lg">
      <div className="layout-container px-6 lg:px-10 py-12 max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-primary w-6 h-6" />
            <h2 className="text-xl font-bold text-white">ARMYVERSE</h2>
          </div>
          <p className="text-sm text-gray-400">The ultimate fan-driven dashboard for the purple ocean.</p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Platform</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link className="hover:text-primary transition-colors" href="/">Home</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/trending">Charts</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/boraland">Boraland</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="/community">Community</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Resources</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link className="hover:text-primary transition-colors" href="#">Streaming Guide</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="#">Support</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="#">Privacy Policy</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="#">Terms of Service</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Connect</h4>
          <div className="flex gap-4">
            <div className="size-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary transition-colors cursor-pointer text-white">
              <Mail className="w-5 h-5" />
            </div>
            <div className="size-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary transition-colors cursor-pointer text-white">
              <Share2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
      <div className="text-center py-6 border-t border-glass-border text-xs text-gray-500">
        © 2024 ARMYVERSE. Unofficial Fan Project.
      </div>
    </footer>
  )
}