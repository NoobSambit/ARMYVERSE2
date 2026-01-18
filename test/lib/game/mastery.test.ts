/**
 * Mastery System Unit Tests
 * 
 * Tests all mastery reward logic without database dependencies.
 * Covers:
 * - Level calculations
 * - XP progression
 * - Milestone claiming
 * - Badge code generation
 * - OT7 divider logic
 */

import {
    MASTERY_MILESTONES,
    levelForXp,
    xpToNextLevel,
    claimableMilestones,
    nextMilestone,
    formatTrack,
    getMasteryBadgeCode,
    getMasteryBadgeInfo,
    dividerFor,
} from '@/lib/game/mastery'

describe('Mastery System', () => {
    describe('MASTERY_MILESTONES configuration', () => {
        it('should have milestones at levels 5, 10, 25, 50, 100', () => {
            const levels = MASTERY_MILESTONES.map(m => m.level)
            expect(levels).toEqual([5, 10, 25, 50, 100])
        })

        it('should have correct rarities for each milestone', () => {
            const raritiesMap = MASTERY_MILESTONES.reduce((acc, m) => {
                acc[m.level] = m.badge.rarity
                return acc
            }, {} as Record<number, string>)

            expect(raritiesMap[5]).toBe('common')
            expect(raritiesMap[10]).toBe('rare')
            expect(raritiesMap[25]).toBe('rare')
            expect(raritiesMap[50]).toBe('epic')
            expect(raritiesMap[100]).toBe('legendary')
        })

        it('should have increasing rewards for higher milestones', () => {
            for (let i = 1; i < MASTERY_MILESTONES.length; i++) {
                const prev = MASTERY_MILESTONES[i - 1]
                const curr = MASTERY_MILESTONES[i]
                expect(curr.rewards.xp).toBeGreaterThan(prev.rewards.xp)
                expect(curr.rewards.dust).toBeGreaterThan(prev.rewards.dust)
            }
        })

        it('should only have special badge at level 100 for members', () => {
            MASTERY_MILESTONES.forEach(m => {
                if (m.level === 100) {
                    expect(m.badge.isSpecialAtMax).toBe(true)
                } else {
                    expect(m.badge.isSpecialAtMax).toBe(false)
                }
            })
        })
    })

    describe('dividerFor()', () => {
        it('should return 7 for OT7', () => {
            expect(dividerFor('member', 'OT7')).toBe(7)
            expect(dividerFor('member', 'ot7')).toBe(7)
            expect(dividerFor('member', 'Ot7')).toBe(7)
        })

        it('should return 1 for regular members', () => {
            expect(dividerFor('member', 'RM')).toBe(1)
            expect(dividerFor('member', 'Jungkook')).toBe(1)
            expect(dividerFor('member', 'V')).toBe(1)
        })

        it('should return 1 for eras', () => {
            expect(dividerFor('era', 'Wings')).toBe(1)
            expect(dividerFor('era', 'BE')).toBe(1)
        })
    })

    describe('levelForXp()', () => {
        it('should calculate level correctly (100 XP per level)', () => {
            expect(levelForXp(0)).toBe(0)
            expect(levelForXp(99)).toBe(0)
            expect(levelForXp(100)).toBe(1)
            expect(levelForXp(199)).toBe(1)
            expect(levelForXp(500)).toBe(5)
            expect(levelForXp(1000)).toBe(10)
            expect(levelForXp(10000)).toBe(100)
        })

        it('should handle OT7 divider (700 XP per level)', () => {
            expect(levelForXp(0, 7)).toBe(0)
            expect(levelForXp(699, 7)).toBe(0)
            expect(levelForXp(700, 7)).toBe(1)
            expect(levelForXp(3500, 7)).toBe(5)
            expect(levelForXp(7000, 7)).toBe(10)
            expect(levelForXp(70000, 7)).toBe(100)
        })
    })

    describe('xpToNextLevel()', () => {
        it('should calculate XP needed for next level', () => {
            expect(xpToNextLevel(0)).toBe(100)
            expect(xpToNextLevel(50)).toBe(50)
            expect(xpToNextLevel(100)).toBe(100)
            expect(xpToNextLevel(150)).toBe(50)
        })

        it('should handle OT7 divider', () => {
            expect(xpToNextLevel(0, 7)).toBe(700)
            expect(xpToNextLevel(350, 7)).toBe(350)
            expect(xpToNextLevel(700, 7)).toBe(700)
        })
    })

    describe('claimableMilestones()', () => {
        it('should return empty array when below first milestone', () => {
            expect(claimableMilestones(0, [])).toEqual([])
            expect(claimableMilestones(400, [])).toEqual([])
        })

        it('should return level 5 milestone when at level 5', () => {
            expect(claimableMilestones(500, [])).toEqual([5])
        })

        it('should return multiple milestones when crossing many thresholds', () => {
            expect(claimableMilestones(1000, [])).toEqual([5, 10])
            expect(claimableMilestones(2500, [])).toEqual([5, 10, 25])
            expect(claimableMilestones(5000, [])).toEqual([5, 10, 25, 50])
            expect(claimableMilestones(10000, [])).toEqual([5, 10, 25, 50, 100])
        })

        it('should exclude already claimed milestones', () => {
            expect(claimableMilestones(2500, [5])).toEqual([10, 25])
            expect(claimableMilestones(10000, [5, 10, 25])).toEqual([50, 100])
        })

        it('should exclude legacy level from claimable', () => {
            // If user had legacy level 10, they shouldn't be able to claim 10 again
            expect(claimableMilestones(2500, [], 10)).toEqual([5, 25])
        })

        it('should handle OT7 divider correctly', () => {
            // 3500 XP with divider 7 = level 5
            expect(claimableMilestones(3500, [], 0, 7)).toEqual([5])
            // 70000 XP with divider 7 = level 100
            expect(claimableMilestones(70000, [], 0, 7)).toEqual([5, 10, 25, 50, 100])
        })
    })

    describe('nextMilestone()', () => {
        it('should return 5 when below level 5', () => {
            expect(nextMilestone(0)).toBe(5)
            expect(nextMilestone(400)).toBe(5)
        })

        it('should return next milestone correctly', () => {
            expect(nextMilestone(500)).toBe(10)  // At level 5
            expect(nextMilestone(1000)).toBe(25) // At level 10
            expect(nextMilestone(2500)).toBe(50) // At level 25
            expect(nextMilestone(5000)).toBe(100) // At level 50
        })

        it('should return null when at max level', () => {
            expect(nextMilestone(10000)).toBe(null) // At level 100
            expect(nextMilestone(15000)).toBe(null) // Above level 100
        })
    })

    describe('formatTrack()', () => {
        it('should format a new track correctly', () => {
            const track = formatTrack('member', 'RM', 0, [])

            expect(track.kind).toBe('member')
            expect(track.key).toBe('RM')
            expect(track.xp).toBe(0)
            expect(track.level).toBe(0)
            expect(track.claimedMilestones).toEqual([])
            expect(track.xpToNext).toBe(100)
            expect(track.nextMilestone).toBe(5)
            expect(track.claimable).toEqual([])
        })

        it('should format a track with progress', () => {
            const track = formatTrack('member', 'Jimin', 2500, [5, 10])

            expect(track.level).toBe(25)
            expect(track.claimedMilestones).toEqual([5, 10])
            expect(track.claimable).toEqual([25])
            expect(track.nextMilestone).toBe(50)
        })

        it('should apply OT7 divider automatically', () => {
            const track = formatTrack('member', 'OT7', 3500, [])

            expect(track.level).toBe(5) // 3500 / 700 = 5
            expect(track.xpToNext).toBe(700)
            expect(track.claimable).toEqual([5])
        })

        it('should format era track correctly', () => {
            const track = formatTrack('era', 'Wings', 1000, [5])

            expect(track.kind).toBe('era')
            expect(track.level).toBe(10)
            expect(track.claimable).toEqual([10])
        })
    })

    describe('getMasteryBadgeCode()', () => {
        it('should generate correct badge codes for members', () => {
            expect(getMasteryBadgeCode('member', 'RM', 5)).toBe('mastery_member_rm_5')
            expect(getMasteryBadgeCode('member', 'Jungkook', 100)).toBe('mastery_member_jungkook_100')
            expect(getMasteryBadgeCode('member', 'J-Hope', 25)).toBe('mastery_member_j_hope_25')
            expect(getMasteryBadgeCode('member', 'OT7', 50)).toBe('mastery_member_ot7_50')
        })

        it('should generate correct badge codes for eras', () => {
            expect(getMasteryBadgeCode('era', 'Wings', 10)).toBe('mastery_era_wings_10')
            expect(getMasteryBadgeCode('era', 'Love Yourself: Her', 25)).toBe('mastery_era_love_yourself_her_25')
            expect(getMasteryBadgeCode('era', 'O!RUL8,2?', 5)).toBe('mastery_era_o_rul8_2_5')
        })

        it('should normalize special characters correctly', () => {
            expect(getMasteryBadgeCode('era', '2 Cool 4 Skool', 5)).toBe('mastery_era_2_cool_4_skool_5')
            expect(getMasteryBadgeCode('era', 'Map of the Soul: 7', 10)).toBe('mastery_era_map_of_the_soul_7_10')
        })
    })

    describe('getMasteryBadgeInfo()', () => {
        it('should return null for invalid milestone', () => {
            expect(getMasteryBadgeInfo('member', 'RM', 7)).toBe(null)
            expect(getMasteryBadgeInfo('member', 'RM', 15)).toBe(null)
        })

        it('should return correct badge info for valid milestone', () => {
            const info = getMasteryBadgeInfo('member', 'RM', 5)

            expect(info).not.toBe(null)
            expect(info!.code).toBe('mastery_member_rm_5')
            expect(info!.rarity).toBe('common')
            expect(info!.isSpecial).toBe(false)
            expect(info!.milestone).toBe(5)
        })

        it('should mark level 100 member badges as special', () => {
            const memberInfo = getMasteryBadgeInfo('member', 'Jungkook', 100)
            expect(memberInfo!.isSpecial).toBe(true)
            expect(memberInfo!.rarity).toBe('legendary')
        })

        it('should NOT mark level 100 era badges as special', () => {
            const eraInfo = getMasteryBadgeInfo('era', 'Wings', 100)
            expect(eraInfo!.isSpecial).toBe(false)
            expect(eraInfo!.rarity).toBe('legendary')
        })
    })
})

