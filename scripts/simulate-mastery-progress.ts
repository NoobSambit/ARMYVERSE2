/**
 * Simulate mastery progress by granting XP and claiming milestones.
 */
import * as dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connect } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'
import { MasteryProgress } from '@/lib/models/MasteryProgress'
import { MasteryRewardLedger } from '@/lib/models/MasteryRewardLedger'
import { MasteryLevelRewardLedger } from '@/lib/models/MasteryLevelRewardLedger'
import {
  addMasteryXp,
  claimableMilestones,
  dividerFor,
  getMasteryBadgeCode,
  levelForXp,
  MASTERY_MILESTONES,
  masteryXpMultiplier
} from '@/lib/game/mastery'
import { awardBalances } from '@/lib/game/rewards'

dotenv.config({ path: '.env.local' })

type IdType = 'auto' | 'db' | 'firebase'
type Kind = 'member' | 'era'

type ParsedArgs = {
  user: string
  idType: IdType
  kind: Kind
  key: string
  targetLevel: number
  claim: boolean
  reset: boolean
  dryRun: boolean
}

type UserDoc = {
  _id: mongoose.Types.ObjectId
  username?: string
  email?: string | null
  firebaseUid?: string | null
}

type ResolvedUser = {
  userId: string
  userDoc: UserDoc | null
  idSource: 'db' | 'firebase' | 'raw'
}

function printUsage() {
  console.log('Usage: npx tsx scripts/simulate-mastery-progress.ts --user <username|email|uid> --kind <member|era> --key <name> --target-level <n> [options]')
  console.log('')
  console.log('Options:')
  console.log('  --user, -u         Username, email, or raw userId (required)')
  console.log('  --id-type          auto | db | firebase (default: auto)')
  console.log('  --kind             member | era (required)')
  console.log('  --key              Mastery key (e.g., "J-Hope", "Wings") (required)')
  console.log('  --target-level     Target mastery level to reach (required)')
  console.log('  --claim            Claim all available milestones after XP update')
  console.log('  --reset            Reset mastery progress + ledgers for this track')
  console.log('  --dry-run          Print actions without writing')
  console.log('  --help, -h         Show this help')
}

function parseArgs(argv: string[]): ParsedArgs {
  let user = ''
  let idType: IdType = 'auto'
  let kind: Kind | '' = ''
  let key = ''
  let targetLevel = 0
  let claim = false
  let reset = false
  let dryRun = false

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--user' || arg === '-u') {
      user = argv[i + 1] || ''
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
    if (arg === '--kind') {
      const value = argv[i + 1]
      if (value !== 'member' && value !== 'era') {
        throw new Error(`Invalid --kind value: ${value}`)
      }
      kind = value
      i += 1
      continue
    }
    if (arg === '--key') {
      key = argv[i + 1] || ''
      i += 1
      continue
    }
    if (arg === '--target-level') {
      targetLevel = Number(argv[i + 1] || '0')
      i += 1
      continue
    }
    if (arg === '--claim') {
      claim = true
      continue
    }
    if (arg === '--reset') {
      reset = true
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

  if (!user || !kind || !key || !targetLevel) {
    printUsage()
    throw new Error('Missing required arguments.')
  }

  return { user, idType, kind, key, targetLevel, claim, reset, dryRun }
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

async function claimMilestone(userId: string, kind: Kind, key: string, milestone: number) {
  const reward = MASTERY_MILESTONES.find(m => m.level === milestone)
  if (!reward) throw new Error(`Invalid milestone ${milestone}`)

  await MasteryProgress.updateOne(
    { userId, kind, key },
    { $addToSet: { claimedMilestones: milestone }, $set: { level: milestone, lastUpdatedAt: new Date() } }
  )

  const balances = await awardBalances(userId, { dust: reward.rewards.dust, xp: reward.rewards.xp })
  const badgeCode = getMasteryBadgeCode(kind, key, milestone)
  const badgeRarity = reward.badge.rarity
  const extraBadges = kind === 'member' && milestone === 100
    ? [{ code: 'mastery_milestone_100', rarity: badgeRarity }]
    : []

  try {
    await MasteryRewardLedger.create({
      userId,
      kind,
      key,
      milestone,
      rewards: reward.rewards,
      badgeCode,
      badgeRarity,
      extraBadges
    })
  } catch (err: any) {
    if (err?.code !== 11000) {
      console.error('Mastery reward ledger error:', err)
    }
  }

  return { badgeCode, extraBadges, balances }
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

    if (args.reset) {
      if (args.dryRun) {
        console.log(`Dry run: would reset mastery progress + ledgers for ${args.kind}:${args.key}`)
      } else {
        await MasteryProgress.deleteOne({ userId, kind: args.kind, key: args.key })
        await MasteryRewardLedger.deleteMany({ userId, kind: args.kind, key: args.key })
        await MasteryLevelRewardLedger.deleteMany({ userId, kind: args.kind, key: args.key })
        console.log(`Reset mastery progress + ledgers for ${args.kind}:${args.key}`)
      }
    }

    const progress = await MasteryProgress.findOne({ userId, kind: args.kind, key: args.key }).lean<any>()
    const divider = dividerFor(args.kind, args.key)
    const currentXp = progress?.xp || 0
    const currentLevel = levelForXp(currentXp, divider)

    console.log(`Current XP: ${currentXp} (Level ${currentLevel})`)
    console.log(`Target Level: ${args.targetLevel}`)

    if (args.targetLevel <= currentLevel) {
      console.log('Target level already reached; no XP added.')
    } else {
      const perLevel = 100 * Math.max(1, divider)
      const targetXp = args.targetLevel * perLevel
      const delta = targetXp - currentXp
      const multiplier = masteryXpMultiplier(args.kind, args.key)
      const rawDelta = Math.ceil(delta / Math.max(1, multiplier))

      console.log(`XP needed: ${delta} (raw add: ${rawDelta} at ${multiplier}x)`)

      if (args.dryRun) {
        console.log('Dry run: skipping XP update and rewards.')
      } else {
        const awards = await addMasteryXp(userId, {
          members: args.kind === 'member' ? [args.key] : [],
          eras: args.kind === 'era' ? [args.key] : [],
          xp: rawDelta
        })
        console.log(`Photocards awarded for levels: ${awards.length}`)
      }
    }

    if (args.claim) {
      const updated = await MasteryProgress.findOne({ userId, kind: args.kind, key: args.key }).lean<any>()
      const claimable = claimableMilestones(updated?.xp || 0, updated?.claimedMilestones || [], updated?.level || 0, divider)
      if (!claimable.length) {
        console.log('No claimable milestones.')
      } else if (args.dryRun) {
        console.log(`Dry run: would claim milestones: ${claimable.join(', ')}`)
      } else {
        for (const milestone of claimable) {
          const result = await claimMilestone(userId, args.kind, args.key, milestone)
          console.log(`Claimed milestone ${milestone}: ${result.badgeCode}`)
          if (result.extraBadges.length) {
            console.log(`Extra badges: ${result.extraBadges.map(b => b.code).join(', ')}`)
          }
        }
      }
    }

    const finalProgress = await MasteryProgress.findOne({ userId, kind: args.kind, key: args.key }).lean<any>()
    if (finalProgress) {
      const finalLevel = levelForXp(finalProgress.xp || 0, divider)
      console.log(`Final XP: ${finalProgress.xp} (Level ${finalLevel})`)
    }
  } finally {
    await mongoose.disconnect()
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
