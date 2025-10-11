'use client'

import { useEffect, useRef } from 'react'

type Props = {
  question: string
  choices: string[]
  selectedIndex: number | null
  onSelect: (idx: number) => void
}

export default function QuestionCard({ question, choices, selectedIndex, onSelect }: Props) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])
  useEffect(() => {
    refs.current[0]?.focus()
  }, [question])
  const onKey = (e: React.KeyboardEvent) => {
    const current = document.activeElement
    const idx = refs.current.findIndex((el) => el === current)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      refs.current[Math.min(choices.length - 1, idx + 1)]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      refs.current[Math.max(0, idx - 1)]?.focus()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (idx >= 0) onSelect(idx)
    }
  }
  return (
    <div className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-6 shadow-[0_10px_30px_rgba(129,0,255,0.15)]">
      <div className="text-lg text-white mb-4">{question}</div>
      <div className="grid gap-3" onKeyDown={onKey}>
        {choices.map((c, i) => (
          <button
            key={i}
            ref={(el) => (refs.current[i] = el)}
            onClick={() => onSelect(i)}
            aria-selected={selectedIndex === i}
            className={`text-left px-4 py-3 rounded-xl border transition ease-out duration-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 
              ${selectedIndex === i ? 'border-fuchsia-400 bg-fuchsia-400/10' : 'border-[#3b1a52]/60 bg-white/5 hover:bg-white/10'}`}
          >
            <span className="text-white">{c}</span>
          </button>
        ))}
      </div>
    </div>
  )
}


