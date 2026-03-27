/**
 * WordPress → Sanity Migration Script
 *
 * Migrates all posts from flourandfiction.com WordPress to Sanity CMS.
 * Preserves slugs, dates, images, and content.
 *
 * Usage: cd flour-and-fiction && npx tsx scripts/migrate-wp.ts
 *
 * Options:
 *   --dry-run    Preview what would be migrated without writing to Sanity
 *   --force      Overwrite existing documents (default: skip)
 *   --limit=N    Only migrate first N posts (for testing)
 */

import {createClient} from '@sanity/client'

// ── Config ──

const WP_BASE = 'https://flourandfiction.com/wp-json/wp/v2'
const SANITY_PROJECT_ID = '14i3ppzr'
const SANITY_DATASET = 'production'
const SANITY_TOKEN = process.env.SANITY_API_READ_TOKEN || ''

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const FORCE = args.includes('--force')
const limitArg = args.find((a) => a.startsWith('--limit='))
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1]) : undefined

const sanity = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_TOKEN,
  apiVersion: '2025-09-25',
  useCdn: false,
})

// ── Types ──

interface WPPost {
  id: number
  date: string
  slug: string
  title: {rendered: string}
  content: {rendered: string}
  excerpt: {rendered: string}
  featured_media: number
  categories: number[]
  tags: number[]
}

interface WPMedia {
  id: number
  source_url: string
  alt_text: string
  media_details?: {
    width: number
    height: number
  }
}

interface WPCategory {
  id: number
  name: string
  slug: string
}

// ── WP API Fetchers ──

async function fetchAllPosts(): Promise<WPPost[]> {
  const posts: WPPost[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const url = `${WP_BASE}/posts?per_page=${perPage}&page=${page}&_fields=id,date,slug,title,content,excerpt,featured_media,categories,tags`
    const res = await fetch(url)

    if (!res.ok) {
      if (res.status === 400) break // No more pages
      throw new Error(`WP API error: ${res.status} ${res.statusText}`)
    }

    const data: WPPost[] = await res.json()
    if (data.length === 0) break

    posts.push(...data)
    const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1')
    if (page >= totalPages) break
    page++
  }

  return posts
}

