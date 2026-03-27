type JsonLdProps = {
  data: Record<string, unknown>
}

export default function JsonLd({data}: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
    />
  )
}

export function recipeJsonLd({
  name,
  image,
  description,
  prepTime,
  cookTime,
  servings,
  ingredients,
  steps,
  authorName,
  datePublished,
  url,
}: {
  name: string
  image?: string
  description?: string
  prepTime?: number | null
  cookTime?: number | null
  servings?: string | null
  ingredients?: string[]
  steps?: string[]
  authorName?: string
  datePublished?: string
  url?: string
}) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name,
    ...(image && {image: [image]}),
    ...(description && {description}),
    ...(prepTime && {prepTime: `PT${prepTime}M`}),
    ...(cookTime && {cookTime: `PT${cookTime}M`}),
    ...(prepTime && cookTime && {totalTime: `PT${prepTime + cookTime}M`}),
    ...(servings && {recipeYield: servings}),
    ...(ingredients?.length && {recipeIngredient: ingredients}),
    ...(steps?.length && {
      recipeInstructions: steps.map((step, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        text: step,
      })),
    }),
    ...(authorName && {
      author: {'@type': 'Person', name: authorName},
    }),
    ...(datePublished && {datePublished}),
    ...(url && {url}),
  }
  return data
}

export function articleJsonLd({
  headline,
  image,
  description,
  authorName,
  datePublished,
  url,
}: {
  headline: string
  image?: string
  description?: string
  authorName?: string
  datePublished?: string
  url?: string
}) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    ...(image && {image: [image]}),
    ...(description && {description}),
    ...(authorName && {
      author: {'@type': 'Person', name: authorName},
    }),
    ...(datePublished && {datePublished}),
    ...(url && {url}),
    publisher: {
      '@type': 'Organization',
      name: 'Flour & Fiction',
    },
  }
  return data
}
