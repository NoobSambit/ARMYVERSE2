/**
 * Complete and claim all active daily/weekly quests for every user.
 */
import * as dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connect } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'
import { UserQuestProgress } from '@/lib/models/UserQuestProgress'
import { UserBadge } from '@/lib/models/UserBadge'
import { InventoryItem } from '@/lib/models/InventoryItem'
import { UserGameState, type IUserGameState } from '@/lib/models/UserGameState'
import { getActiveQuests, dailyKey, weeklyKey } from '@/lib/game/quests'
import { awardBalances } from '@/lib/game/rewards'
import { rollRarityAndCardV2 } from '@/lib/game/dropTable'
import { checkAndAwardDailyCompletionBadge, checkAndAwardWeeklyCompletionBadge } from '@/lib/game/completionBadges'
import { updateDailyStreakAndAwardBadges, updateWeeklyStreakAndAwardBadges } from '@/lib/game/streakTracking'
import { mapPhotocardSummary } from '@/lib/game/photocardMapper'
import type { IQuestDefinition } from '@/lib/models/QuestDefinition'

dotenv.config({ path: '.env.local' })

type Period = 'daily' | 'weekly'

type ParsedArgs = {
  period: Period
  dryRun: boolean
  skipClaim: boolean
  resetClaims: boolean
  limit?: number
  verbose: boolean
}

type ClaimResult = {
  reward: ReturnType<typeof mapPhotocardSummary> | null
  balances: Awaited<ReturnType<typeof awardBalances>> | null
  badgesAwarded: string[]
  photocardAwarded?: any
  allQuestsCompleted: boolean
  streaks: { daily: number; weekly: number }
}

function printUsage() {
  console.log('Usage: npx tsx scripts/complete-daily-quests-all.ts [options]')
  console.log('')
  console.log('Options:')
  console.log('  --period, -p       daily | weekly (default: daily)')
  console.log('  --reset-claims     Force claimed=false for the period before claiming')
  console.log('  --skip-claim       Only set progress; do not claim rewards')
  console.log('  --dry-run          Print summary without writing')
  console.log('  --limit, -l        Limit number of users processed')
  console.log('  --verbose, -v      Log per-user details')
  console.log('  --help, -h         Show this help')
}

function parseArgs(argv: string[]): ParsedArgs {
  let period: Period = 'daily'
  let dryRun = false
  let skipClaim = false
  let resetClaims = false
  let limit: number | undefined
  let verbose = false

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--period' || arg === '-p') {
      const value = argv[i + 1]
      if (value !== 'daily' && value !== 'weekly') {
        throw new Error(`Invalid --period value: ${value}`)
      }
      period = value
      i += 1
      continue
    }
    if (arg === '--reset-claims') {
      resetClaims = true
      continue
    }
    if (arg === '--skip-claim') {
      skipClaim = true
      continue
    }
    if (arg === '--dry-run') {
      dryRun = true
      continue
    }
    if (arg === '--limit' || arg === '-l') {
      const value = Number(argv[i + 1])
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`Invalid --limit value: ${argv[i + 1]}`)
      }
      limit = value
      i += 1
      continue
    }
    if (arg === '--verbose' || arg === '-v') {
      verbose = true
      continue
    }
    if (arg === '--help' || arg === '-h') {
      printUsage()
      process.exit(0)
    }
    throw new Error(`Unknown argument: ${arg}`)
  }

  return { period, dryRun, skipClaim, resetClaims, limit, verbose }
}

function errorMessage(err: unknown) {
  if (err instanceof Error) return err.message
  return String(err)
}