async function fetchMedia(mediaId: number): Promise<WPMedia | null> {
  if (!mediaId) return null
  try {
    const res = await fetch(`${WP_BASE}/media/${mediaId}?_fields=id,source_url,alt_text,media_details`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function fetchCategories(): Promise<Map<number, WPCategory>> {
  const map = new Map<number, WPCategory>()
  const res = await fetch(`${WP_BASE}/categories?per_page=100&_fields=id,name,slug`)
  if (res.ok) {
    const cats: WPCategory[] = await res.json()
    for (const cat of cats) map.set(cat.id, cat)
  }
  return map
}

// ── Image Upload ──

const imageCache = new Map<string, string>() // url -> sanity asset _ref

async function uploadImageToSanity(imageUrl: string, filename?: string): Promise<string | null> {
  if (imageCache.has(imageUrl)) return imageCache.get(imageUrl)!

  try {
    const res = await fetch(imageUrl)
    if (!res.ok) {
      console.error(`  ⚠ Failed to download image: ${imageUrl} (${res.status})`)
      return null
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    const contentType = res.headers.get('content-type') || 'image/jpeg'

    const asset = await sanity.assets.upload('image', buffer, {
      filename: filename || imageUrl.split('/').pop() || 'image.jpg',
      contentType,
    })

    const ref = asset._id
    imageCache.set(imageUrl, ref)
    return ref
  } catch (err) {
    console.error(`  ⚠ Failed to upload image: ${imageUrl}`, (err as Error).message)
    return null
  }
}

// ── HTML to Portable Text ──

function decodeEntities(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&hellip;/g, '…')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&nbsp;/g, ' ')
}

function generateKey(): string {
  return Math.random().toString(36).substring(2, 14)
}

interface PortableTextBlock {
  _type: string
  _key: string
  [key: string]: unknown
}

interface InlineImage {
  url: string
  alt: string
}

function htmlToPortableText(html: string): {blocks: PortableTextBlock[]; inlineImages: InlineImage[]} {
  const blocks: PortableTextBlock[] = []
  const inlineImages: InlineImage[] = []

  // Strip WP comments and clean up
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\r\n/g, '\n')
    .trim()

  // Split into block-level elements
  const blockRegex = /<(p|h[1-6]|ul|ol|blockquote|figure|div|table)[^>]*>([\s\S]*?)<\/\1>/gi
  let match: RegExpExecArray | null

  // Also handle self-contained img tags outside of figure/p
  const imgOnlyRegex = /<img[^>]+>/gi

  // Process block by block
  const segments = splitIntoBlocks(cleaned)

  for (const segment of segments) {
    const trimmed = segment.trim()
    if (!trimmed) continue

    // Figure with image
    if (trimmed.startsWith('<figure')) {
      const imgMatch = trimmed.match(/<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*>/)
      if (imgMatch) {
        const url = imgMatch[1]
        const alt = decodeEntities(imgMatch[2] || '')
        inlineImages.push({url, alt})
        blocks.push({
          _type: 'image',
          _key: generateKey(),
          _sanityAsset: `image@${url}`,
          alt,
        })
      }
      continue
    }

    // Heading
    const headingMatch = trimmed.match(/^<(h[1-6])[^>]*>([\s\S]*?)<\/\1>$/i)
    if (headingMatch) {
      const level = headingMatch[1].toLowerCase()
      const text = stripTags(headingMatch[2])
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: level,
        markDefs: [],
        children: [{_type: 'span', _key: generateKey(), text: decodeEntities(text), marks: []}],
      })
      continue
    }

    // List (ul/ol)
    const listMatch = trimmed.match(/^<(ul|ol)[^>]*>([\s\S]*?)<\/\1>$/i)
    if (listMatch) {
      const listType = listMatch[1].toLowerCase() === 'ol' ? 'number' : 'bullet'
      const items = listMatch[2].match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || []
      for (const item of items) {
        const itemContent = item.replace(/<\/?li[^>]*>/gi, '')
        const {children, markDefs} = parseInlineContent(itemContent)
        blocks.push({
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: listType,
          level: 1,
          markDefs,
          children,
        })
      }
      continue
    }

    // Blockquote
    const bqMatch = trimmed.match(/^<blockquote[^>]*>([\s\S]*?)<\/blockquote>$/i)
    if (bqMatch) {
      const innerText = stripTags(bqMatch[1])
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'blockquote',
        markDefs: [],
        children: [{_type: 'span', _key: generateKey(), text: decodeEntities(innerText), marks: []}],
      })
      continue
    }

    // Paragraph (default)
    const pMatch = trimmed.match(/^<p[^>]*>([\s\S]*?)<\/p>$/i)
    if (pMatch) {
      const inner = pMatch[1].trim()
      if (!inner) continue

      // Check if paragraph contains only an image
      const imgOnly = inner.match(/^<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*>\s*$/)
      if (imgOnly) {
        inlineImages.push({url: imgOnly[1], alt: decodeEntities(imgOnly[2] || '')})
        blocks.push({
          _type: 'image',
          _key: generateKey(),
          _sanityAsset: `image@${imgOnly[1]}`,
          alt: decodeEntities(imgOnly[2] || ''),
        })
        continue
      }

      const {children, markDefs} = parseInlineContent(inner)
      if (children.length > 0) {
        blocks.push({
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          markDefs,
          children,
        })
      }
      continue
    }

    // Standalone image
    const standaloneImg = trimmed.match(/^<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*>$/i)
    if (standaloneImg) {
      inlineImages.push({url: standaloneImg[1], alt: decodeEntities(standaloneImg[2] || '')})
      blocks.push({
        _type: 'image',
        _key: generateKey(),
        _sanityAsset: `image@${standaloneImg[1]}`,
        alt: decodeEntities(standaloneImg[2] || ''),
      })
      continue
    }

    // Fallback: treat as paragraph with stripped tags
    const plainText = stripTags(trimmed).trim()
    if (plainText) {
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        markDefs: [],
        children: [{_type: 'span', _key: generateKey(), text: decodeEntities(plainText), marks: []}],
      })
    }
  }

  return {blocks, inlineImages}
}

