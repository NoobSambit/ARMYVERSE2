# Leveling System

## Overview

The leveling system provides a progressive difficulty curve for player advancement. Unlike a simple linear formula, it uses carefully designed XP thresholds that increase with each level.

## Level Calculation

Levels are calculated from total XP using a **progressive curve** defined in `/lib/game/leveling.ts`:

```typescript
export function getLevelProgress(totalXp: number): LevelProgress
```

**Returns:**
- `level`: Current player level
- `xpIntoLevel`: XP earned toward current level
- `xpForNextLevel`: Total XP required for current level
- `xpToNextLevel`: Remaining XP needed to level up
- `progressPercent`: Progress through current level (0-100)
- `totalXp`: Total lifetime XP

## Level Thresholds

XP requirements increase progressively with each level. The curve is designed to:
- Start easy for new players (early levels require less XP)
- Gradually increase difficulty
- Provide meaningful progression milestones

## Usage

### In Game State

The `UserGameState.level` field stores the player's current level and is updated whenever XP is earned.

### In Leaderboard

Leaderboard entries display:
- Current level
- XP progress bar within current level
- XP needed to reach next level

### For Rewards

Many game systems use levels for:
- Unlocking features
- Reward tiers
- Achievement requirements
- Badge eligibility

## Integration

### Updating Level

When XP is awarded (via `awardBalances()` in `/lib/game/rewards.ts`):
1. XP is added to UserGameState
2. Level is recalculated from total XP
3. Leaderboard entries are updated with new level

### Displaying Progress

Use the `calculateLevel()` and `calculateXpProgress()` utilities from `/lib/game/leaderboard.ts`:

```typescript
import { calculateLevel, calculateXpProgress } from '@/lib/game/leaderboard'

const level = calculateLevel(totalXp)
const { progress, xpToNextLevel } = calculateXpProgress(totalXp)
```

## Related Files

- `/lib/game/leveling.ts` - Core leveling calculation functions
- `/lib/game/leaderboard.ts` - Leaderboard utilities that use leveling
- `/lib/models/UserGameState.ts` - User game state with level field
- `/lib/models/LeaderboardEntry.ts` - Leaderboard entries with level field
