import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ArmyVerse - Dark BTS Dashboard',
  description: 'Dark-themed BTS fan dashboard with trending analytics, AI playlist generation, and Spotify integration.',
  keywords: ['BTS', 'ARMY', 'K-pop', 'music', 'playlist', 'Spotify', 'dashboard'],
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
    title: 'ArmyVerse - Dark BTS Dashboard',
    description: 'Dark-themed BTS fan dashboard with trending analytics, AI playlist generation, and Spotify integration.',
    url: '/',
    siteName: 'ArmyVerse',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ArmyVerse - BTS Fan Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ArmyVerse - Dark BTS Dashboard',
    description: 'Dark-themed BTS fan dashboard with trending analytics, AI playlist generation, and Spotify integration.',
    images: ['/og-image.jpg'],
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
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}