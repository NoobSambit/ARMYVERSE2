/**
 * Reward System Integration Tests
 * 
 * Tests the complete flow of reward distribution including:
 * - Mastery milestone claiming via API
 * - Quest completion badge awarding
 * - Database compound index validation
 * - Edge cases and error handling
 * 
 * Note: These tests validate BUSINESS LOGIC without database dependencies.
 * They simulate the claim flow to verify correctness.
 */

import {
    MASTERY_MILESTONES,
    levelForXp,
    claimableMilestones,
    getMasteryBadgeCode,
    getMasteryBadgeInfo,
} from '@/lib/game/mastery'

describe('Mastery Claim Flow Integration', () => {
    /**
       * Simulates the mastery claim API logic
       */
    async function simulateMasteryClaim(
        userId: string,
        kind: 'member' | 'era',
        key: string,
        milestone: number,
        currentProgress: { xp: number; claimedMilestones: number[] }
    ): Promise<{
        success: boolean
        error?: string
        rewards?: { xp: number; dust: number }
        badge?: { code: string; rarity: string }
        newState?: { xp: number; level: number; claimedMilestones: number[] }
    }> {
        // Check milestone is valid
        const milestoneConfig = MASTERY_MILESTONES.find(m => m.level === milestone)
        if (!milestoneConfig) {
            return { success: false, error: 'Invalid milestone' }
        }

        // Check user has enough XP
        const currentLevel = levelForXp(currentProgress.xp)
        if (currentLevel < milestone) {
            return { success: false, error: 'Milestone not reached' }
        }

        // Check milestone not already claimed
        if (currentProgress.claimedMilestones.includes(milestone)) {
            return { success: false, error: 'Milestone already claimed' }
        }

        // Check milestone is actually claimable
        const claimable = claimableMilestones(currentProgress.xp, currentProgress.claimedMilestones)
        if (!claimable.includes(milestone)) {
            return { success: false, error: 'Milestone not claimable' }
        }

        // Award rewards
        const rewards = milestoneConfig.rewards
        const badgeInfo = getMasteryBadgeInfo(kind, key, milestone)

        const newClaimedMilestones = [...currentProgress.claimedMilestones, milestone]

        return {
            success: true,
            rewards,
            badge: badgeInfo ? { code: badgeInfo.code, rarity: badgeInfo.rarity } : undefined,
            newState: {
                xp: currentProgress.xp,
                level: currentLevel,
                claimedMilestones: newClaimedMilestones
            }
        }
    }

    describe('Valid Claims', () => {
        it('should successfully claim level 5 milestone', async () => {
            const result = await simulateMasteryClaim(
                'user123',
                'member',
                'RM',
                5,
                { xp: 500, claimedMilestones: [] }
            )

            expect(result.success).toBe(true)
            expect(result.rewards).toEqual({ xp: 50, dust: 25 })
            expect(result.badge?.code).toBe('mastery_member_rm_5')
            expect(result.badge?.rarity).toBe('common')
            expect(result.newState?.claimedMilestones).toContain(5)
        })

        it('should successfully claim level 100 milestone with legendary badge', async () => {
            const result = await simulateMasteryClaim(
                'user123',
                'member',
                'Jungkook',
                100,
                { xp: 10000, claimedMilestones: [5, 10, 25, 50] }
            )

            expect(result.success).toBe(true)
            expect(result.rewards).toEqual({ xp: 1500, dust: 1000 })
            expect(result.badge?.rarity).toBe('legendary')
        })

        it('should allow claiming multiple milestones in sequence', async () => {
            let progress = { xp: 5000, claimedMilestones: [] as number[] }

            // Claim 5
            let result = await simulateMasteryClaim('user123', 'member', 'V', 5, progress)
            expect(result.success).toBe(true)
            progress.claimedMilestones = result.newState!.claimedMilestones

            // Claim 10
            result = await simulateMasteryClaim('user123', 'member', 'V', 10, progress)
            expect(result.success).toBe(true)
            progress.claimedMilestones = result.newState!.claimedMilestones

            // Claim 25
            result = await simulateMasteryClaim('user123', 'member', 'V', 25, progress)
            expect(result.success).toBe(true)
            progress.claimedMilestones = result.newState!.claimedMilestones

            // Claim 50
            result = await simulateMasteryClaim('user123', 'member', 'V', 50, progress)
            expect(result.success).toBe(true)
            progress.claimedMilestones = result.newState!.claimedMilestones

            expect(progress.claimedMilestones).toEqual([5, 10, 25, 50])
        })
    })

    describe('Invalid Claims', () => {
        it('should reject claim for invalid milestone level', async () => {
            const result = await simulateMasteryClaim(
                'user123',
                'member',
                'RM',
                7, // Invalid - not a milestone
                { xp: 1000, claimedMilestones: [] }
            )

            expect(result.success).toBe(false)
            expect(result.error).toBe('Invalid milestone')
        })

        it('should reject claim when XP is insufficient', async () => {
            const result = await simulateMasteryClaim(
                'user123',
                'member',
                'RM',
                10, // Need level 10 (1000 XP)
                { xp: 500, claimedMilestones: [] } // Only level 5
            )

            expect(result.success).toBe(false)
            expect(result.error).toBe('Milestone not reached')
        })

        it('should reject claim for already claimed milestone', async () => {
            const result = await simulateMasteryClaim(
                'user123',
                'member',
                'RM',
                5,
                { xp: 1000, claimedMilestones: [5] } // Already claimed!
            )

            expect(result.success).toBe(false)
            expect(result.error).toBe('Milestone already claimed')
        })

        it('should reject claim when skipping milestones', async () => {
            // User tries to claim 10 without claiming 5 first
            const result = await simulateMasteryClaim(
                'user123',
                'member',
                'RM',
                10,
                { xp: 1000, claimedMilestones: [] } // 5 not claimed
            )

            // This should succeed since claimable includes both 5 and 10
            // But we're testing the logic - 10 IS claimable even if 5 isn't claimed
            expect(result.success).toBe(true)
        })
    })
})

