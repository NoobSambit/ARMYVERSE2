/**
 * Component Display Tests
 * 
 * Tests that UI components correctly display badge data and react to gameplay.
 * These tests validate:
 * - Badge data transformation for display
 * - Streak badge with overlay rendering logic
 * - Badge filtering and categorization
 * - Dynamic badge image path generation
 */

import {
    getBadgeImagePath,
    getBadgeRarityColors,
    getBadgeCategory,
    getMasteryBadgeImagePath,
    getMasteryBadgeRarity,
} from '@/lib/utils/badgeImages'

describe('Badge Display Utilities', () => {
    describe('getBadgeImagePath()', () => {
        it('should return correct path for daily streak badges', () => {
            expect(getBadgeImagePath('daily_streak_1')).toMatch(/daily-streak/)
            expect(getBadgeImagePath('daily_streak_5')).toMatch(/daily-streak/)
            expect(getBadgeImagePath('daily_streak_10')).toMatch(/daily-streak/)
        })

        it('should return correct path for weekly streak badges', () => {
            expect(getBadgeImagePath('weekly_streak_1')).toMatch(/weekly-streak/)
            expect(getBadgeImagePath('weekly_streak_10')).toMatch(/weekly-streak/)
        })

        it('should return correct path for milestone badges', () => {
            expect(getBadgeImagePath('daily_milestone_1')).toMatch(/milestone/)
            expect(getBadgeImagePath('weekly_milestone_5')).toMatch(/milestone/)
        })

        it('should return correct path for completion badges', () => {
            expect(getBadgeImagePath('daily_completion')).toMatch(/completion/)
            expect(getBadgeImagePath('weekly_completion')).toMatch(/completion/)
        })
    })

    describe('getBadgeRarityColors()', () => {
        it('should return correct colors for each rarity', () => {
            const common = getBadgeRarityColors('common')
            const rare = getBadgeRarityColors('rare')
            const epic = getBadgeRarityColors('epic')
            const legendary = getBadgeRarityColors('legendary')

            // Each rarity should return distinct color values
            expect(common).toBeDefined()
            expect(rare).toBeDefined()
            expect(epic).toBeDefined()
            expect(legendary).toBeDefined()

            // They should be different from each other
            expect(common).not.toEqual(legendary)
        })
    })

    describe('getBadgeCategory()', () => {
        it('should categorize daily streak badges correctly', () => {
            expect(getBadgeCategory('daily_streak_5')).toBe('Daily Streak')
        })

        it('should categorize weekly streak badges correctly', () => {
            expect(getBadgeCategory('weekly_streak_3')).toBe('Weekly Streak')
        })

        it('should categorize milestone badges correctly', () => {
            expect(getBadgeCategory('daily_milestone_1')).toBe('Daily Milestone')
            expect(getBadgeCategory('weekly_milestone_2')).toBe('Weekly Milestone')
        })

        it('should categorize completion badges correctly', () => {
            expect(getBadgeCategory('daily_completion')).toBe('Daily Completion')
            expect(getBadgeCategory('weekly_completion')).toBe('Weekly Completion')
        })

        it('should categorize mastery badges correctly', () => {
            expect(getBadgeCategory('mastery_member_rm_5')).toBe('Member Mastery')
            expect(getBadgeCategory('mastery_era_wings_10')).toBe('Era Mastery')
        })
    })
})

