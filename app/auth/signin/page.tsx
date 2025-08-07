'use client'

import React from 'react'
import SignInForm from '@/components/auth/SignInForm'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-6">
      <div className="max-w-md w-full">
        <SignInForm />
      </div>
    </div>
  )
}
