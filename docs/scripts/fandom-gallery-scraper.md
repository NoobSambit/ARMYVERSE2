# Fandom Gallery Scraper

This document explains the BTS Fandom gallery scraper in `scripts/scrape-fandom-galleries.js`, including how it works, what it stores, and how to run it. The output collection now serves as the primary photocard catalog used by the inventory and collection views.

---

## Purpose

We needed a repeatable way to ingest thousands of BTS gallery images without manual uploads. The scraper:

- Crawls `https://bts.fandom.com/wiki/Category:Galleries`.
- Visits each gallery page.
- Extracts all images from every tab/anchor (the `#` segments).
- Stores the image URL plus category and subcategory metadata in MongoDB.

The resulting collection can be used to build UI filters like:

- Category (page path): `D-DAY/Gallery`
- Subcategory (tab or nested tab): `Promo_Pictures`, `Promotional/MV_Sketch`

---

## Output Collection

**Default collection:** `fandom_gallery_images`

This collection is the primary photocard source. The legacy `photocards` collection is no longer used by the game inventory.

You can override the collection name:

```bash
node scripts/scrape-fandom-galleries.js --collection fandom_gallery_images_backup
```

---

## Stored Fields (Core)

Each document includes:

- `categoryPath`: page path (e.g., `D-DAY/Gallery`)
- `categoryDisplay`: human-readable title (spaces instead of `_`)
- `subcategoryPath`: path built from `#` anchors (e.g., `Promo_Pictures`)
- `subcategoryLabels`: readable labels for UI
- `pageUrl`: canonical page URL
- `sourceUrl`: page URL with `#anchor`
- `imageUrl`: full-size static image URL
- `thumbUrl`: thumbnail URL from the HTML
- `filePageUrl`: `/wiki/File:...` link
- `imageKey` / `imageName`: identifiers from the gallery markup
- `sourceKey`: stable key for deduped upserts
- `scrapedAt`: timestamp

---

## How It Works

1. **Category crawl**
   - Fetches `Category:Galleries`.
   - Follows `link[rel="next"]` to traverse all pages (covers A-Z, numbers, and "Other").

2. **Gallery page parsing**
   - Uses Cheerio to parse the HTML.
   - Walks the article content tree.
   - Tracks `tabber` anchors (`data-hash`) and heading anchors (`id`).
   - Extracts all `wikia-gallery` items.

3. **Anchor-aware subcategories**
   - Tabs map directly to `#Promo_Pictures` style anchors.
   - Nested tabbers become multi-level subcategory paths:
     - Example: `Promotional/MV_Sketch`

4. **Full-size image URL**
   - Fandom static assets use an md5 hash path:
     - `/images/a/ab/File_Name.jpg`
   - The script hashes the file name to build a stable full-size URL:
     - `https://static.wikia.nocookie.net/.../revision/latest`

5. **Idempotent writes**
   - `sourceKey = page + subcategory + file identity`
   - Documents are upserted (safe to re-run).

---

## Usage

**Dry run (no DB writes):**

```bash
node scripts/scrape-fandom-galleries.js --dry-run
```

**Single page test:**

```bash
node scripts/scrape-fandom-galleries.js --page "https://bts.fandom.com/wiki/D-DAY/Gallery" --dry-run
```

**Full ingest:**

```bash
node scripts/scrape-fandom-galleries.js
```

---

## Flags

- `--dry-run` or `-d`: No writes, just logging.
- `--page <url>`: Scrape a single page.
- `--limit-pages <n>`: Limit total pages.
- `--concurrency <n>`: Parallel requests (default 3).
- `--delay-ms <n>`: Delay between requests (default 250ms).
- `--collection <name>`: Custom target collection.

---

## Design Decisions

- **HTML parsing instead of API usage**
  - The requirement was to use the Fandom site HTML and capture `#` tab anchors.
- **Anchor-first subcategory logic**
  - Tabs and headings naturally encode how the UI groups images.
- **Idempotent upserts**
  - Safe to re-run during incremental updates.
- **Primary catalog**
  - The inventory and collection UI read directly from `fandom_gallery_images`.

---

## Known Limitations

- Some gallery pages are empty or placeholders (0 images).
- The script relies on current Fandom HTML structure (tabbers and gallery markup).
- Some images may appear in multiple categories; duplicates are stored as distinct category records.

---

## Interview Notes (Talking Points)

- **Problem:** manual image ingestion was too slow for thousands of assets.
- **Solution:** crawler + parser with anchor-aware metadata.
- **Reliability:** idempotent upserts and stable `sourceKey`.
- **Scale:** concurrency + backoff; handles large pages with 1k+ images.
- **Extensibility:** easy to re-run with new categories or different collections.

---

## File Location

- Script: `scripts/scrape-fandom-galleries.js`
- Docs: `docs/scripts/fandom-gallery-scraper.md`
