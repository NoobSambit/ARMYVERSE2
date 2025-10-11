import { Question } from '@/lib/models/Question'

type Difficulty = 'easy' | 'medium' | 'hard'

export type SelectOptions = {
  locale?: string
  count?: number
  difficultyMix?: { easy: number; medium: number; hard: number }
  tagsAny?: string[]
}

const DEFAULT_MIX = { easy: 0.5, medium: 0.35, hard: 0.15 }

export async function selectQuestions(opts: SelectOptions) {
  const locale = opts.locale || 'en'
  const count = Math.max(1, Math.min(opts.count || 10, 20))
  const mix = opts.difficultyMix
    ? normalizeMix(opts.difficultyMix)
    : DEFAULT_MIX

  const perBucket: Record<Difficulty, number> = {
    easy: Math.round(count * mix.easy),
    medium: Math.round(count * mix.medium),
    hard: Math.round(count * mix.hard)
  }
  // Adjust rounding to hit exact count
  const delta = count - (perBucket.easy + perBucket.medium + perBucket.hard)
  if (delta !== 0) perBucket.easy += delta

  const fetchBucket = async (difficulty: Difficulty, size: number) => {
    if (size <= 0) return [] as any[]
    const match: any = { status: 'approved', locale, difficulty }
    if (opts.tagsAny && opts.tagsAny.length) {
      match.tags = { $in: opts.tagsAny }
    }
    return Question.aggregate([
      { $match: match },
      { $sample: { size } }
    ])
  }

  const [easyQs, medQs, hardQs] = await Promise.all([
    fetchBucket('easy', perBucket.easy),
    fetchBucket('medium', perBucket.medium),
    fetchBucket('hard', perBucket.hard)
  ])

  let questions: any[] = [...easyQs, ...medQs, ...hardQs]

  // Fallback: if not enough in a bucket, top up from any available
  if (questions.length < count) {
    const needed = count - questions.length
    const anyMatch: any = { status: 'approved', locale }
    if (opts.tagsAny && opts.tagsAny.length) anyMatch.tags = { $in: opts.tagsAny }
    const extra = await Question.aggregate([
      { $match: anyMatch },
      { $sample: { size: needed } }
    ])
    questions = [...questions, ...extra]
  }

  // Trim to requested count
  questions = questions.slice(0, count)

  return questions
}

function normalizeMix(mix: { easy: number; medium: number; hard: number }) {
  const total = mix.easy + mix.medium + mix.hard
  if (total <= 0) return DEFAULT_MIX
  return { easy: mix.easy / total, medium: mix.medium / total, hard: mix.hard / total }
}


