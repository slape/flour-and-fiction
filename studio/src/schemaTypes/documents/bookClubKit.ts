import {defineField, defineType} from 'sanity'
import {PackageIcon} from 'lucide-react'

export const bookClubKit = defineType({
  name: 'bookClubKit',
  title: 'Book Club Kit',
  icon: PackageIcon,
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'bundle', title: 'Bundle Items'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Kit Title',
      type: 'string',
      group: 'content',
      description: 'e.g. "March 2026 Book Club Kit"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'month',
      title: 'Month',
      type: 'string',
      group: 'content',
      options: {
        list: [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December',
        ],
      },
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: 'Introduction',
      type: 'blockContent',
      group: 'content',
      description: 'Introduce this month\'s book club pick and what\'s included.',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
      ],
    }),
    defineField({
      name: 'bookPick',
      title: 'Book Pick',
      type: 'reference',
      group: 'bundle',
      to: [{type: 'post'}, {type: 'discussionGuide'}],
      description: 'The book review or discussion guide for this month.',
    }),
    defineField({
      name: 'recipe',
      title: 'Paired Recipe',
      type: 'reference',
      group: 'bundle',
      to: [{type: 'recipe'}],
      description: 'The recipe that pairs with this month\'s book.',
    }),
    defineField({
      name: 'discussionGuide',
      title: 'Discussion Guide',
      type: 'reference',
      group: 'bundle',
      to: [{type: 'discussionGuide'}],
      description: 'The discussion guide for this month\'s book.',
    }),
    defineField({
      name: 'journalPrompts',
      title: 'Journal Prompts',
      type: 'array',
      group: 'bundle',
      of: [{type: 'string'}],
      description: 'Reading journal prompts for this month\'s book.',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      group: 'content',
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
      title: 'title',
      month: 'month',
      year: 'year',
      media: 'coverImage',
    },
    prepare({title, month, year, media}) {
      return {
        title: title || 'Untitled Kit',
        subtitle: month && year ? `${month} ${year}` : 'Book Club Kit',
        media,
      }
    },
  },
})
