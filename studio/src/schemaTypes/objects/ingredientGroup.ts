import {defineField, defineType} from 'sanity'

export const ingredientGroup = defineType({
  name: 'ingredientGroup',
  title: 'Ingredient Group',
  type: 'object',
  fields: [
    defineField({
      name: 'groupName',
      title: 'Group Name',
      type: 'string',
      description: 'e.g. "Rose Syrup", "Dry Ingredients", "Frosting". Leave blank for a single group.',
    }),
    defineField({
      name: 'items',
      title: 'Ingredients',
      type: 'array',
      of: [{type: 'ingredientItem'}],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      groupName: 'groupName',
      items: 'items',
    },
    prepare({groupName, items}) {
      const count = items?.length || 0
      return {
        title: groupName || 'Ingredients',
        subtitle: `${count} ingredient${count === 1 ? '' : 's'}`,
      }
    },
  },
})
