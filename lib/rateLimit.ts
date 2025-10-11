import { UserGameState } from '@/lib/models/UserGameState'

export async function incrementDailyStarts(userId: string, limit: number) {
  const today = new Date()
  const dateKey = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}-${String(today.getUTCDate()).padStart(2, '0')}`
  const state = await UserGameState.findOne({ userId })
  if (!state) {
    await UserGameState.create({ userId, limits: { quizStartsToday: 1, dateKey } })
    return { count: 1, limited: 1 > limit }
  }
  if (state.limits?.dateKey !== dateKey) {
    state.limits.dateKey = dateKey
    state.limits.quizStartsToday = 0
  }
  state.limits.quizStartsToday += 1
  await state.save()
  return { count: state.limits.quizStartsToday, limited: state.limits.quizStartsToday > limit }
}


