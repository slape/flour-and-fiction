import {defineField, defineType} from 'sanity'

export const ingredientItem = defineType({
  name: 'ingredientItem',
  title: 'Ingredient',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Ingredient',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'affiliateUrl',
      title: 'Affiliate Link',
      type: 'url',
      description: 'Optional Amazon affiliate link for this ingredient',
    }),
  ],
  preview: {
    select: {
      title: 'text',
      affiliateUrl: 'affiliateUrl',
    },
    prepare({title, affiliateUrl}) {
      return {
        title: title || 'Untitled ingredient',
        subtitle: affiliateUrl ? '🔗 Has affiliate link' : undefined,
      }
    },
  },
})