describe('Mastery Edge Cases', () => {
    it('should handle exact milestone XP thresholds', () => {
        // Exactly at level 5 threshold
        expect(levelForXp(500)).toBe(5)
        expect(claimableMilestones(500, [])).toEqual([5])

        // One XP below level 5
        expect(levelForXp(499)).toBe(4)
        expect(claimableMilestones(499, [])).toEqual([])
    })

    it('should handle maximum level correctly', () => {
        // At level 100
        const track = formatTrack('member', 'RM', 10000, [5, 10, 25, 50])
        expect(track.level).toBe(100)
        expect(track.claimable).toEqual([100])
        expect(track.nextMilestone).toBe(null)

        // Above level 100
        const track2 = formatTrack('member', 'RM', 15000, [5, 10, 25, 50, 100])
        expect(track2.level).toBe(150)
        expect(track2.claimable).toEqual([])
        expect(track2.nextMilestone).toBe(null)
    })

    it('should handle all milestones claimed', () => {
        const allClaimed = [5, 10, 25, 50, 100]
        expect(claimableMilestones(10000, allClaimed)).toEqual([])
    })

    it('should handle out-of-order claimed milestones', () => {
        // User somehow has 25 claimed but not 10
        expect(claimableMilestones(2500, [5, 25])).toEqual([10])
    })
})
