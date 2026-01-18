# Mastery Badge System

## Overview

The Mastery Badge System rewards users with exclusive badges when they reach milestone levels in their member and era mastery tracks. This system integrates with the existing mastery progression and provides visual recognition for dedicated fans.

## Milestones & Badges

Users earn badges at the following milestone levels:

| Level | Rarity    | XP Reward | Dust Reward | Badge Type                                  |
| ----- | --------- | --------- | ----------- | ------------------------------------------- |
| 5     | Common    | +50       | +25         | Standard milestone badge                    |
| 10    | Rare      | +100      | +75         | Standard milestone badge                    |
| 25    | Rare      | +250      | +200        | Standard milestone badge                    |
| 50    | Epic      | +500      | +400        | Standard milestone badge                    |
| 100   | Legendary | +1500     | +1000       | Special member-specific badge (for members) |

## Badge Types

### Standard Milestone Badges (Levels 5-50)

- Same badge design for all members and eras
- Member name or era name displayed in the middle of the badge
- Located at: `/public/badges/mastery/milestone-{level}.svg`

### Special Level 100 Badges (Members Only)

- Unique badge design for each member + OT7
- Different visual theme per member
- Located at: `/public/badges/mastery/special/{member}-100.svg`
  - `rm-100.svg`
  - `jin-100.svg`
  - `suga-100.svg`
  - `jhope-100.svg`
  - `jimin-100.svg`
  - `v-100.svg`
  - `jungkook-100.svg`
  - `ot7-100.svg`

### Era Level 100 Badges

- Use the standard legendary milestone badge
- Era name displayed on the badge

## Technical Architecture

### Database Models

#### MasteryProgress

- Tracks XP and claimed milestones per user/kind/key
- `claimedMilestones`: Array of milestone levels claimed

#### MasteryRewardLedger

- Audit log for claimed rewards
- Fields added for badge tracking:
  - `badgeCode`: Unique badge identifier (e.g., `mastery_member_rm_5`)
  - `badgeRarity`: Badge rarity level

### API Endpoints

#### GET /api/game/mastery

Returns mastery data including:

- Member and era tracks with progress
- Milestone definitions with badge info
- Summary statistics

#### POST /api/game/mastery/claim

Claims a milestone reward and returns:

- Milestone level claimed
- XP and Dust rewards
- Badge info (code, rarity, description, isSpecial)
- Updated track state

#### GET /api/game/mastery/badges

Returns all mastery badges earned by the user:

- Badge code, kind, key, milestone
- Rarity and image path
- Earned timestamp

### Utility Functions

#### lib/game/mastery.ts

- `getMasteryBadgeCode(kind, key, milestone)`: Generates consistent badge codes
- `getMasteryBadgeInfo(kind, key, milestone)`: Gets full badge info

#### lib/utils/badgeImages.ts

- `getMasteryBadgeImagePath(kind, key, milestone)`: Returns correct image path
- `getMasteryBadgeRarity(milestone)`: Returns rarity based on milestone level
- `getBadgeCategory(badgeCode)`: Identifies badge category

### Frontend Components

#### MasteryRightSidebar.tsx

- Displays milestone rewards with badge previews
- "View All Badge Rewards" button
- Recent badges section
- Integrates MasteryBadgeRewardsModal

#### MasteryBadgeRewardsModal.tsx

- Full-screen modal for viewing all badge rewards
- Tabs: Overview, Members, Eras
- Shows milestone badges, special level 100 badges
- Progress tracking and earned badge display

#### MasteryView.tsx

- Milestone claim buttons with rarity-based colors
- Badge icons for claimed/claimable states
- Enhanced toast notifications on claim

## Badge Code Format

Badge codes follow this pattern:

```
mastery_{kind}_{normalized_key}_{milestone}
```

Examples:

- `mastery_member_rm_5`
- `mastery_member_jungkook_100`
- `mastery_era_wings_25`
- `mastery_era_love_yourself_her_50`

## Image Assets

### Required Badge Images

Place your badge images in the following locations:

**Standard Milestones:**

- `/public/badges/mastery/milestone-5.png`
- `/public/badges/mastery/milestone-10.png`
- `/public/badges/mastery/milestone-25.png`
- `/public/badges/mastery/milestone-50.png`
- `/public/badges/mastery/milestone-100.png`

**Special Member Badges (Level 100):**

- `/public/badges/mastery/special/rm-100.svg`
- `/public/badges/mastery/special/jin-100.svg`
- `/public/badges/mastery/special/suga-100.svg`
- `/public/badges/mastery/special/jhope-100.svg`
- `/public/badges/mastery/special/jimin-100.svg`
- `/public/badges/mastery/special/v-100.svg`
- `/public/badges/mastery/special/jungkook-100.svg`
- `/public/badges/mastery/special/ot7-100.svg`

### Design Guidelines

1. **Standard Badges**: Consistent design with level number and rarity-appropriate colors
2. **Member Badges**: Include member name/initial, unique color scheme per member
3. **OT7 Badge**: Rainbow gradient or combined color scheme representing all 7 members
4. **Format**: SVG preferred for scalability, PNG acceptable
5. **Size**: Design at 100x100 or 120x120 pixels

## Usage Flow

1. User answers quiz questions correctly
2. XP is awarded to relevant member/era mastery tracks
3. When user crosses a milestone threshold:
   - Milestone becomes claimable
   - Claim button shows animation
4. User clicks claim:
   - XP and Dust are awarded
   - Badge is recorded in ledger
   - Toast notification shows rewards + badge
5. User can view all earned badges in the modal
6. Badges are displayed in user profile (future feature)

## Future Enhancements

- [ ] Display badges on user profile
- [ ] Badge showcase/gallery page
- [ ] Share earned badges to social media
- [ ] Badge rarity statistics leaderboard
- [ ] Animated badge reveals on claim
- [ ] Badge collection achievements
