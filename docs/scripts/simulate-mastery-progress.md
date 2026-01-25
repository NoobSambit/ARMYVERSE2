# Simulate Mastery Progress Script

This script simulates mastery XP gains, per-level photocard rewards, and milestone badge claims for a user.

**Script:** `scripts/simulate-mastery-progress.ts`

## Usage

```bash
npx tsx scripts/simulate-mastery-progress.ts --user <uid|email|username> --kind member --key "J-Hope" --target-level 10 --claim
npx tsx scripts/simulate-mastery-progress.ts --user <uid|email|username> --kind era --key "Wings" --target-level 25 --claim
```

### Options

- `--user, -u`: Username, email, or user ID (required)
- `--id-type`: `auto` | `db` | `firebase` (default: `auto`)
- `--kind`: `member` | `era` (required)
- `--key`: Mastery key (required)
- `--target-level`: Target mastery level to reach (required)
- `--claim`: Claim all available milestones after XP update
- `--reset`: Reset mastery progress + ledgers for this track
- `--dry-run`: Print actions without writing

## Notes

- Every mastery level-up awards a random photocard (inventory source: `mastery_level`).
- Member level 100 claims award both the milestone-100 badge and the special member badge.
- `--reset` only clears mastery progress + ledgers for the selected track; it does **not** remove inventory items.
