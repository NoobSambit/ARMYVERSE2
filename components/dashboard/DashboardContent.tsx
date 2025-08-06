'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { User, Mail, Calendar, Shield } from 'lucide-react'

export default function DashboardContent() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a082a] to-[#3a1d5c] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-4">
            Welcome to Your Dashboard
          </h1>
          <p className="text-gray-300 text-lg">
            You&apos;re successfully authenticated with Firebase!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <User className="w-6 h-6 mr-3 text-purple-400" />
            Your Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Display Name</p>
                  <p className="text-white">{user.displayName || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Email Verified</p>
                  <p className="text-white">
                    {user.emailVerified ? (
                      <span className="text-green-400">✓ Verified</span>
                    ) : (
                      <span className="text-yellow-400">⚠ Not verified</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Account Created</p>
                  <p className="text-white">
                    {user.metadata.creationTime 
                      ? new Date(user.metadata.creationTime).toLocaleDateString()
                      : 'Unknown'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">
                  Authentication Method
                </h3>
                <p className="text-gray-300">
                  {user.providerData.length > 0 
                    ? user.providerData.map(provider => {
                        switch(provider.providerId) {
                          case 'google.com': return 'Google'
                          case 'twitter.com': return 'Twitter'
                          case 'password': return 'Email/Password'
                          default: return provider.providerId
                        }
                      }).join(', ')
                    : 'Email/Password'
                  }
                </p>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-400 mb-2">
                  Status
                </h3>
                <p className="text-gray-300">
                  ✓ Successfully authenticated with Firebase
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-400 mb-2">
              🎉 Firebase Authentication Setup Complete!
            </h3>
            <p className="text-gray-300">
              Your application now supports Email/Password, Google, and Twitter authentication.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}