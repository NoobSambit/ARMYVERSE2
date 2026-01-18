/**
 * Quest Streak Reward System Tests
 * 
 * Tests the streak tracking and badge awarding logic.
 * This file contains PURE UNIT TESTS for the business logic.
 * 
 * Covers:
 * - Daily/Weekly streak calculations
 * - Unique streak tracking (prevents reward farming)
 * - Completion badge awarding rules
 * - Cycle position calculations (1-10 cycling)
 * - Milestone badge awarding (10, 20, 30, 40, 50)
 */

// Helper functions extracted from business logic for testing
// These mirror the logic in completionBadges.ts and streakTracking.ts

/**
 * Calculate cycle position for streak badges (1-10, loops)
 */
function getCyclePosition(totalStreak: number): number {
    return ((totalStreak - 1) % 10) + 1
}

/**
 * Check if streak count is a milestone (10, 20, 30, 40, 50)
 */
function isMilestone(streak: number): boolean {
    return streak % 10 === 0 && streak <= 50
}

/**
 * Get milestone number (1-5) for a streak
 */
function getMilestoneNumber(streak: number): number | null {
    if (!isMilestone(streak)) return null
    return streak / 10
}

/**
 * Simulate daily key format
 */
function dailyKey(date: Date = new Date()): string {
    return date.toISOString().split('T')[0]
}

/**
 * Simulate weekly key format (ISO week)
 */