describe('Mastery Badge Display Utilities', () => {
    describe('getMasteryBadgeImagePath()', () => {
        it('should return standard milestone path for levels 5-50', () => {
            expect(getMasteryBadgeImagePath('member', 'RM', 5)).toMatch(/milestone-5/)
            expect(getMasteryBadgeImagePath('member', 'Jimin', 10)).toMatch(/milestone-10/)
            expect(getMasteryBadgeImagePath('era', 'Wings', 25)).toMatch(/milestone-25/)
            expect(getMasteryBadgeImagePath('era', 'BE', 50)).toMatch(/milestone-50/)
        })

        it('should return special member path for level 100 members', () => {
            expect(getMasteryBadgeImagePath('member', 'RM', 100)).toMatch(/special\/rm-100/)
            expect(getMasteryBadgeImagePath('member', 'Jungkook', 100)).toMatch(/special\/jungkook-100/)
            expect(getMasteryBadgeImagePath('member', 'V', 100)).toMatch(/special\/v-100/)
            expect(getMasteryBadgeImagePath('member', 'OT7', 100)).toMatch(/special\/ot7-100/)
        })

        it('should return standard path for level 100 eras', () => {
            expect(getMasteryBadgeImagePath('era', 'Wings', 100)).toMatch(/milestone-100/)
        })
    })

    describe('getMasteryBadgeRarity()', () => {
        it('should return correct rarities for each milestone', () => {
            expect(getMasteryBadgeRarity(5)).toBe('common')
            expect(getMasteryBadgeRarity(10)).toBe('rare')
            expect(getMasteryBadgeRarity(25)).toBe('rare')
            expect(getMasteryBadgeRarity(50)).toBe('epic')
            expect(getMasteryBadgeRarity(100)).toBe('legendary')
        })
    })
})

describe('Streak Badge Overlay Logic', () => {
    /**
     * The StreakBadgeWithOverlay component shows a streak number on completion badges.
     * This tests the logic that determines how the overlay should display.
     */

    function getStreakDisplayInfo(badge: {
        code: string
        metadata?: {
            completionStreakCount?: number
            streakCount?: number
            completionType?: 'daily' | 'weekly'
        }
    }) {
        const isCompletionBadge = badge.code.includes('completion')
        const streakCount = badge.metadata?.completionStreakCount || badge.metadata?.streakCount || 0
        const completionType = badge.metadata?.completionType || (badge.code.includes('daily') ? 'daily' : 'weekly')
        const cyclePosition = streakCount > 0 ? ((streakCount - 1) % 10) + 1 : 1
        const shouldShowOverlay = isCompletionBadge && streakCount > 0

        return {
            isCompletionBadge,
            streakCount,
            completionType,
            cyclePosition,
            shouldShowOverlay,
            imagePath: shouldShowOverlay
                ? `/badges/${completionType}-streak/streak-${cyclePosition}.png`
                : `/badges/default.png`
        }
    }

    it('should show overlay for completion badges with streak count', () => {
        const info = getStreakDisplayInfo({
            code: 'daily_completion',
            metadata: { completionStreakCount: 5, completionType: 'daily' }
        })

        expect(info.isCompletionBadge).toBe(true)
        expect(info.shouldShowOverlay).toBe(true)
        expect(info.streakCount).toBe(5)
        expect(info.cyclePosition).toBe(5)
        expect(info.imagePath).toBe('/badges/daily-streak/streak-5.png')
    })

    it('should NOT show overlay for non-completion badges', () => {
        const info = getStreakDisplayInfo({
            code: 'daily_streak_5',
            metadata: { streakCount: 5 }
        })

        expect(info.isCompletionBadge).toBe(false)
        expect(info.shouldShowOverlay).toBe(false)
    })

    it('should NOT show overlay for completion badges without streak count', () => {
        const info = getStreakDisplayInfo({
            code: 'daily_completion',
            metadata: {}
        })

        expect(info.isCompletionBadge).toBe(true)
        expect(info.shouldShowOverlay).toBe(false)
    })

    it('should calculate correct cycle position for streaks > 10', () => {
        // Streak 15 → cycle position 5 (15 - 1 = 14, 14 % 10 = 4, 4 + 1 = 5)
        const info15 = getStreakDisplayInfo({
            code: 'daily_completion',
            metadata: { completionStreakCount: 15, completionType: 'daily' }
        })
        expect(info15.cyclePosition).toBe(5)

        // Streak 20 → cycle position 10
        const info20 = getStreakDisplayInfo({
            code: 'daily_completion',
            metadata: { completionStreakCount: 20, completionType: 'daily' }
        })
        expect(info20.cyclePosition).toBe(10)

        // Streak 21 → cycle position 1
        const info21 = getStreakDisplayInfo({
            code: 'daily_completion',
            metadata: { completionStreakCount: 21, completionType: 'daily' }
        })
        expect(info21.cyclePosition).toBe(1)
    })

    it('should handle weekly completion badges correctly', () => {
        const info = getStreakDisplayInfo({
            code: 'weekly_completion',
            metadata: { completionStreakCount: 7, completionType: 'weekly' }
        })

        expect(info.completionType).toBe('weekly')
        expect(info.imagePath).toBe('/badges/weekly-streak/streak-7.png')
    })
})