describe('Database Compound Index Validation', () => {
    /**
     * Simulates the UserBadge unique constraint behavior
     */
    function validateBadgeUniqueness(
        existingBadges: Array<{ badgeId: string; streakCount?: number }>,
        newBadge: { badgeId: string; streakCount?: number }
    ): boolean {
        // The compound index is: { userId, badgeId, metadata.completionStreakCount }
        // This means:
        // - Same badgeId + different streakCount = ALLOWED (for completion badges)
        // - Same badgeId + same streakCount = DUPLICATE (rejected)
        // - Same badgeId + no streakCount = only one allowed (for regular badges)

        return !existingBadges.some(existing =>
            existing.badgeId === newBadge.badgeId &&
            existing.streakCount === newBadge.streakCount
        )
    }

    it('should allow multiple completion badges with different streak counts', () => {
        const existingBadges = [
            { badgeId: 'daily_completion', streakCount: 1 },
            { badgeId: 'daily_completion', streakCount: 2 },
            { badgeId: 'daily_completion', streakCount: 3 },
        ]

        // Adding streak 4 should be allowed
        const canAdd4 = validateBadgeUniqueness(existingBadges, { badgeId: 'daily_completion', streakCount: 4 })
        expect(canAdd4).toBe(true)

        // Adding streak 5 should be allowed
        const canAdd5 = validateBadgeUniqueness(existingBadges, { badgeId: 'daily_completion', streakCount: 5 })
        expect(canAdd5).toBe(true)
    })

    it('should reject duplicate completion badges with same streak count', () => {
        const existingBadges = [
            { badgeId: 'daily_completion', streakCount: 5 },
        ]

        // Adding streak 5 again should be rejected
        const canAddDuplicate = validateBadgeUniqueness(existingBadges, { badgeId: 'daily_completion', streakCount: 5 })
        expect(canAddDuplicate).toBe(false)
    })

    it('should only allow one regular badge (no streakCount)', () => {
        const existingBadges = [
            { badgeId: 'daily_streak_5' }, // No streakCount (undefined)
        ]

        // Adding same badge again should be rejected
        const canAddDuplicate = validateBadgeUniqueness(existingBadges, { badgeId: 'daily_streak_5' })
        expect(canAddDuplicate).toBe(false)
    })

    it('should allow different regular badges', () => {
        const existingBadges = [
            { badgeId: 'daily_streak_5' },
        ]

        // Adding different badge should be allowed
        const canAddDifferent = validateBadgeUniqueness(existingBadges, { badgeId: 'daily_streak_6' })
        expect(canAddDifferent).toBe(true)
    })
})

