import type {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'
import {type PortableTextBlock} from 'next-sanity'
import Link from 'next/link'

import PortableText from '@/app/components/PortableText'
import Image from '@/app/components/SanityImage'
import {sanityFetch} from '@/sanity/lib/live'
import {bookClubKitQuery, bookClubKitPagesSlugs} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import {formatTime} from '@/app/lib/formatTime'

type Props = {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: bookClubKitPagesSlugs,
    perspective: 'published',
    stega: false,
  })
  return data
}

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const {data: kit} = await sanityFetch({
    query: bookClubKitQuery,
    params,
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(kit?.coverImage)

  return {
    title: kit?.title,
    description:
      kit?.seo?.metaDescription ||
      `${kit?.title} - Everything you need for book club this month`,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

export default async function BookClubKitPage(props: Props) {
  const params = await props.params
  const [{data: kit}] = await Promise.all([sanityFetch({query: bookClubKitQuery, params})])

  if (!kit?._id) {
    return notFound()
  }

  return (
    <div className="container my-12 lg:my-24 grid gap-12">
      <div>
        <div className="pb-6 grid gap-6 mb-6 border-b border-gray-100">
          <div className="max-w-3xl flex flex-col gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
              {kit.month && kit.year ? `${kit.month} ${kit.year}` : 'Book Club Kit'}
            </span>
            <h1 className="text-4xl text-gray-900 sm:text-5xl lg:text-7xl">{kit.title}</h1>
          </div>
        </div>

        <article className="gap-8 grid max-w-4xl">
          {kit.coverImage && (
            <Image
              id={kit.coverImage.asset?._ref || ''}
              alt={kit.coverImage.alt || ''}
              className="rounded-sm w-full"
              width={1024}
              height={538}
              mode="cover"
              hotspot={kit.coverImage.hotspot}
              crop={kit.coverImage.crop}
            />
          )}

          {/* Introduction */}
          {kit.body?.length && (
            <PortableText
              className="max-w-2xl"
              value={kit.body as PortableTextBlock[]}
            />
          )}

          {/* Bundle items */}
          <div className="max-w-2xl space-y-4">
            <h2 className="text-2xl">What's Included</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Book Pick */}
              {kit.bookPick && (
                <Link
                  href={kit.bookPick._type === 'discussionGuide'
                    ? `/discussion/${kit.bookPick.slug}`
                    : `/posts/${kit.bookPick.slug}`}
                  className="p-4 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-mono uppercase text-gray-500 block mb-1">
                    Book Pick
                  </span>
                  <p className="font-medium">
                    {kit.bookPick.bookTitle || kit.bookPick.title}
                  </p>
                </Link>
              )}

              {/* Recipe */}
              {kit.recipe && (
                <Link
                  href={`/recipes/${kit.recipe.slug}`}
                  className="p-4 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors flex gap-4"
                >
                  <div>
                    <span className="text-xs font-mono uppercase text-gray-500 block mb-1">
                      Paired Recipe
                    </span>
                    <p className="font-medium">{kit.recipe.title}</p>
                    {(kit.recipe.prepTime || kit.recipe.cookTime) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {[
                          kit.recipe.prepTime && `${formatTime(kit.recipe.prepTime)} prep`,
                          kit.recipe.cookTime && `${formatTime(kit.recipe.cookTime)} cook`,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                </Link>
              )}

              {/* Discussion Guide */}
              {kit.discussionGuide && (
                <Link
                  href={`/discussion/${kit.discussionGuide.slug}`}
                  className="p-4 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-mono uppercase text-gray-500 block mb-1">
                    Discussion Guide
                  </span>
                  <p className="font-medium">{kit.discussionGuide.bookTitle}</p>
                  {kit.discussionGuide.bookAuthor && (
                    <p className="text-xs text-gray-500 mt-1">
                      by {kit.discussionGuide.bookAuthor}
                    </p>
                  )}
                </Link>
              )}
            </div>
          </div>

          {/* Journal Prompts */}
          {kit.journalPrompts && kit.journalPrompts.length > 0 && (
            <div className="max-w-2xl">
              <h2 className="text-2xl mb-4">Journal Prompts</h2>
              <ol className="space-y-3">
                {kit.journalPrompts.map((prompt, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="font-mono text-sm text-gray-400 mt-0.5 shrink-0 w-6 text-right">
                      {i + 1}.
                    </span>
                    <p className="text-gray-700 leading-relaxed">{prompt}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </article>
      </div>
    </div>
  )
}