async function claimQuestForUser(userId: string, def: IQuestDefinition, periodKey: string): Promise<ClaimResult> {
  const prog = await UserQuestProgress.findOne({ userId, code: def.code, periodKey })
  if (!prog || (prog.progress || 0) < def.goalValue) {
    throw new Error('Not completed')
  }
  if (prog.claimed) {
    throw new Error('Already claimed')
  }

  let reward: ReturnType<typeof mapPhotocardSummary> | null = null
  let balances: Awaited<ReturnType<typeof awardBalances>> | null = null

  if (def.reward?.dust || def.reward?.xp) {
    balances = await awardBalances(userId, {
      dust: def.reward?.dust || 0,
      xp: def.reward?.xp || 0
    })
  }

  if (def.reward?.badgeId) {
    try {
      await UserBadge.create({
        userId,
        badgeId: def.reward.badgeId,
        earnedAt: new Date(),
        metadata: { questCode: def.code }
      })
    } catch (err) {
      void err
    }
  }

  if (def.reward?.ticket) {
    const roll = await rollRarityAndCardV2({ userId })
    if (roll.card) {
      const sourceType = def.goalType.startsWith('stream:') ? 'quest_streaming' : 'quest_quiz'
      await InventoryItem.create({
        userId,
        cardId: roll.card._id,
        acquiredAt: new Date(),
        source: { type: sourceType, questCode: def.code }
      })
      reward = mapPhotocardSummary(roll.card)
      if (reward) {
        reward = { ...reward, rarity: roll.rarity } as typeof reward
      }
    }
  }

  prog.claimed = true
  prog.completed = true
  await prog.save()

  const completionResult = def.period === 'daily'
    ? await checkAndAwardDailyCompletionBadge(userId, { awardCompletionBadge: false })
    : await checkAndAwardWeeklyCompletionBadge(userId, { awardCompletionBadge: false })

  const badgesAwarded: string[] = []
  let photocardAwarded: any = undefined
  let newDailyStreak = 0
  let newWeeklyStreak = 0

  if (completionResult.allCompleted) {
    if (completionResult.badgeAwarded) {
      badgesAwarded.push(completionResult.badgeAwarded)
    }

    if (def.period === 'daily') {
      const streakResult = await updateDailyStreakAndAwardBadges(userId)
      newDailyStreak = streakResult.newStreak
      badgesAwarded.push(...streakResult.badgesAwarded)
      if (streakResult.photocardAwarded) {
        photocardAwarded = streakResult.photocardAwarded
      }
    } else {
      const streakResult = await updateWeeklyStreakAndAwardBadges(userId)
      newWeeklyStreak = streakResult.newStreak
      badgesAwarded.push(...streakResult.badgesAwarded)
      if (streakResult.photocardAwarded) {
        photocardAwarded = streakResult.photocardAwarded
      }
    }
  }

  const state = await UserGameState.findOne({ userId }).lean<IUserGameState | null>()

  return {
    reward,
    balances,
    badgesAwarded,
    photocardAwarded,
    allQuestsCompleted: completionResult.allCompleted,
    streaks: {
      daily: newDailyStreak || state?.streak?.dailyCount || 0,
      weekly: newWeeklyStreak || state?.streak?.weeklyCount || 0
    }
  }
}

