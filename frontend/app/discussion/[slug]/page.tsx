import type {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'
import {type PortableTextBlock} from 'next-sanity'

import PortableText from '@/app/components/PortableText'
import Image from '@/app/components/SanityImage'
import Avatar from '@/app/components/Avatar'
import JsonLd, {articleJsonLd} from '@/app/components/JsonLd'
import {sanityFetch} from '@/sanity/lib/live'
import {discussionGuideQuery, discussionGuidePagesSlugs} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Props = {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: discussionGuidePagesSlugs,
    perspective: 'published',
    stega: false,
  })
  return data
}

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const {data: guide} = await sanityFetch({
    query: discussionGuideQuery,
    params,
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(guide?.bookCover)

  return {
    title: guide?.bookTitle ? `${guide.bookTitle} Discussion Questions` : guide?.title,
    description:
      guide?.seo?.metaDescription ||
      `Discussion questions for ${guide?.bookTitle} by ${guide?.bookAuthor}`,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

export default async function DiscussionGuidePage(props: Props) {
  const params = await props.params
  const [{data: guide}] = await Promise.all([
    sanityFetch({query: discussionGuideQuery, params}),
  ])

  if (!guide?._id) {
    return notFound()
  }

  const authorName =
    guide.author?.firstName && guide.author?.lastName
      ? `${guide.author.firstName} ${guide.author.lastName}`
      : undefined

  const jsonLd = articleJsonLd({
    headline: `${guide.bookTitle} - Discussion Questions`,
    description: guide.summary || undefined,
    authorName,
    datePublished: guide.date,
  })

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="container my-12 lg:my-24 grid gap-12">
        <div>
          <div className="pb-6 grid gap-6 mb-6 border-b border-gray-100">
            <div className="max-w-3xl flex flex-col gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
                Discussion Guide
              </span>
              <h1 className="text-4xl text-gray-900 sm:text-5xl lg:text-7xl">
                {guide.bookTitle}
              </h1>
              {guide.bookAuthor && (
                <p className="text-lg text-gray-600">by {guide.bookAuthor}</p>
              )}
            </div>
            <div className="max-w-3xl flex gap-4 items-center">
              {guide.author && guide.author.firstName && guide.author.lastName && (
                <Avatar person={guide.author} date={guide.date} />
              )}
            </div>
          </div>

          <article className="gap-8 grid max-w-4xl">
            {/* Book cover and summary */}
            <div className="flex flex-col sm:flex-row gap-6">
              {guide.bookCover && (
                <div className="shrink-0">
                  <Image
                    id={guide.bookCover.asset?._ref || ''}
                    alt={guide.bookCover.alt || `Cover of ${guide.bookTitle}`}
                    className="rounded-sm shadow-md"
                    width={200}
                    height={300}
                    mode="contain"
                  />
                </div>
              )}
              <div className="flex flex-col gap-4">
                {guide.summary && (
                  <p className="text-gray-600 leading-relaxed">{guide.summary}</p>
                )}
                {guide.affiliateUrl && (
                  <a
                    href={guide.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-flex items-center gap-2 bg-black text-white py-2.5 px-5 rounded-sm text-sm font-medium hover:bg-gray-800 transition-colors w-fit"
                  >
                    Buy the Book
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Introduction */}
            {guide.body?.length && (
              <PortableText
                className="max-w-2xl"
                value={guide.body as PortableTextBlock[]}
              />
            )}

            {/* Discussion Questions */}
            {guide.questions && guide.questions.length > 0 && (
              <div className="max-w-2xl">
                <h2 className="text-2xl mb-6">Discussion Questions</h2>
                <ol className="space-y-4">
                  {guide.questions.map((question, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="font-mono text-sm text-gray-400 mt-0.5 shrink-0 w-6 text-right">
                        {i + 1}.
                      </span>
                      <p className="text-gray-700 leading-relaxed">{question}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Paired recipe */}
            {guide.pairsWithRecipe && (
              <div className="max-w-2xl border-t border-gray-100 pt-6">
                <p className="text-sm text-gray-500 mb-2">Pairs with</p>
                <a
                  href={`/recipes/${guide.pairsWithRecipe.slug}`}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
                >
                  {guide.pairsWithRecipe.coverImage && (
                    <Image
                      id={guide.pairsWithRecipe.coverImage.asset?._ref || ''}
                      alt={guide.pairsWithRecipe.coverImage.alt || ''}
                      className="rounded-sm"
                      width={80}
                      height={80}
                      mode="cover"
                    />
                  )}
                  <div>
                    <span className="text-xs font-mono uppercase text-gray-500">Recipe</span>
                    <p className="font-medium">{guide.pairsWithRecipe.title}</p>
                  </div>
                </a>
              </div>
            )}
          </article>
        </div>
      </div>
    </>
  )
}
