import { QuestDefinition } from '@/lib/models/QuestDefinition'
import { UserQuestProgress } from '@/lib/models/UserQuestProgress'

export function dailyKey(date = new Date()) {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function weeklyKey(date = new Date()) {
  // ISO week number
  const tmp = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayNum = tmp.getUTCDay() || 7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `weekly-${tmp.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`
}

export async function getActiveQuests() {
  const defs = await QuestDefinition.find({ active: true }).lean()
  return defs
}

export async function advanceQuest(userId: string, kind: 'score' | 'correct' | string, amount: number) {
  const defs = await getActiveQuests()
  const dKey = dailyKey()
  const wKey = weeklyKey()
  const promises: Promise<any>[] = []
  for (const q of defs) {
    const match = q.goalType === kind || q.goalType.startsWith(`${kind}:`)
    if (!match) continue
    const key = q.period === 'daily' ? dKey : wKey
    promises.push(UserQuestProgress.findOneAndUpdate(
      { userId, code: q.code, periodKey: key },
      { $inc: { progress: amount }, $setOnInsert: { completed: false, claimed: false } },
      { upsert: true, new: true }
    ))
  }
  await Promise.all(promises)
}

export async function getUserQuests(userId: string) {
  const defs = await getActiveQuests()
  const dKey = dailyKey()
  const wKey = weeklyKey()
  const progresses = await UserQuestProgress.find({ userId, periodKey: { $in: [dKey, wKey] } }).lean()
  const byKey: Record<string, any> = {}
  for (const p of progresses) {
    byKey[`${p.code}:${p.periodKey}`] = p
  }
  const results = defs.map((q: any) => {
    const pk = q.period === 'daily' ? dKey : wKey
    const prog = byKey[`${q.code}:${pk}`]
    const progress = prog?.progress || 0
    const completed = progress >= q.goalValue
    const claimed = prog?.claimed || false

    // For streaming quests, include streamingMeta and trackProgress
    const result: any = {
      code: q.code,
      title: q.title,
      period: q.period,
      goalType: q.goalType,
      goalValue: q.goalValue,
      progress,
      completed,
      claimed,
      reward: q.reward
    }

    if (q.streamingMeta) {
      result.streamingMeta = q.streamingMeta
      // Convert Map to plain object if it exists
      if (prog?.trackProgress) {
        result.trackProgress = prog.trackProgress instanceof Map
          ? Object.fromEntries(prog.trackProgress)
          : prog.trackProgress
      } else {
        result.trackProgress = {}
      }
    }

    return result
  })
  return results
}


