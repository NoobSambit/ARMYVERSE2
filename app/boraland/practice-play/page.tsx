'use client'

import QuizScreen from '@/components/boraland/QuizScreen'

export default function Page() {
  return (
    <div className="h-[100dvh] bg-background-deep overflow-hidden">
      <QuizScreen practiceMode />
    </div>
  )
}
