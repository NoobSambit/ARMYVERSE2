'use client'

import React from 'react'
import SignUpForm from '@/components/auth/SignUpForm'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-6">
      <div className="max-w-md w-full">
        <SignUpForm />
      </div>
    </div>
  )
}