async function resolveUserIdForRewards(
  user: { _id: mongoose.Types.ObjectId; firebaseUid?: string | null },
  periodKey: string
): Promise<{ userId: string; source: string; conflict?: string }> {
  const dbId = user._id.toString()
  const firebaseUid = user.firebaseUid || null
  const candidates = firebaseUid ? [dbId, firebaseUid] : [dbId]

  if (firebaseUid) {
    const existingProgress = await UserQuestProgress.findOne({
      userId: { $in: candidates },
      periodKey
    }).lean()
    if (existingProgress?.userId) {
      return { userId: existingProgress.userId, source: 'progress' }
    }
  }

  const states = await UserGameState.find({ userId: { $in: candidates } })
    .select('userId xp updatedAt')
    .lean()

  if (states.length === 1) {
    return { userId: states[0].userId, source: 'gameState' }
  }

  if (states.length > 1) {
    const sorted = [...states].sort((a, b) => {
      const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
      const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
      if (aUpdated !== bUpdated) return bUpdated - aUpdated
      const aXp = typeof a.xp === 'number' ? a.xp : 0
      const bXp = typeof b.xp === 'number' ? b.xp : 0
      return bXp - aXp
    })
    return {
      userId: sorted[0].userId,
      source: 'gameState',
      conflict: `Multiple game states found (${states.map(s => s.userId).join(', ')})`
    }
  }

  if (firebaseUid) {
    return { userId: firebaseUid, source: 'firebaseUid' }
  }

  return { userId: dbId, source: 'dbId' }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  await connect()

  const periodKey = args.period === 'daily' ? dailyKey() : weeklyKey()
  const allQuests = await getActiveQuests()
  const quests = allQuests.filter(q => q.period === args.period) as IQuestDefinition[]

  if (quests.length === 0) {
    console.log(`No active ${args.period} quests found.`)
    return
  }

  console.log(`Active ${args.period} quests: ${quests.length}`)
  console.log(`Period key: ${periodKey}`)

  if (args.dryRun) {
    console.log('Dry run enabled: no changes will be written.')
  }

  let processedUsers = 0
  let claimedCount = 0
  let alreadyClaimedCount = 0
  let notCompletedCount = 0
  let errorCount = 0

  const cursor = User.find({})
    .select('_id username email firebaseUid')
    .lean()
    .cursor()

  for await (const user of cursor) {
    const resolved = await resolveUserIdForRewards(user, periodKey)
    const userId = resolved.userId
    processedUsers += 1

    if (args.verbose) {
      const label = user.username || user.email || user._id.toString()
      console.log(`\nUser: ${label} (${userId})`)
      console.log(`UserId source: ${resolved.source}`)
      if (resolved.conflict) {
        console.log(`Warning: ${resolved.conflict}`)
      }
    } else if (processedUsers % 50 === 0) {
      console.log(`Processed ${processedUsers} users...`)
    }

    if (!args.dryRun) {
      for (const quest of quests) {
        const update: {
          $set: Record<string, unknown>
          $setOnInsert: Record<string, unknown>
        } = {
          $set: {
            progress: quest.goalValue,
            completed: true,
            updatedAt: new Date()
          },
          $setOnInsert: {
            claimed: false
          }
        }

        if (args.resetClaims) {
          update.$set.claimed = false
          delete update.$setOnInsert.claimed
        }

        await UserQuestProgress.findOneAndUpdate(
          { userId, code: quest.code, periodKey },
          update,
          { upsert: true, new: true }
        )
      }
    }

    if (args.dryRun || args.skipClaim) {
      if (args.verbose) {
        console.log(args.skipClaim ? 'Skip claim enabled: progress set only.' : 'Dry run: would claim all quests.')
      }
      if (args.limit && processedUsers >= args.limit) break
      continue
    }

    for (const quest of quests) {
      try {
        await claimQuestForUser(userId, quest, periodKey)
        claimedCount += 1
        if (args.verbose) {
          console.log(`Claimed: ${quest.code}`)
        }
      } catch (err) {
        const message = errorMessage(err)
        if (message === 'Already claimed') {
          alreadyClaimedCount += 1
        } else if (message === 'Not completed') {
          notCompletedCount += 1
        } else {
          errorCount += 1
          if (args.verbose) {
            console.log(`Error: ${quest.code} - ${message}`)
          }
        }
      }
    }

    if (args.limit && processedUsers >= args.limit) break
  }

  console.log('\nDone.')
  console.log(`Users processed: ${processedUsers}`)
  if (!args.skipClaim && !args.dryRun) {
    console.log(`Quests claimed: ${claimedCount}`)
    console.log(`Already claimed: ${alreadyClaimedCount}`)
    console.log(`Not completed: ${notCompletedCount}`)
    console.log(`Errors: ${errorCount}`)
  }
}

main()
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
