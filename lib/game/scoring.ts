export type XpScoreResult = {
  correctCount: number
  xp: number
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export function xpForDifficulty(difficulty: Difficulty): number {
  if (difficulty === 'easy') return 1
  if (difficulty === 'medium') return 2
  return 3
}

// Computes XP only, based on per-question difficulty and correctness.
// correctCount increments only when the answer is correct; unanswered/wrong yield 0 xp.
export function scoreAnswersXp(
  questions: { difficulty: Difficulty; answerIndex: number }[],
  userAnswers: number[]
): XpScoreResult {
  if (questions.length !== userAnswers.length) {
    return { correctCount: 0, xp: 0 }
  }

  let correctCount = 0
  let xp = 0
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    const user = userAnswers[i]
    if (user >= 0 && user === q.answerIndex) {
      correctCount++
      xp += xpForDifficulty(q.difficulty)
    }
  }
  return { correctCount, xp }
}

export type ScoringBreakdownItem = {
  id: string
  difficulty: Difficulty
  userAnswerIndex: number
  correctIndex: number
  xpAward: number
}

export function scoreWithBreakdown(args: {
  questions: { id: string; question: string; choices: string[]; difficulty: Difficulty; answerIndex: number }[]
  userAnswers: number[]
}): { correctCount: number; xp: number; breakdown: ScoringBreakdownItem[] } {
  const { questions, userAnswers } = args
  if (questions.length !== userAnswers.length) {
    return { correctCount: 0, xp: 0, breakdown: [] }
  }
  let correctCount = 0
  let xp = 0
  const breakdown: ScoringBreakdownItem[] = []
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    const ua = userAnswers[i]
    const correct = ua >= 0 && ua === q.answerIndex
    const award = correct ? xpForDifficulty(q.difficulty) : 0
    if (correct) correctCount++
    xp += award
    breakdown.push({
      id: q.id,
      difficulty: q.difficulty,
      userAnswerIndex: ua,
      correctIndex: q.answerIndex,
      xpAward: award
    })
  }
  return { correctCount, xp, breakdown }
}