function weeklyKey(date: Date = new Date()): string {
    const d = new Date(date)
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
    return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`
}

/**
 * Check if a streak is new/unique (not previously rewarded)
 */
function isUniqueStreak(currentStreak: number, earnedStreaks: number[]): boolean {
    return !earnedStreaks.includes(currentStreak)
}

/**
 * Simulate streak update logic
 */
function calculateNewStreak(
    lastPlayKey: string | null,
    currentKey: string,
    previousKey: string,
    currentStreak: number
): { newStreak: number; streakBroken: boolean } {
    if (!lastPlayKey) {
        // First completion ever
        return { newStreak: 1, streakBroken: false }
    }

    if (lastPlayKey === currentKey) {
        // Already completed today/this week
        return { newStreak: currentStreak, streakBroken: false }
    }

    if (lastPlayKey === previousKey) {
        // Consecutive period - increment
        const newStreak = Math.min(currentStreak + 1, 50)
        return { newStreak, streakBroken: false }
    }

    // Streak broken - reset
    return { newStreak: 1, streakBroken: true }
}

describe('Streak Calculation Logic', () => {
    describe('getCyclePosition()', () => {
        it('should return 1-10 in a cycle', () => {
            expect(getCyclePosition(1)).toBe(1)
            expect(getCyclePosition(2)).toBe(2)
            expect(getCyclePosition(10)).toBe(10)
        })

        it('should loop back to 1 after 10', () => {
            expect(getCyclePosition(11)).toBe(1)
            expect(getCyclePosition(12)).toBe(2)
            expect(getCyclePosition(20)).toBe(10)
        })

        it('should continue cycling correctly', () => {
            expect(getCyclePosition(21)).toBe(1)
            expect(getCyclePosition(30)).toBe(10)
            expect(getCyclePosition(50)).toBe(10)
        })
    })

    describe('isMilestone()', () => {
        it('should identify milestones at 10, 20, 30, 40, 50', () => {
            expect(isMilestone(10)).toBe(true)
            expect(isMilestone(20)).toBe(true)
            expect(isMilestone(30)).toBe(true)
            expect(isMilestone(40)).toBe(true)
            expect(isMilestone(50)).toBe(true)
        })

        it('should NOT identify non-milestones', () => {
            expect(isMilestone(1)).toBe(false)
            expect(isMilestone(5)).toBe(false)
            expect(isMilestone(15)).toBe(false)
            expect(isMilestone(25)).toBe(false)
        })

        it('should NOT identify 60+ as milestones (max is 50)', () => {
            expect(isMilestone(60)).toBe(false)
            expect(isMilestone(70)).toBe(false)
            expect(isMilestone(100)).toBe(false)
        })
    })

    describe('getMilestoneNumber()', () => {
        it('should return milestone number 1-5', () => {
            expect(getMilestoneNumber(10)).toBe(1)
            expect(getMilestoneNumber(20)).toBe(2)
            expect(getMilestoneNumber(30)).toBe(3)
            expect(getMilestoneNumber(40)).toBe(4)
            expect(getMilestoneNumber(50)).toBe(5)
        })

        it('should return null for non-milestones', () => {
            expect(getMilestoneNumber(1)).toBe(null)
            expect(getMilestoneNumber(15)).toBe(null)
            expect(getMilestoneNumber(60)).toBe(null)
        })
    })

    describe('calculateNewStreak()', () => {
        it('should start at 1 for first completion', () => {
            const result = calculateNewStreak(null, '2026-01-16', '2026-01-15', 0)
            expect(result.newStreak).toBe(1)
            expect(result.streakBroken).toBe(false)
        })

        it('should increment streak on consecutive days', () => {
            const result = calculateNewStreak('2026-01-15', '2026-01-16', '2026-01-15', 5)
            expect(result.newStreak).toBe(6)
            expect(result.streakBroken).toBe(false)
        })

        it('should not change if already completed today', () => {
            const result = calculateNewStreak('2026-01-16', '2026-01-16', '2026-01-15', 5)
            expect(result.newStreak).toBe(5)
            expect(result.streakBroken).toBe(false)
        })

        it('should reset to 1 if streak broken', () => {
            const result = calculateNewStreak('2026-01-10', '2026-01-16', '2026-01-15', 5)
            expect(result.newStreak).toBe(1)
            expect(result.streakBroken).toBe(true)
        })

        it('should cap at 50', () => {
            const result = calculateNewStreak('2026-01-15', '2026-01-16', '2026-01-15', 50)
            expect(result.newStreak).toBe(50)
        })
    })
})

describe('Unique Streak Tracking (Prevents Reward Farming)', () => {
    describe('isUniqueStreak()', () => {
        it('should return true for never-earned streak', () => {
            expect(isUniqueStreak(1, [])).toBe(true)
            expect(isUniqueStreak(5, [])).toBe(true)
            expect(isUniqueStreak(10, [])).toBe(true)
        })

        it('should return false for previously earned streak', () => {
            const earned = [1, 2, 3, 4, 5]
            expect(isUniqueStreak(1, earned)).toBe(false)
            expect(isUniqueStreak(5, earned)).toBe(false)
        })

        it('should return true for higher streaks not yet earned', () => {
            const earned = [1, 2, 3, 4, 5]
            expect(isUniqueStreak(6, earned)).toBe(true)
            expect(isUniqueStreak(10, earned)).toBe(true)
        })

        it('should correctly track unique streaks after breaking and restarting', () => {
            // User earned streaks 1-5, then broke streak
            const earned = [1, 2, 3, 4, 5]

            // User restarts, reaches streak 1 again - NOT unique
            expect(isUniqueStreak(1, earned)).toBe(false)

            // User reaches streak 3 again - NOT unique
            expect(isUniqueStreak(3, earned)).toBe(false)

            // User reaches streak 5 again - NOT unique
            expect(isUniqueStreak(5, earned)).toBe(false)

            // User reaches streak 6 for first time - UNIQUE
            expect(isUniqueStreak(6, earned)).toBe(true)
        })
    })

    describe('Reward farming prevention scenarios', () => {
        it('Scenario 1: User gets to streak 10, breaks, restarts', () => {
            // First run: earned streaks 1-10
            const earnedAfterFirstRun = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

            // User breaks streak, restarts
            // Each day they complete quests, but:
            for (let streak = 1; streak <= 10; streak++) {
                // They should NOT get rewards again
                expect(isUniqueStreak(streak, earnedAfterFirstRun)).toBe(false)
            }

            // If they push to 11, that's unique
            expect(isUniqueStreak(11, earnedAfterFirstRun)).toBe(true)
        })

        it('Scenario 2: User reaches streak 25, breaks, wants to farm milestone at 10', () => {
            const earned = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]

            // User broke streak at 25
            // They try to farm the milestone at 10 again
            expect(isUniqueStreak(10, earned)).toBe(false) // No reward!
            expect(isUniqueStreak(20, earned)).toBe(false) // No reward!

            // They need to push to 26 or higher for rewards
            expect(isUniqueStreak(26, earned)).toBe(true)
        })

        it('Scenario 3: User at max streak 50, breaks, restarts', () => {
            // User has earned all streaks 1-50
            const earned = Array.from({ length: 50 }, (_, i) => i + 1)

            // No rewards for any streaks now
            for (let streak = 1; streak <= 50; streak++) {
                expect(isUniqueStreak(streak, earned)).toBe(false)
            }
        })
    })
})

describe('Completion Badge Award Logic', () => {
    // Simulates the logic from completionBadges.ts

    interface CompletionBadgeResult {
        shouldAwardBadge: boolean
        badgeCode: string | null
        streakCount: number
        isUniqueStreak: boolean
    }

    function simulateCompletionBadgeAward(
        currentStreak: number,
        earnedStreaks: number[],
        type: 'daily' | 'weekly'
    ): CompletionBadgeResult {
        const isUnique = isUniqueStreak(currentStreak, earnedStreaks)

        if (!isUnique) {
            return {
                shouldAwardBadge: false,
                badgeCode: null,
                streakCount: currentStreak,
                isUniqueStreak: false
            }
        }

        return {
            shouldAwardBadge: true,
            badgeCode: `${type}_completion`,
            streakCount: currentStreak,
            isUniqueStreak: true
        }
    }

    it('should award completion badge for unique streak', () => {
        const result = simulateCompletionBadgeAward(5, [1, 2, 3, 4], 'daily')
        expect(result.shouldAwardBadge).toBe(true)
        expect(result.badgeCode).toBe('daily_completion')
        expect(result.isUniqueStreak).toBe(true)
    })

    it('should NOT award completion badge for previously earned streak', () => {
        const result = simulateCompletionBadgeAward(5, [1, 2, 3, 4, 5], 'daily')
        expect(result.shouldAwardBadge).toBe(false)
        expect(result.badgeCode).toBe(null)
        expect(result.isUniqueStreak).toBe(false)
    })

    it('should work for weekly completions too', () => {
        const result = simulateCompletionBadgeAward(3, [1, 2], 'weekly')
        expect(result.shouldAwardBadge).toBe(true)
        expect(result.badgeCode).toBe('weekly_completion')
    })
})

describe('Badge Metadata & Display', () => {
    it('should generate correct badge metadata for streak badges', () => {
        const totalStreak = 15
        const cyclePosition = getCyclePosition(totalStreak)

        const metadata = {
            streakCount: totalStreak,
            cyclePosition
        }

        expect(metadata.streakCount).toBe(15)
        expect(metadata.cyclePosition).toBe(5) // 15 → cycle position 5
    })

    it('should generate correct badge metadata for milestones', () => {
        const totalStreak = 20
        const milestoneNumber = getMilestoneNumber(totalStreak)

        const metadata = {
            totalStreak,
            milestoneNumber
        }

        expect(metadata.totalStreak).toBe(20)
        expect(metadata.milestoneNumber).toBe(2)
    })

    it('should generate correct completion badge metadata', () => {
        const streakCount = 7
        const completionDate = dailyKey()

        const metadata = {
            completionDate,
            completionStreakCount: streakCount,
            completionType: 'daily' as const
        }

        expect(metadata.completionStreakCount).toBe(7)
        expect(metadata.completionType).toBe('daily')
        expect(metadata.completionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
})

describe('Date Key Generation', () => {
    it('should generate consistent daily keys', () => {
        const date = new Date('2026-01-16T10:30:00Z')
        expect(dailyKey(date)).toBe('2026-01-16')
    })

    it('should generate consistent weekly keys', () => {
        const date = new Date('2026-01-16T10:30:00Z')
        const key = weeklyKey(date)
        expect(key).toMatch(/^\d{4}-W\d{2}$/)
    })
})

describe('End-to-End Streak Scenarios', () => {
    /**
     * Simulates a complete user journey through the streak system
     */
    function simulateUserJourney(
        completionDates: string[],
        type: 'daily' | 'weekly'
    ): {
        finalStreak: number
        earnedStreaks: number[]
        badgesAwarded: number
        milestonesReached: number[]
    } {
        let currentStreak = 0
        let lastPlayKey: string | null = null
        const earnedStreaks: number[] = []
        let badgesAwarded = 0
        const milestonesReached: number[] = []

        for (let i = 0; i < completionDates.length; i++) {
            const currentKey = completionDates[i]
            const previousDayKey = completionDates[i - 1] || null

            // Calculate if this is consecutive
            const { newStreak, streakBroken } = calculateNewStreak(
                lastPlayKey,
                currentKey,
                type === 'daily' ? getPreviousDay(currentKey) : getPreviousWeek(currentKey),
                currentStreak
            )

            currentStreak = newStreak

            // Check if unique
            if (isUniqueStreak(currentStreak, earnedStreaks)) {
                earnedStreaks.push(currentStreak)
                badgesAwarded++

                if (isMilestone(currentStreak)) {
                    milestonesReached.push(currentStreak)
                }
            }

            lastPlayKey = currentKey
        }

        return {
            finalStreak: currentStreak,
            earnedStreaks,
            badgesAwarded,
            milestonesReached
        }
    }

    function getPreviousDay(dateStr: string): string {
        const date = new Date(dateStr)
        date.setDate(date.getDate() - 1)
        return dailyKey(date)
    }

    function getPreviousWeek(weekStr: string): string {
        // Simple mock - in reality this would be more complex
        const match = weekStr.match(/(\d{4})-W(\d{2})/)
        if (!match) return ''
        const year = parseInt(match[1])
        const week = parseInt(match[2])
        if (week === 1) {
            return `${year - 1}-W52`
        }
        return `${year}-W${(week - 1).toString().padStart(2, '0')}`
    }

    it('Perfect 30-day streak run', () => {
        const dates: string[] = []
        for (let i = 0; i < 30; i++) {
            const date = new Date('2026-01-01')
            date.setDate(date.getDate() + i)
            dates.push(dailyKey(date))
        }

        const result = simulateUserJourney(dates, 'daily')

        expect(result.finalStreak).toBe(30)
        expect(result.earnedStreaks.length).toBe(30)
        expect(result.badgesAwarded).toBe(30)
        expect(result.milestonesReached).toEqual([10, 20, 30])
    })

    it('Streak breaks and restarts should not re-award', () => {
        // First 5 days
        const phase1 = ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05']

        // Gap of 3 days (breaks streak)
        // Then 5 more days
        const phase2 = ['2026-01-09', '2026-01-10', '2026-01-11', '2026-01-12', '2026-01-13']

        const allDates = [...phase1, ...phase2]
        const result = simulateUserJourney(allDates, 'daily')

        // Should only have 5 unique streaks (1-5), not 10
        // Because second phase restarts at 1 but 1-5 already earned
        expect(result.earnedStreaks).toEqual([1, 2, 3, 4, 5])
        expect(result.badgesAwarded).toBe(5)
        expect(result.finalStreak).toBe(5)
    })

    it('Reaching max streak 50', () => {
        const dates: string[] = []
        for (let i = 0; i < 50; i++) {
            const date = new Date('2026-01-01')
            date.setDate(date.getDate() + i)
            dates.push(dailyKey(date))
        }

        const result = simulateUserJourney(dates, 'daily')

        expect(result.finalStreak).toBe(50)
        expect(result.earnedStreaks.length).toBe(50)
        expect(result.milestonesReached).toEqual([10, 20, 30, 40, 50])
    })
})
