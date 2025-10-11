import { MasteryProgress } from '@/lib/models/MasteryProgress'

export type MasteryIncrement = {
  members: string[]
  eras: string[]
  xp: number
}

export async function addMasteryXp(userId: string, inc: MasteryIncrement) {
  const updates: Promise<any>[] = []
  for (const m of inc.members) {
    updates.push(MasteryProgress.findOneAndUpdate(
      { userId, kind: 'member', key: m },
      { $inc: { xp: inc.xp }, $setOnInsert: { level: 0 }, $set: { lastUpdatedAt: new Date() } },
      { upsert: true, new: true }
    ))
  }
  for (const e of inc.eras) {
    updates.push(MasteryProgress.findOneAndUpdate(
      { userId, kind: 'era', key: e },
      { $inc: { xp: inc.xp }, $setOnInsert: { level: 0 }, $set: { lastUpdatedAt: new Date() } },
      { upsert: true, new: true }
    ))
  }
  await Promise.all(updates)
}

export function levelForXp(xp: number) {
  // Simple thresholds: 100 xp per level
  return Math.floor(xp / 100)
}


