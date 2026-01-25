/**
 * Complete and claim all active daily/weekly quests for a user.
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
type IdType = 'auto' | 'db' | 'firebase'

type ParsedArgs = {
  user: string
  period: Period
  idType: IdType
  dryRun: boolean
  skipClaim: boolean
  resetClaims: boolean
}

type UserDoc = {
  _id: mongoose.Types.ObjectId
  username: string
  email?: string | null
  firebaseUid?: string | null
}

type ResolvedUser = {
  userId: string
  userDoc: UserDoc | null
  idSource: 'db' | 'firebase' | 'raw'
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
  console.log('Usage: npx tsx scripts/complete-daily-quests.ts --user <username|email|uid> [options]')
  console.log('')
  console.log('Options:')
  console.log('  --user, -u         Username, email, or raw userId (required)')
  console.log('  --period, -p       daily | weekly (default: daily)')
  console.log('  --id-type          auto | db | firebase (default: auto)')
  console.log('  --reset-claims     Force claimed=false for the period before claiming')
  console.log('  --skip-claim       Only set progress; do not claim rewards')
  console.log('  --dry-run          Print actions without writing')
  console.log('  --help, -h         Show this help')
}

function parseArgs(argv: string[]): ParsedArgs {
  let user = ''
  let period: Period = 'daily'
  let idType: IdType = 'auto'
  let dryRun = false
  let skipClaim = false
  let resetClaims = false

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--user' || arg === '-u') {
      user = argv[i + 1] || ''
      i += 1
      continue
    }
    if (arg === '--period' || arg === '-p') {
      const value = argv[i + 1]
      if (value !== 'daily' && value !== 'weekly') {
        throw new Error(`Invalid --period value: ${value}`)
      }
      period = value
      i += 1
      continue
    }
    if (arg === '--id-type') {
      const value = argv[i + 1]
      if (value !== 'auto' && value !== 'db' && value !== 'firebase') {
        throw new Error(`Invalid --id-type value: ${value}`)
      }
      idType = value
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
    if (arg === '--help' || arg === '-h') {
      printUsage()
      process.exit(0)
    }
    throw new Error(`Unknown argument: ${arg}`)
  }

  if (!user) {
    printUsage()
    throw new Error('Missing required --user value')
  }

  return { user, period, idType, dryRun, skipClaim, resetClaims }
}

function errorMessage(err: unknown) {
  if (err instanceof Error) return err.message
  return String(err)
}

async function resolveUserId(input: string, idType: IdType): Promise<ResolvedUser> {
  const normalized = input.toLowerCase()
  const or: Record<string, unknown>[] = [
    { username: normalized },
    { email: normalized },
    { firebaseUid: input }
  ]
  if (mongoose.Types.ObjectId.isValid(input)) {
    or.push({ _id: new mongoose.Types.ObjectId(input) })
  }

  const userDoc = await User.findOne({ $or: or }).lean<UserDoc | null>()
  if (!userDoc) {
    return { userId: input, userDoc: null, idSource: 'raw' }
  }

  const dbId = userDoc._id.toString()
  const firebaseUid = userDoc.firebaseUid || null

  if (idType === 'firebase') {
    if (!firebaseUid) {
      throw new Error('User does not have a firebaseUid; use --id-type db instead.')
    }
    return { userId: firebaseUid, userDoc, idSource: 'firebase' }
  }

  if (idType === 'db') {
    return { userId: dbId, userDoc, idSource: 'db' }
  }

  if (firebaseUid) {
    return { userId: firebaseUid, userDoc, idSource: 'firebase' }
  }

  return { userId: dbId, userDoc, idSource: 'db' }
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

async function main() {
  const args = parseArgs(process.argv.slice(2))
  await connect()

  try {
    const { userId, userDoc, idSource } = await resolveUserId(args.user, args.idType)

    if (userDoc) {
      const label = userDoc.username || userDoc.email || userDoc._id.toString()
      console.log(`User: ${label}`)
      console.log(`Using userId (${idSource}): ${userId}`)
      if (userDoc.firebaseUid) {
        console.log(`Firebase UID: ${userDoc.firebaseUid}`)
      }
      console.log(`DB ID: ${userDoc._id.toString()}`)
    } else {
      console.log(`User doc not found; using raw userId: ${userId}`)
    }

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

    for (const quest of quests) {
      if (args.dryRun) {
        console.log(`Would set progress for ${quest.code} to ${quest.goalValue}`)
        continue
      }

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

      console.log(`Progress set: ${quest.code} ${quest.goalValue}/${quest.goalValue}`)
    }

    if (args.dryRun || args.skipClaim) {
      if (args.skipClaim) {
        console.log('Skip claim enabled: progress set only.')
      }
      return
    }

    const completionBadgeCode = args.period === 'daily' ? 'daily_completion' : 'weekly_completion'
    let completionAwarded = false

    for (const quest of quests) {
      try {
        const result = await claimQuestForUser(userId, quest, periodKey)
        console.log(`Claimed: ${quest.code} (${quest.title})`)

        if (result.balances) {
          console.log(`Balances: dust=${result.balances.dust}, xp=${result.balances.xp}, level=${result.balances.level}`)
        }

        if (result.reward) {
          console.log(`Quest photocard: ${result.reward.title || result.reward.cardId}`)
        }

        if (result.badgesAwarded.length) {
          console.log(`Badges awarded: ${result.badgesAwarded.join(', ')}`)
          if (result.badgesAwarded.includes(completionBadgeCode)) {
            completionAwarded = true
          }
        }

        if (result.photocardAwarded) {
          console.log(`Streak photocard: ${result.photocardAwarded.cardId}`)
        }

        if (result.allQuestsCompleted) {
          console.log(`All ${args.period} quests completed and claimed.`)
        }

        console.log(`Streaks: daily=${result.streaks.daily}, weekly=${result.streaks.weekly}`)
      } catch (err) {
        console.log(`Claim skipped for ${quest.code}: ${errorMessage(err)}`)
      }
    }

    if (completionAwarded) {
      console.log(`Completion badge awarded: ${completionBadgeCode}`)
    } else {
      console.log(`Completion badge not awarded (${completionBadgeCode}).`)
    }
  } finally {
    await mongoose.disconnect()
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