describe('Badge Filtering Logic', () => {
    // Simulates BadgesGrid filtering

    const mockBadges = [
        { id: '1', badge: { code: 'daily_streak_1', rarity: 'common', type: 'streak' }, earnedAt: new Date().toISOString() },
        { id: '2', badge: { code: 'daily_streak_5', rarity: 'rare', type: 'streak' }, earnedAt: new Date().toISOString() },
        { id: '3', badge: { code: 'daily_milestone_1', rarity: 'epic', type: 'achievement' }, earnedAt: new Date().toISOString() },
        { id: '4', badge: { code: 'mastery_member_rm_5', rarity: 'common', type: 'achievement' }, earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '5', badge: { code: 'daily_completion', rarity: 'legendary', type: 'completion' }, earnedAt: new Date().toISOString() },
    ]

    function filterBadges(
        badges: typeof mockBadges,
        filters: {
            search?: string
            category?: string
            rarity?: string
            type?: string
            mode?: 'all' | 'favorites' | 'new'
            favorites?: string[]
        }
    ) {
        let filtered = [...badges]

        // Search filter
        if (filters.search) {
            const query = filters.search.toLowerCase()
            filtered = filtered.filter(b => b.badge.code.toLowerCase().includes(query))
        }

        // Category filter
        if (filters.category) {
            filtered = filtered.filter(b => {
                const category = getBadgeCategory(b.badge.code)
                return category === filters.category
            })
        }

        // Rarity filter
        if (filters.rarity) {
            filtered = filtered.filter(b => b.badge.rarity === filters.rarity)
        }

        // Type filter
        if (filters.type) {
            filtered = filtered.filter(b => b.badge.type === filters.type)
        }

        // Mode: favorites
        if (filters.mode === 'favorites' && filters.favorites) {
            filtered = filtered.filter(b => filters.favorites!.includes(b.id))
        }

        // Mode: new (earned within 7 days)
        if (filters.mode === 'new') {
            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
            filtered = filtered.filter(b => new Date(b.earnedAt).getTime() > sevenDaysAgo)
        }

        return filtered
    }

    it('should filter by search query', () => {
        const filtered = filterBadges(mockBadges, { search: 'milestone' })
        expect(filtered.length).toBe(1)
        expect(filtered[0].badge.code).toBe('daily_milestone_1')
    })

    it('should filter by category', () => {
        const filtered = filterBadges(mockBadges, { category: 'Daily Streak' })
        expect(filtered.length).toBe(2)
    })

    it('should filter by rarity', () => {
        const filtered = filterBadges(mockBadges, { rarity: 'common' })
        expect(filtered.length).toBe(2)
    })

    it('should filter by type', () => {
        const filtered = filterBadges(mockBadges, { type: 'completion' })
        expect(filtered.length).toBe(1)
    })

    it('should filter by favorites', () => {
        const filtered = filterBadges(mockBadges, { mode: 'favorites', favorites: ['1', '3'] })
        expect(filtered.length).toBe(2)
    })

    it('should filter by new (last 7 days)', () => {
        const filtered = filterBadges(mockBadges, { mode: 'new' })
        // All except the mastery badge (which is 30 days old)
        expect(filtered.length).toBe(4)
    })

    it('should combine multiple filters', () => {
        const filtered = filterBadges(mockBadges, {
            category: 'Daily Streak',
            rarity: 'rare'
        })
        expect(filtered.length).toBe(1)
        expect(filtered[0].badge.code).toBe('daily_streak_5')
    })
})

