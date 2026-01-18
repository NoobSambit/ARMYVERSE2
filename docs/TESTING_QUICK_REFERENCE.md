# 🎯 Testing Quick Reference

## Commands

```bash
npm run test:rewards   # Run reward tests (~5 seconds)
npm run test          # Run ALL tests
npm run test:watch    # Auto-run on file changes
```

## What "All Tests Pass" Means

```
Test Suites: 4 passed, 4 total
Tests:       115 passed, 115 total  ← This means EVERYTHING works!
```

## Visual Explanation of How Tests Work

### Without Tests (Manual Testing) 😰

```
You: *plays for 10 days*
You: "Did I get the right badge?"
You: *breaks streak*
You: *plays 5 more days*
You: "Did I get rewarded again? I shouldn't have..."
You: *repeats for 50 scenarios*
You: "This will take MONTHS!"
```

### With Tests (Automated Testing) 😎

```javascript
// This code checks that scenario IN 0.01 SECONDS:

it('should not re-reward after streak breaks', () => {
    const alreadyEarned = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    // User broke streak, now at streak 5 again
    const shouldGetReward = isUniqueStreak(5, alreadyEarned);
    
    expect(shouldGetReward).toBe(false);  // ← CORRECT! No reward
});
```

## The 115 Tests Cover:

### Mastery System (32 tests)
```
✅ XP → Level calculation correct
✅ Milestones at levels 5, 10, 25, 50, 100
✅ OT7 requires 7x XP
✅ Badge codes generated correctly
✅ Correct rewards (XP and dust amounts)
✅ Level 100 = legendary badge
✅ Can't claim same milestone twice
```

### Quest Streaks (34 tests)
```
✅ Streak increments correctly
✅ Streak resets when you miss a day
✅ Cycle position cycles 1→10, 1→10...
✅ Milestones at 10, 20, 30, 40, 50
✅ NO REWARD FARMING (unique streak tracking)
✅ Completion badges work
```

### Integration (17 tests)
```
✅ Valid claims work
✅ Invalid claims rejected
✅ Edge cases handled
✅ Math is correct
```

### Component Display (32 tests)
```
✅ Badge images load from correct paths
✅ Rarity colors display correctly
✅ Badge categories shown properly
✅ Streak overlay numbers display
✅ Filtering (search, category, rarity) works
✅ New badge indicators work (7-day)
✅ Mastery modal status (earned/claimable/locked)
```

## How to Read a Test

```javascript
it('should return level 5 for 500 XP', () => {
//     ↑ English description of what we're testing
    
    const result = levelForXp(500);
//         ↑ Call the function with test input
    
    expect(result).toBe(5);
//     ↑ We EXPECT the result to BE 5
});
```

**If this test passes:** `levelForXp(500)` returns `5` ✅
**If this test fails:** Something is broken! ❌

## What Happens When a Test Fails

```
FAIL test/lib/game/mastery.test.ts

  ● Mastery System › levelForXp() › should return level 5 for 500 XP

    Expected: 5
    Received: 4   ← WRONG!
    
       at line 13
```

This tells you:
1. **Which test failed**: "should return level 5 for 500 XP"
2. **What was expected**: 5
3. **What actually happened**: 4
4. **Where to look**: line 13

## TL;DR

| Action | Command | Time |
|--------|---------|------|
| Check if rewards work | `npm run test:rewards` | ~5 seconds |
| What to look for | "83 passed, 83 total" | ✅ All good! |
| If tests fail | Check the error message | Shows exact problem |

**If all 83 tests pass = Your reward system is 100% correct!** 🎉
