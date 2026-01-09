#!/usr/bin/env node
'use strict'

/*
 * Scrape BTS Wiki Fandom gallery pages and store image URLs in MongoDB.
 * - Crawls Category:Galleries (or a single page via --page).
 * - Extracts gallery images plus tab/heading anchors (#) for subcategories.
 * - Derives full-size static image URLs via MediaWiki file hashing.
 *
 * Usage:
 *   node scripts/scrape-fandom-galleries.js --dry-run --limit-pages 2
 *   node scripts/scrape-fandom-galleries.js --page "https://bts.fandom.com/wiki/D-DAY/Gallery" --dry-run
 *   node scripts/scrape-fandom-galleries.js --concurrency 3 --delay-ms 250
 *
 * Env:
 *   MONGODB_URI (required unless --dry-run)
 */

require('dotenv').config({ path: '.env.local' })

const cheerio = require('cheerio')
const crypto = require('crypto')
const mongoose = require('mongoose')

const BASE_URL = 'https://bts.fandom.com'
const CATEGORY_URL = `${BASE_URL}/wiki/Category:Galleries`
const IMAGE_BASE = 'https://static.wikia.nocookie.net/the-bangtan-boys/images'

function parseArgs(argv) {
  const out = {
    'dry-run': false,
    'limit-pages': null,
    'page': null,
    'concurrency': 3,
    'delay-ms': 250,
    'collection': 'fandom_gallery_images'
  }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--dry-run' || arg === '-d') out['dry-run'] = true
    else if (arg === '--limit-pages' && i + 1 < argv.length) out['limit-pages'] = Number(argv[++i])
    else if (arg === '--page' && i + 1 < argv.length) out['page'] = argv[++i]
    else if (arg === '--concurrency' && i + 1 < argv.length) out['concurrency'] = Number(argv[++i])
    else if (arg === '--delay-ms' && i + 1 < argv.length) out['delay-ms'] = Number(argv[++i])
    else if (arg === '--collection' && i + 1 < argv.length) out['collection'] = argv[++i]
  }
  return out
}

const args = parseArgs(process.argv.slice(2))
const DRY_RUN = !!args['dry-run']
const LIMIT_PAGES = Number.isFinite(args['limit-pages']) ? args['limit-pages'] : null
const SINGLE_PAGE = args['page'] ? String(args['page']) : null
const CONCURRENCY = Math.max(1, Number.isFinite(args['concurrency']) ? args['concurrency'] : 3)
const DELAY_MS = Math.max(0, Number.isFinite(args['delay-ms']) ? args['delay-ms'] : 250)
const COLLECTION = args['collection']

if (!global.fetch) {
  console.error('ERROR: This script needs Node 18+ (global fetch is missing).')
  process.exit(1)
}

if (!DRY_RUN && (!process.env.MONGODB_URI || !String(process.env.MONGODB_URI).trim())) {
  console.error('ERROR: Missing MONGODB_URI (required unless --dry-run).')
  process.exit(1)
}

function sleep(ms) {
  if (!ms) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchHtml(url, attempt = 1) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ArmyverseScraper/1.0)',
      'Accept-Language': 'en'
    }
  })
  if (!res.ok) {
    const retryable = res.status === 429 || (res.status >= 500 && res.status < 600)
    if (retryable && attempt < 4) {
      await sleep(500 * attempt)
      return fetchHtml(url, attempt + 1)
    }
    throw new Error(`Request failed ${res.status} ${res.statusText} for ${url}`)
  }
  const text = await res.text()
  await sleep(DELAY_MS)
  return text
}

