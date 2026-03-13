import {defineField, defineType} from 'sanity'
import {BookOpenIcon} from 'lucide-react'

export const discussionGuide = defineType({
  name: 'discussionGuide',
  title: 'Discussion Guide',
  icon: BookOpenIcon,
  type: 'document',
  groups: [
    {name: 'book', title: 'Book Info', default: true},
    {name: 'discussion', title: 'Discussion'},
    {name: 'connections', title: 'Connections'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'bookTitle',
      title: 'Book Title',
      type: 'string',
      group: 'book',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'book',
      options: {source: 'bookTitle', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bookAuthor',
      title: 'Book Author',
      type: 'string',
      group: 'book',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bookCover',
      title: 'Book Cover',
      type: 'image',
      group: 'book',
      options: {
        hotspot: true,
        aiAssist: {imageDescriptionField: 'alt'},
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
      ],
    }),
    defineField({
      name: 'summary',
      title: 'Book Summary',
      type: 'text',
      group: 'book',
      rows: 4,
      description: 'Brief summary of the book for readers who want context.',
    }),
    defineField({
      name: 'affiliateUrl',
      title: 'Buy the Book (Affiliate Link)',
      type: 'url',
      group: 'book',
      description: 'Amazon affiliate link to purchase the book.',
    }),
    defineField({
      name: 'body',
      title: 'Introduction',
      type: 'blockContent',
      group: 'discussion',
      description: 'Context, themes, or notes to set up the discussion.',
    }),
    defineField({
      name: 'questions',
      title: 'Discussion Questions',
      type: 'array',
      group: 'discussion',
      of: [{type: 'text', rows: 2}],
      description: 'Add each discussion question as a separate entry.',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'pairsWithRecipe',
      title: 'Pairs with Recipe',
      type: 'reference',
      group: 'connections',
      to: [{type: 'recipe'}],
      description: 'Link to the recipe that pairs with this book.',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      group: 'connections',
      to: [{type: 'person'}],
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      group: 'connections',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'bookTitle',
      author: 'bookAuthor',
      media: 'bookCover',
    },
    prepare({title, author, media}) {
      return {
        title: title || 'Untitled Guide',
        subtitle: author ? `by ${author}` : 'Discussion Guide',
        media,
      }
    },
  },
})
