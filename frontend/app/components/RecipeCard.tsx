import Link from 'next/link'

import Image from '@/app/components/SanityImage'
import {AllRecipesQueryResult} from '@/sanity.types'

type RecipeCardProps = {
  recipe: AllRecipesQueryResult[number]
  headingLevel?: 'h2' | 'h3'
}

export default function RecipeCard({recipe, headingLevel: Heading = 'h3'}: RecipeCardProps) {
  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group border border-gray-200 rounded-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      {recipe.coverImage?.asset?._ref && (
        <div className="aspect-[4/3] overflow-hidden">
          <Image
            id={recipe.coverImage.asset._ref}
            alt={recipe.coverImage.alt || ''}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            width={400}
            height={300}
            mode="cover"
          />
        </div>
      )}
      <div className="p-4">
        {recipe.course && (
          <span className="text-xs font-mono uppercase text-gray-500">{recipe.course}</span>
        )}
        <Heading className="text-lg font-medium mt-1">{recipe.title}</Heading>
        {(recipe.prepTime || recipe.cookTime) && (
          <p className="text-xs text-gray-500 mt-2">
            {[
              recipe.prepTime && `${recipe.prepTime} min prep`,
              recipe.cookTime && `${recipe.cookTime} min cook`,
            ].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </Link>
  )
}