function decodeFileName(value) {
  if (!value) return null
  // MediaWiki sometimes URL-encodes file names in link attributes.
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function resolveFileName(imageKey, imageName, fileHref) {
  if (imageKey) return decodeFileName(imageKey)
  if (imageName) return imageName.replace(/ /g, '_')
  if (fileHref) {
    const match = /\/wiki\/File:(.+)$/.exec(fileHref)
    if (match && match[1]) return decodeFileName(match[1])
  }
  return null
}

function buildImageUrl(fileName) {
  if (!fileName) return null
  // Fandom file storage is addressed by md5-based path segments.
  const hash = crypto.createHash('md5').update(fileName).digest('hex')
  const encoded = encodeURIComponent(fileName)
  return `${IMAGE_BASE}/${hash[0]}/${hash.slice(0, 2)}/${encoded}/revision/latest`
}

function getHeadingInfo($node) {
  const tag = ($node[0] && $node[0].tagName) || ''
  if (!/^h[2-6]$/.test(tag)) return null
  const level = Number(tag.slice(1))
  const $headline = $node.find('.mw-headline').first()
  const id = ($headline.attr('id') || $node.attr('id') || '').trim()
  const label = ($headline.text() || $node.text() || '').trim()
  if (!id && !label) return null
  return { level, id: id || label, label: label || id }
}

function cloneContext(ctx) {
  return {
    tabPath: [...(ctx.tabPath || [])],
    tabLabels: [...(ctx.tabLabels || [])],
    headingPath: [...(ctx.headingPath || [])],
    headingLabels: [...(ctx.headingLabels || [])]
  }
}

function applyHeading(ctx, heading) {
  const next = cloneContext(ctx)
  const index = Math.max(0, heading.level - 2)
  next.headingPath = next.headingPath.slice(0, index)
  next.headingLabels = next.headingLabels.slice(0, index)
  next.headingPath[index] = heading.id
  next.headingLabels[index] = heading.label
  return next
}

function extractGalleryItems($gallery, ctx, pageMeta) {
  const items = []
  $gallery.find('.wikia-gallery-item').each((_, el) => {
    const $item = pageMeta.$(el)
    const $link = $item.find('a.image').first()
    const fileHref = $link.attr('href') || null
    const filePageUrl = fileHref ? new URL(fileHref, BASE_URL).toString() : null

    const $img = $item.find('img[data-image-key], img[data-image-name]').first()
    const imageKey = $img.attr('data-image-key') || null
    const imageName = $img.attr('data-image-name') || null
    const caption =
      $img.attr('data-caption') ||
      $item.find('.lightbox-caption').first().text().trim() ||
      $img.attr('alt') ||
      null
    const thumbUrl = $img.attr('data-src') || $img.attr('src') || null

    const fileName = resolveFileName(imageKey, imageName, fileHref)
    const imageUrl = buildImageUrl(fileName)

    // Prefer tab-derived anchors; fall back to headings if no tabs exist.
    const anchorParts = ctx.tabPath.length ? ctx.tabPath : ctx.headingPath
    const anchorLabels = ctx.tabLabels.length ? ctx.tabLabels : ctx.headingLabels
    const anchor = anchorParts.length ? anchorParts[anchorParts.length - 1] : null
    const sourceUrl = anchor ? `${pageMeta.pageUrl}#${encodeURIComponent(anchor)}` : pageMeta.pageUrl

    const subcategoryPath = anchorParts.length ? anchorParts.join('/') : null

    // Build a stable key for upserts: page + subcategory + image identity.
    const sourceKeyParts = [
      pageMeta.pageSlug,
      subcategoryPath || '',
      imageKey || fileName || imageUrl || filePageUrl || imageName || ''
    ]
    const sourceKey = sourceKeyParts.join('|')

    items.push({
      sourceKey,
      pageUrl: pageMeta.pageUrl,
      pageTitle: pageMeta.pageTitle,
      pageSlug: pageMeta.pageSlug,
      pageDisplay: pageMeta.pageDisplay,
      pathSegments: pageMeta.pathSegments,
      categoryPath: pageMeta.pageSlug,
      categoryDisplay: pageMeta.pageDisplay,
      tabPath: ctx.tabPath,
      tabLabels: ctx.tabLabels,
      headingPath: ctx.headingPath,
      headingLabels: ctx.headingLabels,
      subcategoryPath,
      subcategoryLabels: anchorLabels,
      anchor,
      sourceUrl,
      imageUrl,
      thumbUrl,
      filePageUrl,
      imageKey,
      imageName,
      caption,
      scrapedAt: new Date()
    })
  })
  return items
}

function extractLegacyGalleryItems($gallery, ctx, pageMeta) {
  const items = []
  $gallery.find('li.gallerybox, .gallerybox').each((_, el) => {
    const $item = pageMeta.$(el)
    const $img = $item.find('img').first()
    const fileHref = $item.find('a.image, a').first().attr('href') || null
    const filePageUrl = fileHref ? new URL(fileHref, BASE_URL).toString() : null
    const thumbUrl = $img.attr('data-src') || $img.attr('src') || null
    const imageName = $img.attr('alt') || null
    const fileName = resolveFileName(null, imageName, fileHref)
    const imageUrl = buildImageUrl(fileName)

    const anchorParts = ctx.tabPath.length ? ctx.tabPath : ctx.headingPath
    const anchorLabels = ctx.tabLabels.length ? ctx.tabLabels : ctx.headingLabels
    const anchor = anchorParts.length ? anchorParts[anchorParts.length - 1] : null
    const sourceUrl = anchor ? `${pageMeta.pageUrl}#${encodeURIComponent(anchor)}` : pageMeta.pageUrl
    const subcategoryPath = anchorParts.length ? anchorParts.join('/') : null

    const sourceKeyParts = [
      pageMeta.pageSlug,
      subcategoryPath || '',
      fileName || imageUrl || filePageUrl || imageName || ''
    ]
    const sourceKey = sourceKeyParts.join('|')

    items.push({
      sourceKey,
      pageUrl: pageMeta.pageUrl,
      pageTitle: pageMeta.pageTitle,
      pageSlug: pageMeta.pageSlug,
      pageDisplay: pageMeta.pageDisplay,
      pathSegments: pageMeta.pathSegments,
      categoryPath: pageMeta.pageSlug,
      categoryDisplay: pageMeta.pageDisplay,
      tabPath: ctx.tabPath,
      tabLabels: ctx.tabLabels,
      headingPath: ctx.headingPath,
      headingLabels: ctx.headingLabels,
      subcategoryPath,
      subcategoryLabels: anchorLabels,
      anchor,
      sourceUrl,
      imageUrl,
      thumbUrl,
      filePageUrl,
      imageKey: null,
      imageName,
      caption: null,
      scrapedAt: new Date()
    })
  })
  return items
}

function walkContent($node, ctx, pageMeta, out) {
  let currentCtx = cloneContext(ctx)
  $node.children().each((_, child) => {
    if (!child || child.type !== 'tag') return
    const $child = pageMeta.$(child)
    const tagName = child.tagName || ''
    if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') return

    const heading = getHeadingInfo($child)
    if (heading) {
      currentCtx = applyHeading(currentCtx, heading)
      return
    }

    if ($child.is('div.tabber.wds-tabber')) {
      // Tabbers define the # anchors used in gallery URLs.
      const $tabs = $child.find('> .wds-tabs__wrapper .wds-tabs__tab')
      const $contents = $child.children('.wds-tab__content')
      if ($tabs.length && $contents.length) {
        $contents.each((index, content) => {
          const $tab = $tabs.eq(index)
          const hash = ($tab.attr('data-hash') || '').trim()
          const label = ($tab.find('.wds-tabs__tab-label').text() || $tab.text() || '').trim()
          const nextCtx = cloneContext(currentCtx)
          if (hash || label) {
            nextCtx.tabPath.push(hash || label)
            nextCtx.tabLabels.push(label || hash || `tab-${index}`)
          }
          // Walk the tab content with the updated anchor context.
          walkContent(pageMeta.$(content), nextCtx, pageMeta, out)
        })
        return
      }
      walkContent($child, currentCtx, pageMeta, out)
      return
    }

    if ($child.is('div.wikia-gallery')) {
      // Modern Fandom gallery markup.
      out.push(...extractGalleryItems($child, currentCtx, pageMeta))
      return
    }

    if ($child.is('ul.gallery, div.gallery')) {
      // Legacy MediaWiki gallery markup.
      out.push(...extractLegacyGalleryItems($child, currentCtx, pageMeta))
      return
    }

    walkContent($child, currentCtx, pageMeta, out)
  })
}

function parseGalleryPage(html, pageUrl) {
  const $ = cheerio.load(html)
  const pageTitle =
    $('h1.page-header__title').first().text().trim() ||
    $('meta[property="og:title"]').attr('content') ||
    $('title').text().trim()

  const url = new URL(pageUrl)
  let pageSlug = url.pathname.replace(/^\/wiki\//, '')
  pageSlug = decodeFileName(pageSlug)
  const pathSegments = pageSlug.split('/').filter(Boolean)
  const pageDisplay = pathSegments.map((seg) => seg.replace(/_/g, ' ')).join('/')

  const pageMeta = {
    $,
    pageUrl,
    pageTitle,
    pageSlug,
    pageDisplay,
    pathSegments
  }

  const root = $('.mw-parser-output').first()
  if (!root.length) return []

  const out = []
  const baseCtx = { tabPath: [], tabLabels: [], headingPath: [], headingLabels: [] }
  walkContent(root, baseCtx, pageMeta, out)
  return out
}

function parseCategoryPage(html) {
  const $ = cheerio.load(html)
  const links = new Set()
  $('.category-page__member-link').each((_, el) => {
    const href = $(el).attr('href')
    if (!href) return
    if (href.includes('/wiki/Category:')) return
    const url = new URL(href, BASE_URL).toString()
    links.add(url)
  })
  const next = $('link[rel="next"]').attr('href')
  return { links: Array.from(links), next: next || null }
}

async function collectCategoryLinks() {
  const links = new Set()
  const visited = new Set()
  let url = CATEGORY_URL
  while (url) {
    if (visited.has(url)) break
    visited.add(url)
    const html = await fetchHtml(url)
    const { links: pageLinks, next } = parseCategoryPage(html)
    for (const link of pageLinks) links.add(link)
    url = next
  }
  return Array.from(links)
}

async function runWithConcurrency(items, limit, handler) {
  const executing = new Set()
  const results = []
  for (const item of items) {
    const p = Promise.resolve().then(() => handler(item))
    results.push(p)
    executing.add(p)
    p.finally(() => executing.delete(p))
    if (executing.size >= limit) {
      await Promise.race(executing)
    }
  }
  return Promise.all(results)
}

async function main() {
  const pageUrls = SINGLE_PAGE ? [SINGLE_PAGE] : await collectCategoryLinks()
  const limitedUrls = LIMIT_PAGES ? pageUrls.slice(0, LIMIT_PAGES) : pageUrls

  console.log(`Found ${pageUrls.length} gallery pages.`)
  if (LIMIT_PAGES) console.log(`Limiting to ${limitedUrls.length} page(s).`)
  if (DRY_RUN) console.log('Running in dry-run mode (no DB writes).')

  let GalleryItem = null
  if (!DRY_RUN) {
    await mongoose.connect(process.env.MONGODB_URI)
    const gallerySchema = new mongoose.Schema(
      {
        sourceKey: { type: String, required: true, unique: true },
        pageUrl: { type: String, required: true },
        pageTitle: String,
        pageSlug: String,
        pageDisplay: String,
        pathSegments: [String],
        categoryPath: String,
        categoryDisplay: String,
        tabPath: [String],
        tabLabels: [String],
        headingPath: [String],
        headingLabels: [String],
        subcategoryPath: String,
        subcategoryLabels: [String],
        anchor: String,
        sourceUrl: String,
        imageUrl: String,
        thumbUrl: String,
        filePageUrl: String,
        imageKey: String,
        imageName: String,
        caption: String,
        scrapedAt: Date,
        createdAt: { type: Date, default: Date.now }
      },
      { collection: COLLECTION }
    )
    gallerySchema.index({ categoryPath: 1, subcategoryPath: 1 })
    gallerySchema.index({ imageUrl: 1 })
    const modelName = `FandomGalleryItem_${COLLECTION}`
    GalleryItem =
      mongoose.models[modelName] || mongoose.model(modelName, gallerySchema, COLLECTION)
    await GalleryItem.collection.createIndex({ sourceKey: 1 }, { unique: true })
  }

  let totalImages = 0
  let totalPages = 0
  await runWithConcurrency(limitedUrls, CONCURRENCY, async (pageUrl) => {
    const index = ++totalPages
    console.log(`[${index}/${limitedUrls.length}] Scraping ${pageUrl}`)
    const html = await fetchHtml(pageUrl)
    const docs = parseGalleryPage(html, pageUrl)
    totalImages += docs.length
    console.log(`  -> ${docs.length} image(s)`)

    if (DRY_RUN || docs.length === 0) return

    const uniqueDocs = new Map()
    for (const doc of docs) {
      if (!doc.sourceKey) continue
      uniqueDocs.set(doc.sourceKey, doc)
    }

    const ops = Array.from(uniqueDocs.values()).map((doc) => ({
      updateOne: {
        filter: { sourceKey: doc.sourceKey },
        update: { $set: doc, $setOnInsert: { createdAt: new Date() } },
        upsert: true
      }
    }))

    if (ops.length) {
      await GalleryItem.bulkWrite(ops, { ordered: false })
    }
  })

  console.log(`Done. Pages: ${totalPages}, Images: ${totalImages}`)
  if (!DRY_RUN) await mongoose.disconnect()
}

main().catch((err) => {
  console.error('ERROR: Scrape failed:', err)
  process.exit(1)
})
