# ARMYVERSE Game Phase 1 Log

- Initial setup: auth and Cloudinary helpers added in `lib/auth/verify.ts` and `lib/cloudinary.ts`.
- Models created: `Question`, `QuizSession` (TTL), `Photocard`, `InventoryItem`, `UserGameState`.
- Utilities added: `lib/game/selectQuestions.ts`, `lib/game/scoring.ts`, `lib/game/dropTable.ts` with pity logic.
- API routes:
  - `POST /api/game/quiz/start` — starts a session, returns questions and `sessionId`.
  - `POST /api/game/quiz/complete` — validates, scores, rolls rarity, grants card.
  - `GET /api/game/inventory` — paginated inventory list with Cloudinary URLs.
  - `GET /api/game/pools` — returns active BE Era pool; dev seeding if empty.
- Notes: No secrets exposed; all routes require Firebase token. TTL on sessions is 20 minutes.

## Phase 2 Additions

- Economy: duplicates yield dust; crafting endpoint to spend dust on specific cards or ticket rolls.
- Mastery: per-member/era XP, milestone claim endpoint grants themed pulls.
- Quests: daily/weekly definitions with progress and claim endpoint (dust/ticket).
- Pools: seasonal `DropPool` with weights and optional featured boosts; pools API returns active window.
- Scoring: XP awards on completes; weekly leaderboard endpoint (best daily run sum simplified to best run).
- Anti-cheat basics: daily ranked start limit; practice mode allowed beyond limit.
- Share: share endpoint returns Cloudinary URL with text overlay.
