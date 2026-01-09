# Seed Inventory Sample Data

This script seeds a large, mixed inventory dataset for UI testing. It clears a user's inventory, optionally drops the legacy `photocards` collection, and inserts randomized inventory items sourced from `fandom_gallery_images`.

**Script:** `scripts/seed-inventory-sample.js`

---

## Usage

```bash
# Seed 1000 items for a specific Firebase UID
node scripts/seed-inventory-sample.js --user <firebaseUid> --count 1000

# Seed by email (auto-resolves user)
node scripts/seed-inventory-sample.js --email you@example.com --count 1000

# Seed by username (JWT user)
node scripts/seed-inventory-sample.js --username yourname --count 1000

# Dry run (no writes)
node scripts/seed-inventory-sample.js --user <firebaseUid> --count 1000 --dry-run
```

---

## Flags

- `--user <uid>`: Firebase UID (preferred).
- `--email <email>`: Resolve user by email.
- `--username <name>`: Resolve user by username (JWT users).
- `--count <n>`: How many inventory items to create (default: 1000).
- `--dry-run`: Log actions without writing.
- `--keep-inventory`: Do not clear existing inventory items.
- `--drop-legacy` / `--no-drop-legacy`: Drop the legacy `photocards` collection (default: true).
- `--legacy-collection <name>`: Custom legacy collection name (default: `photocards`).

---

## What It Inserts

Each inventory item is built from a real photocard in `fandom_gallery_images` and includes:

- `cardId`: ObjectId of the photocard document
- `acquiredAt`: Randomized timestamps (recent + older dates)
- `source.type`: Mixed sources (`quiz`, `quest_streaming`, `quest_quiz`, `craft`, `event`, `daily_milestone`, `weekly_milestone`)

This produces realistic data for:

- Category/subcategory filters
- Source filters
- “New” filter (last 7 days)
- Collection view (missing cards)

---

## Safety Notes

- The script **clears inventory for the chosen user** unless `--keep-inventory` is used.
- By default it drops the **legacy `photocards`** collection only. It does **not** touch `fandom_gallery_images`.

