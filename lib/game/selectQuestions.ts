import { Question } from '@/lib/models/Question'

type QuizQuestionDoc = {
  _id: string
  question: string
  choices: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  tags?: string[]
  locale: string
  status: string
}

export type SelectOptions = {
  locale?: string
  count?: number
  difficultyMix?: { easy: number; medium: number; hard: number }
  tagsAny?: string[]
}

export async function selectQuestions(opts: SelectOptions) {
  const locale = opts.locale || 'en'
  const count = Math.max(1, Math.min(opts.count || 10, 20))

  const baseMatch: Record<string, unknown> = { status: 'approved', locale }
  if (opts.tagsAny && opts.tagsAny.length) {
    baseMatch.tags = { $in: opts.tagsAny }
  }

  // Primary: uniform random sample across the entire approved pool for the locale.
  let questions: QuizQuestionDoc[] = await Question.aggregate<QuizQuestionDoc>([
    { $match: baseMatch },
    { $sample: { size: count } }
  ])

  // Fallback: if the pool is smaller than requested, top up from any approved locale to avoid repeats.
  if (questions.length < count) {
    const needed = count - questions.length
    const fallbackMatch: Record<string, unknown> = { status: 'approved' }
    if (opts.tagsAny && opts.tagsAny.length) fallbackMatch.tags = { $in: opts.tagsAny }
    const extra = await Question.aggregate<QuizQuestionDoc>([
      { $match: fallbackMatch },
      { $sample: { size: needed } }
    ])
    questions = [...questions, ...extra]
  }

  // Trim in case sample returned extra due to top-up
  return questions.slice(0, count)
}