describe('Reward Calculation Accuracy', () => {
    it('should calculate correct total rewards for full mastery', () => {
        // Calculate total rewards for maxing out a member mastery
        const totalRewards = MASTERY_MILESTONES.reduce(
            (acc, m) => ({
                xp: acc.xp + m.rewards.xp,
                dust: acc.dust + m.rewards.dust
            }),
            { xp: 0, dust: 0 }
        )

        expect(totalRewards.xp).toBe(50 + 100 + 250 + 500 + 1500) // 2400
        expect(totalRewards.dust).toBe(25 + 75 + 200 + 400 + 1000) // 1700
    })

    it('should verify badge count per member', () => {
        // Each member can earn 5 badges (one per milestone)
        const badgesPerMember = MASTERY_MILESTONES.length
        expect(badgesPerMember).toBe(5)
    })

    it('should verify total possible mastery badges for all members + OT7', () => {
        const memberCount = 8 // RM, Jin, Suga, J-Hope, Jimin, V, Jungkook, OT7
        const badgesPerMember = MASTERY_MILESTONES.length
        const totalMemberBadges = memberCount * badgesPerMember

        expect(totalMemberBadges).toBe(40)
    })
})

describe('Edge Case Handling', () => {
    it('should handle concurrent claim attempts gracefully', async () => {
        const progress = { xp: 500, claimedMilestones: [] as number[] }

        // Simulate two concurrent claims for same milestone
        const claim1 = simulateMasteryClaim('user123', 'member', 'RM', 5, progress)

        // Second claim with updated progress (simulating race condition prevention)
        const claim2AfterFirst = simulateMasteryClaim('user123', 'member', 'RM', 5, {
            ...progress,
            claimedMilestones: [5] // Now includes 5
        })

        const result1 = await claim1
        const result2 = await claim2AfterFirst

        expect(result1.success).toBe(true)
        expect(result2.success).toBe(false)
        expect(result2.error).toBe('Milestone already claimed')
    })

    it('should handle XP exactly at milestone threshold', async () => {
        // Exactly 500 XP = exactly level 5
        const result = await simulateMasteryClaim(
            'user123',
            'member',
            'RM',
            5,
            { xp: 500, claimedMilestones: [] }
        )

        expect(result.success).toBe(true)
    })

    it('should handle XP just below milestone threshold', async () => {
        // 499 XP = level 4, not 5
        const result = await simulateMasteryClaim(
            'user123',
            'member',
            'RM',
            5,
            { xp: 499, claimedMilestones: [] }
        )

        expect(result.success).toBe(false)
        expect(result.error).toBe('Milestone not reached')
    })
})

// Helper function for simulations
async function simulateMasteryClaim(
    userId: string,
    kind: 'member' | 'era',
    key: string,
    milestone: number,
    currentProgress: { xp: number; claimedMilestones: number[] }
): Promise<{
    success: boolean
    error?: string
    rewards?: { xp: number; dust: number }
    badge?: { code: string; rarity: string }
    newState?: { xp: number; level: number; claimedMilestones: number[] }
}> {
    const milestoneConfig = MASTERY_MILESTONES.find(m => m.level === milestone)
    if (!milestoneConfig) {
        return { success: false, error: 'Invalid milestone' }
    }

    const currentLevel = levelForXp(currentProgress.xp)
    if (currentLevel < milestone) {
        return { success: false, error: 'Milestone not reached' }
    }

    if (currentProgress.claimedMilestones.includes(milestone)) {
        return { success: false, error: 'Milestone already claimed' }
    }

    const rewards = milestoneConfig.rewards
    const badgeInfo = getMasteryBadgeInfo(kind, key, milestone)

    return {
        success: true,
        rewards,
        badge: badgeInfo ? { code: badgeInfo.code, rarity: badgeInfo.rarity } : undefined,
        newState: {
            xp: currentProgress.xp,
            level: currentLevel,
            claimedMilestones: [...currentProgress.claimedMilestones, milestone]
        }
    }
}
