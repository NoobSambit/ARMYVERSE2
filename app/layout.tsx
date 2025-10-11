import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import MobileQuickActions from '@/components/layout/MobileQuickActions'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/components/ui/Toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ARMYVERSE — BTS Trends, AI Playlists & Spotify Stats',
  description: 'Explore live BTS trends across Spotify and YouTube, create AI-powered playlists, and track your Spotify listening stats. Made for ARMY.',
  keywords: ['ARMYVERSE', 'BTS', 'ARMY', 'K-pop', 'music', 'playlist', 'AI playlists', 'Spotify', 'YouTube', 'trending', 'analytics'],
  authors: [{ name: 'ArmyVerse Team' }],
  creator: 'ArmyVerse',
  publisher: 'ArmyVerse',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://armyverse.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ARMYVERSE — BTS Trends, AI Playlists & Spotify Stats',
    description: 'Explore live BTS trends across Spotify and YouTube, create AI-powered playlists, and track your Spotify listening stats. Made for ARMY.',
    url: '/',
    siteName: 'ARMYVERSE',
    images: [
      {
        url: 'https://res.cloudinary.com/dacgtjw7w/image/upload/v1755014757/ChatGPT_Image_Aug_12_2025_09_28_26_PM_rewlxg.png',
        width: 1200,
        height: 630,
        alt: 'ARMYVERSE',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ARMYVERSE — BTS Trends, AI Playlists & Spotify Stats',
    description: 'Explore live BTS trends across Spotify and YouTube, create AI-powered playlists, and track your Spotify listening stats. Made for ARMY.',
    images: ['https://res.cloudinary.com/dacgtjw7w/image/upload/v1755014757/ChatGPT_Image_Aug_12_2025_09_28_26_PM_rewlxg.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} page-gradient`}>
        <ToastProvider>
          <AuthProvider>
            <Navbar />
            {children}
            <MobileQuickActions />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}