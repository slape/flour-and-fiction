import type {Metadata} from 'next'

import RecipeCard from '@/app/components/RecipeCard'
import {sanityFetch} from '@/sanity/lib/live'
import {allRecipesQuery} from '@/sanity/lib/queries'

export const metadata: Metadata = {
  title: 'Recipes',
  description: 'Book-inspired recipes for your next book club gathering.',
}

export default async function RecipesPage() {
  const {data: recipes} = await sanityFetch({query: allRecipesQuery})

  return (
    <div className="container my-12 lg:my-24">
      <div className="max-w-3xl mb-10">
        <h1 className="text-4xl text-gray-900 sm:text-5xl lg:text-7xl">Recipes</h1>
        <p className="mt-4 text-lg text-gray-600">
          Book-inspired recipes for your next book club gathering.
        </p>
      </div>

      {recipes && recipes.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} headingLevel="h2" />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No recipes yet. Check back soon.</p>
      )}
    </div>
  )
}