function splitIntoBlocks(html: string): string[] {
  const blocks: string[] = []
  const regex = /<(p|h[1-6]|ul|ol|blockquote|figure|div|table|img)[^>]*(?:>[\s\S]*?<\/\1>|[^>]*\/?>)/gi
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(html)) !== null) {
    // Capture any text between blocks
    if (match.index > lastIndex) {
      const between = html.substring(lastIndex, match.index).trim()
      if (between) blocks.push(between)
    }
    blocks.push(match[0])
    lastIndex = regex.lastIndex
  }

  // Remaining text
  if (lastIndex < html.length) {
    const remaining = html.substring(lastIndex).trim()
    if (remaining) blocks.push(remaining)
  }

  return blocks
}

function parseInlineContent(html: string): {children: any[]; markDefs: any[]} {
  const children: any[] = []
  const markDefs: any[] = []

  // Process inline elements: <a>, <strong>, <em>, <b>, <i>
  let remaining = html
  let currentText = ''
  let currentMarks: string[] = []

  // Simple state machine for inline parsing
  const pushSpan = (text: string, marks: string[]) => {
    if (!text) return
    children.push({
      _type: 'span',
      _key: generateKey(),
      text: decodeEntities(text),
      marks: [...marks],
    })
  }

  // Use regex to find inline tags
  const inlineRegex = /<(a|strong|em|b|i|br)\s*[^>]*>|<\/(a|strong|em|b|i)>|([^<]+)|<[^>]+>/gi

  const markStack: {tag: string; markKey?: string}[] = []

  let inlineMatch: RegExpExecArray | null
  while ((inlineMatch = inlineRegex.exec(remaining)) !== null) {
    const full = inlineMatch[0]
    const openTag = inlineMatch[1]?.toLowerCase()
    const closeTag = inlineMatch[2]?.toLowerCase()
    const text = inlineMatch[3]

    if (text) {
      const activeMarks = markStack.map((m) => (m.markKey ? m.markKey : m.tag === 'strong' || m.tag === 'b' ? 'strong' : m.tag === 'em' || m.tag === 'i' ? 'em' : ''))
        .filter(Boolean)
      pushSpan(text, activeMarks)
    } else if (openTag === 'a') {
      const hrefMatch = full.match(/href="([^"]*)"/)
      const href = hrefMatch ? hrefMatch[1] : ''
      const isAffiliate = full.includes('sponsored') || full.includes('nofollow')
      const markKey = generateKey()

      if (isAffiliate) {
        markDefs.push({
          _type: 'affiliateLink',
          _key: markKey,
          href,
        })
      } else {
        markDefs.push({
          _type: 'link',
          _key: markKey,
          linkType: 'href',
          href,
          openInNewTab: full.includes('target="_blank"'),
        })
      }
      markStack.push({tag: 'a', markKey})
    } else if (openTag === 'strong' || openTag === 'b') {
      markStack.push({tag: openTag})
    } else if (openTag === 'em' || openTag === 'i') {
      markStack.push({tag: openTag})
    } else if (openTag === 'br') {
      pushSpan('\n', markStack.map((m) => m.markKey || (m.tag === 'strong' || m.tag === 'b' ? 'strong' : 'em')).filter(Boolean))
    } else if (closeTag) {
      // Pop matching tag
      for (let i = markStack.length - 1; i >= 0; i--) {
        if (markStack[i].tag === closeTag || (closeTag === 'b' && markStack[i].tag === 'strong') || (closeTag === 'i' && markStack[i].tag === 'em')) {
          markStack.splice(i, 1)
          break
        }
      }
    }
    // Skip other tags (img inside p handled elsewhere)
  }

  if (children.length === 0) {
    children.push({_type: 'span', _key: generateKey(), text: '', marks: []})
  }

  return {children, markDefs}
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '')
}

function stripHtmlExcerpt(html: string): string {
  return stripTags(html).replace(/\[&hellip;\]/g, '…').replace(/\s+/g, ' ').trim()
}

// ── Main Migration ──

