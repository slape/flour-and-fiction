import type {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'
import {type PortableTextBlock} from 'next-sanity'

import PortableText from '@/app/components/PortableText'
import Image from '@/app/components/SanityImage'
import Avatar from '@/app/components/Avatar'
import JsonLd, {recipeJsonLd} from '@/app/components/JsonLd'
import {sanityFetch} from '@/sanity/lib/live'
import {recipeQuery, recipePagesSlugs} from '@/sanity/lib/queries'
import {resolveOpenGraphImage, urlForImage} from '@/sanity/lib/utils'
import {formatTime} from '@/app/lib/formatTime'

type Props = {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: recipePagesSlugs,
    perspective: 'published',
    stega: false,
  })
  return data
}

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const {data: recipe} = await sanityFetch({
    query: recipeQuery,
    params,
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(recipe?.coverImage)

  return {
    title: recipe?.title,
    description: recipe?.seo?.metaDescription || `${recipe?.title} - A recipe from Flour & Fiction`,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

export default async function RecipePage(props: Props) {
  const params = await props.params
  const [{data: recipe}] = await Promise.all([sanityFetch({query: recipeQuery, params})])

  if (!recipe?._id) {
    return notFound()
  }

  const allIngredients: string[] = []
  if (recipe.ingredients) {
    for (const group of recipe.ingredients) {
      if (group.items) {
        for (const item of group.items) {
          if (item.text) allIngredients.push(item.text)
        }
      }
    }
  }

  const authorName =
    recipe.author?.firstName && recipe.author?.lastName
      ? `${recipe.author.firstName} ${recipe.author.lastName}`
      : undefined

  const imageUrl = recipe.coverImage
    ? urlForImage(recipe.coverImage)?.width(1200).url()
    : undefined

  const jsonLd = recipeJsonLd({
    name: recipe.title,
    image: imageUrl,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    ingredients: allIngredients,
    steps: recipe.steps || [],
    authorName,
    datePublished: recipe.date,
  })

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="container my-12 lg:my-24 grid gap-12">
        <div>
          <div className="pb-6 grid gap-6 mb-6 border-b border-gray-100">
            <div className="max-w-3xl flex flex-col gap-2">
              {recipe.course && (
                <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
                  {recipe.course}
                </span>
              )}
              <h1 className="text-4xl text-gray-900 sm:text-5xl lg:text-7xl">{recipe.title}</h1>
              {recipe.cuisine && (
                <p className="text-sm text-gray-500">{recipe.cuisine} cuisine</p>
              )}
            </div>
            <div className="max-w-3xl flex gap-4 items-center">
              {recipe.author && recipe.author.firstName && recipe.author.lastName && (
                <Avatar person={recipe.author} date={recipe.date} />
              )}
            </div>
          </div>

          <article className="gap-8 grid max-w-4xl">
            {recipe.coverImage && (
              <Image
                id={recipe.coverImage.asset?._ref || ''}
                alt={recipe.coverImage.alt || ''}
                className="rounded-sm w-full"
                width={1024}
                height={538}
                mode="cover"
                hotspot={recipe.coverImage.hotspot}
                crop={recipe.coverImage.crop}
              />
            )}

            {/* Time and servings bar */}
            {(recipe.prepTime || recipe.cookTime || recipe.servings) && (
              <div className="flex flex-wrap gap-6 text-sm border border-gray-200 rounded-sm p-4 bg-gray-50">
                {recipe.prepTime && (
                  <div>
                    <span className="font-mono text-xs uppercase text-gray-500 block">Prep</span>
                    <span className="font-medium">{formatTime(recipe.prepTime)}</span>
                  </div>
                )}
                {recipe.cookTime && (
                  <div>
                    <span className="font-mono text-xs uppercase text-gray-500 block">Cook</span>
                    <span className="font-medium">{formatTime(recipe.cookTime)}</span>
                  </div>
                )}
                {recipe.prepTime && recipe.cookTime && (
                  <div>
                    <span className="font-mono text-xs uppercase text-gray-500 block">Total</span>
                    <span className="font-medium">{formatTime(recipe.prepTime + recipe.cookTime)}</span>
                  </div>
                )}
                {recipe.servings && (
                  <div>
                    <span className="font-mono text-xs uppercase text-gray-500 block">Servings</span>
                    <span className="font-medium">{recipe.servings}</span>
                  </div>
                )}
              </div>
            )}

            {/* Introduction */}
            {recipe.body?.length && (
              <PortableText
                className="max-w-2xl"
                value={recipe.body as PortableTextBlock[]}
              />
            )}

            {/* Ingredients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="max-w-2xl">
                <h2 className="text-2xl mb-4">Ingredients</h2>
                {recipe.ingredients.map((group, i) => (
                  <div key={i} className="mb-4">
                    {group.groupName && (
                      <h3 className="text-lg font-medium mb-2">{group.groupName}</h3>
                    )}
                    <ul className="space-y-1.5">
                      {group.items?.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-gray-700">
                          <span className="text-gray-300 mt-1.5 block w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                          {item.affiliateUrl ? (
                            <a
                              href={item.affiliateUrl}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              className="underline decoration-brand/40 hover:decoration-brand"
                            >
                              {item.text}
                            </a>
                          ) : (
                            <span>{item.text}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Equipment */}
            {recipe.equipment && recipe.equipment.length > 0 && (
              <div className="max-w-2xl">
                <h2 className="text-2xl mb-4">Equipment</h2>
                <ul className="space-y-1.5">
                  {recipe.equipment.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <span className="mt-1.5 block w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Steps */}
            {recipe.steps && recipe.steps.length > 0 && (
              <div className="max-w-2xl">
                <h2 className="text-2xl mb-4">Instructions</h2>
                <ol className="space-y-4">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="font-mono text-sm text-gray-400 mt-0.5 shrink-0 w-6 text-right">
                        {i + 1}.
                      </span>
                      <p className="text-gray-700 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Notes */}
            {recipe.notes && (
              <div className="max-w-2xl border-t border-gray-100 pt-6">
                <h2 className="text-2xl mb-2">Notes</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{recipe.notes}</p>
              </div>
            )}

            {/* Pairs with book */}
            {recipe.pairsWithBook && (
              <div className="max-w-2xl border-t border-gray-100 pt-6">
                <p className="text-sm text-gray-500">
                  This recipe pairs with{' '}
                  <a
                    href={`/posts/${recipe.pairsWithBook.slug}`}
                    className="text-brand underline hover:text-gray-900"
                  >
                    {recipe.pairsWithBook.title}
                  </a>
                </p>
              </div>
            )}
          </article>
        </div>
      </div>
    </>
  )
}