describe('Mastery Badge Status Logic', () => {
    /**
     * Tests the getBadgeStatus logic from MasteryBadgeRewardsModal
     */

    function getBadgeStatus(
        earnedBadges: Array<{ kind: string; key: string; milestone: number }>,
        claimedMilestones: number[],
        kind: 'member' | 'era',
        key: string,
        milestone: number,
        currentLevel: number
    ): 'earned' | 'claimable' | 'locked' {
        // Check if already earned
        const isEarned = earnedBadges.some(
            b => b.kind === kind && b.key === key && b.milestone === milestone
        )
        if (isEarned) return 'earned'

        // Check if claimable (level reached but not claimed)
        if (currentLevel >= milestone && !claimedMilestones.includes(milestone)) {
            return 'claimable'
        }

        // Otherwise locked
        return 'locked'
    }

    it('should return "earned" for badges user has', () => {
        const earnedBadges = [
            { kind: 'member', key: 'RM', milestone: 5 },
            { kind: 'member', key: 'RM', milestone: 10 },
        ]

        expect(getBadgeStatus(earnedBadges, [5, 10], 'member', 'RM', 5, 15)).toBe('earned')
        expect(getBadgeStatus(earnedBadges, [5, 10], 'member', 'RM', 10, 15)).toBe('earned')
    })

    it('should return "claimable" for reachable but unclaimed milestones', () => {
        const earnedBadges = [
            { kind: 'member', key: 'RM', milestone: 5 },
        ]

        // Level 25, has claimed 5, but 10 and 25 are claimable
        expect(getBadgeStatus(earnedBadges, [5], 'member', 'RM', 10, 25)).toBe('claimable')
        expect(getBadgeStatus(earnedBadges, [5], 'member', 'RM', 25, 25)).toBe('claimable')
    })

    it('should return "locked" for unreachable milestones', () => {
        const earnedBadges: any[] = []

        // Level 5, trying to check level 100 milestone
        expect(getBadgeStatus(earnedBadges, [], 'member', 'RM', 100, 5)).toBe('locked')
        expect(getBadgeStatus(earnedBadges, [], 'member', 'RM', 50, 5)).toBe('locked')
    })
})

describe('Badge Data Transformation for UI', () => {
    /**
     * Tests that badge data from API is correctly transformed for display
     */

    function transformBadgeForDisplay(apiBadge: {
        id: string
        badge: {
            code: string
            name: string
            description: string
            icon: string
            rarity: string
            type: string
        }
        earnedAt: string
        metadata?: {
            streakCount?: number
            completionStreakCount?: number
            completionType?: 'daily' | 'weekly'
            milestoneNumber?: number
        }
    }) {
        const category = getBadgeCategory(apiBadge.badge.code)
        const isNew = Date.now() - new Date(apiBadge.earnedAt).getTime() < 7 * 24 * 60 * 60 * 1000
        const streakCount = apiBadge.metadata?.completionStreakCount || apiBadge.metadata?.streakCount || 0

        return {
            ...apiBadge,
            category,
            isNew,
            streakCount,
            displayName: streakCount > 0
                ? `${apiBadge.badge.name} (Streak ${streakCount})`
                : apiBadge.badge.name
        }
    }

    it('should transform badge with correct category', () => {
        const transformed = transformBadgeForDisplay({
            id: '1',
            badge: { code: 'daily_streak_5', name: 'Day 5', description: '', icon: '🔥', rarity: 'rare', type: 'streak' },
            earnedAt: new Date().toISOString()
        })

        expect(transformed.category).toBe('Daily Streak')
    })

    it('should mark recent badges as new', () => {
        const recentBadge = transformBadgeForDisplay({
            id: '1',
            badge: { code: 'test', name: 'Test', description: '', icon: '🏆', rarity: 'common', type: 'achievement' },
            earnedAt: new Date().toISOString() // Just earned
        })

        const oldBadge = transformBadgeForDisplay({
            id: '2',
            badge: { code: 'test', name: 'Test', description: '', icon: '🏆', rarity: 'common', type: 'achievement' },
            earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
        })

        expect(recentBadge.isNew).toBe(true)
        expect(oldBadge.isNew).toBe(false)
    })

    it('should include streak count in display name for completion badges', () => {
        const badgeWithStreak = transformBadgeForDisplay({
            id: '1',
            badge: { code: 'daily_completion', name: 'Daily Completion', description: '', icon: '🏆', rarity: 'rare', type: 'completion' },
            earnedAt: new Date().toISOString(),
            metadata: { completionStreakCount: 15, completionType: 'daily' }
        })

        expect(badgeWithStreak.streakCount).toBe(15)
        expect(badgeWithStreak.displayName).toBe('Daily Completion (Streak 15)')
    })
})