async function migrate() {
  console.log('🚀 Flour & Fiction: WordPress → Sanity Migration')
  console.log(`   Project: ${SANITY_PROJECT_ID} / ${SANITY_DATASET}`)
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}${FORCE ? ' (force overwrite)' : ''}`)
  if (LIMIT) console.log(`   Limit: ${LIMIT} posts`)
  console.log()

  if (!SANITY_TOKEN && !DRY_RUN) {
    console.error('❌ SANITY_API_READ_TOKEN not set. Export it or add to .env')
    process.exit(1)
  }

  // Fetch WP data
  console.log('📥 Fetching WordPress data...')
  const [posts, categories] = await Promise.all([fetchAllPosts(), fetchCategories()])
  console.log(`   Found ${posts.length} posts, ${categories.size} categories`)

  const toMigrate = LIMIT ? posts.slice(0, LIMIT) : posts

  // Check existing documents
  const existingSlugs = new Set<string>()
  if (!DRY_RUN) {
    const existing = await sanity.fetch<{slug: string}[]>(
      `*[_type == "post" && defined(slug.current)]{\"slug\": slug.current}`
    )
    for (const doc of existing) existingSlugs.add(doc.slug)
    console.log(`   ${existingSlugs.size} posts already in Sanity`)
  }

  console.log()

  let migrated = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < toMigrate.length; i++) {
    const post = toMigrate[i]
    const title = decodeEntities(post.title.rendered)
    const progress = `[${i + 1}/${toMigrate.length}]`

    // Skip if exists
    if (existingSlugs.has(post.slug) && !FORCE) {
      console.log(`${progress} ⏭ ${title} (already exists)`)
      skipped++
      continue
    }

    console.log(`${progress} 📝 ${title}`)

    try {
      // Fetch featured image
      let coverImageRef: string | null = null
      let coverImageAlt = ''
      if (post.featured_media) {
        const media = await fetchMedia(post.featured_media)
        if (media) {
          console.log(`  📸 Uploading cover image...`)
          coverImageAlt = media.alt_text || ''
          if (!DRY_RUN) {
            coverImageRef = await uploadImageToSanity(media.source_url)
          }
        }
      }

      // Convert content
      const {blocks, inlineImages} = htmlToPortableText(post.content.rendered)

      // Upload inline images
      if (inlineImages.length > 0) {
        console.log(`  📸 Uploading ${inlineImages.length} inline images...`)
        if (!DRY_RUN) {
          for (const img of inlineImages) {
            const ref = await uploadImageToSanity(img.url)
            if (ref) {
              // Update the block that references this image
              for (const block of blocks) {
                if (block._type === 'image' && block._sanityAsset === `image@${img.url}`) {
                  delete block._sanityAsset
                  block.asset = {_type: 'reference', _ref: ref}
                  break
                }
              }
            }
          }
        }
      }

      // Map categories
      const postCategories = post.categories
        .map((id) => categories.get(id))
        .filter(Boolean)
        .map((c) => c!.name)

      // Build excerpt
      const excerpt = stripHtmlExcerpt(post.excerpt.rendered)

      // Build Sanity document
      const doc: Record<string, unknown> = {
        _type: 'post',
        _id: `wp-${post.slug}`,
        title,
        slug: {_type: 'slug', current: post.slug},
        date: new Date(post.date).toISOString(),
        excerpt,
        content: blocks.filter((b) => {
          // Remove image blocks that failed to upload (still have _sanityAsset)
          if (b._type === 'image' && b._sanityAsset) return false
          return true
        }),
      }

      if (coverImageRef) {
        doc.coverImage = {
          _type: 'image',
          asset: {_type: 'reference', _ref: coverImageRef},
          alt: coverImageAlt,
        }
      }

      if (DRY_RUN) {
        console.log(`  ✅ Would create: ${post.slug} (${blocks.length} blocks, ${inlineImages.length} images)`)
        console.log(`     Categories: ${postCategories.join(', ')}`)
      } else {
        await sanity.createOrReplace(doc)
        console.log(`  ✅ Created: ${post.slug}`)
      }

      migrated++
    } catch (err) {
      console.error(`  ❌ Failed: ${(err as Error).message}`)
      failed++
    }
  }

  console.log()
  console.log('━━━ Migration Complete ━━━')
  console.log(`  ✅ Migrated: ${migrated}`)
  console.log(`  ⏭ Skipped:  ${skipped}`)
  console.log(`  ❌ Failed:   ${failed}`)
  console.log(`  📊 Total:    ${toMigrate.length}`)
}

migrate().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
