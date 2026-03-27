import {defineQuery} from 'next-sanity'

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

const postFields = /* groq */ `
  _id,
  "status": select(_originalId in path("drafts.**") => "draft", "published"),
  "title": coalesce(title, "Untitled"),
  "slug": slug.current,
  excerpt,
  coverImage,
  "date": coalesce(date, _updatedAt),
  "author": author->{firstName, lastName, picture},
`

const linkReference = /* groq */ `
  _type == "link" => {
    "page": page->slug.current,
    "post": post->slug.current
  }
`

const linkFields = /* groq */ `
  link {
      ...,
      ${linkReference}
      }
`

export const getPageQuery = defineQuery(`
  *[_type == 'page' && slug.current == $slug][0]{
    _id,
    _type,
    name,
    slug,
    heading,
    subheading,
    "pageBuilder": pageBuilder[]{
      ...,
      _type == "callToAction" => {
        ...,
        button {
          ...,
          ${linkFields}
        }
      },
      _type == "infoSection" => {
        content[]{
          ...,
          markDefs[]{
            ...,
            ${linkReference}
          }
        }
      },
    },
  }
`)

export const sitemapData = defineQuery(`
  *[_type in ["page", "post", "recipe", "discussionGuide", "bookClubKit"] && defined(slug.current)] | order(_type asc) {
    "slug": slug.current,
    _type,
    _updatedAt,
  }
`)

export const allPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    ${postFields}
  }
`)

export const recentPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) [0...4] {
    ${postFields}
  }
`)

export const morePostsQuery = defineQuery(`
  *[_type == "post" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
    ${postFields}
  }
`)

export const postQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug] [0] {
    content[]{
    ...,
    markDefs[]{
      ...,
      ${linkReference}
    }
  },
    ${postFields}
  }
`)

export const postPagesSlugs = defineQuery(`
  *[_type == "post" && defined(slug.current)]
  {"slug": slug.current}
`)

export const pagesSlugs = defineQuery(`
  *[_type == "page" && defined(slug.current)]
  {"slug": slug.current}
`)

export const pageOrPostSlugs = defineQuery(`
  *[_type in ["page", "post"] && defined(slug.current)]
  {"slug": slug.current}
`)

export const postBySlugQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug] [0] {
    content[]{
      ...,
      markDefs[]{
        ...,
        ${linkReference}
      }
    },
    ${postFields}
  }
`)

// ── Recipe queries ──

const recipeFields = /* groq */ `
  _id,
  "title": coalesce(title, "Untitled Recipe"),
  "slug": slug.current,
  coverImage,
  body,
  ingredients,
  steps,
  prepTime,
  cookTime,
  servings,
  course,
  cuisine,
  equipment,
  notes,
  "date": coalesce(date, _updatedAt),
  "author": author->{firstName, lastName, picture},
  "pairsWithBook": pairsWithBook->{title, "slug": slug.current},
  seo,
`

export const recipeQuery = defineQuery(`
  *[_type == "recipe" && slug.current == $slug] [0] {
    body[]{
      ...,
      markDefs[]{
        ...,
        ${linkReference}
      }
    },
    ${recipeFields}
  }
`)

export const allRecipesQuery = defineQuery(`
  *[_type == "recipe" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    ${recipeFields}
  }
`)

export const recentRecipesQuery = defineQuery(`
  *[_type == "recipe" && defined(slug.current)] | order(date desc, _updatedAt desc) [0...6] {
    ${recipeFields}
  }
`)

export const recipePagesSlugs = defineQuery(`
  *[_type == "recipe" && defined(slug.current)]
  {"slug": slug.current}
`)

// ── Discussion Guide queries ──

const discussionGuideFields = /* groq */ `
  _id,
  "title": coalesce(bookTitle, "Untitled Guide"),
  bookTitle,
  bookAuthor,
  bookCover,
  "slug": slug.current,
  summary,
  affiliateUrl,
  body,
  questions,
  "date": coalesce(date, _updatedAt),
  "author": author->{firstName, lastName, picture},
  "pairsWithRecipe": pairsWithRecipe->{title, "slug": slug.current, coverImage},
  seo,
`

export const discussionGuideQuery = defineQuery(`
  *[_type == "discussionGuide" && slug.current == $slug] [0] {
    body[]{
      ...,
      markDefs[]{
        ...,
        ${linkReference}
      }
    },
    ${discussionGuideFields}
  }
`)

export const allDiscussionGuidesQuery = defineQuery(`
  *[_type == "discussionGuide" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    ${discussionGuideFields}
  }
`)

export const discussionGuidePagesSlugs = defineQuery(`
  *[_type == "discussionGuide" && defined(slug.current)]
  {"slug": slug.current}
`)

// ── Book Club Kit queries ──

const bookClubKitFields = /* groq */ `
  _id,
  "title": coalesce(title, "Untitled Kit"),
  "slug": slug.current,
  month,
  year,
  body,
  coverImage,
  journalPrompts,
  "bookPick": bookPick->{_type, title, bookTitle, "slug": slug.current},
  "recipe": recipe->{title, "slug": slug.current, coverImage, prepTime, cookTime, servings},
  "discussionGuide": discussionGuide->{bookTitle, bookAuthor, "slug": slug.current, bookCover},
  "date": coalesce(date, _updatedAt),
  seo,
`

export const bookClubKitQuery = defineQuery(`
  *[_type == "bookClubKit" && slug.current == $slug] [0] {
    body[]{
      ...,
      markDefs[]{
        ...,
        ${linkReference}
      }
    },
    ${bookClubKitFields}
  }
`)

export const allBookClubKitsQuery = defineQuery(`
  *[_type == "bookClubKit" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    ${bookClubKitFields}
  }
`)

export const bookClubKitPagesSlugs = defineQuery(`
  *[_type == "bookClubKit" && defined(slug.current)]
  {"slug": slug.current}
`)
