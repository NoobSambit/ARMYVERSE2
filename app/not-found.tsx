import Link from 'next/link'
import { Heart, Home } from 'lucide-react'

export const metadata = {
  title: '404 • ARMYVERSE',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
            <Heart className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-300 mb-2">Page Not Found</h2>
          <p className="text-gray-400 mb-8">The page you&apos;re looking for doesn&apos;t exist in the ARMYVERSE.</p>
        </div>
        
        <Link 
          href="/"
          className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          <Home className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}