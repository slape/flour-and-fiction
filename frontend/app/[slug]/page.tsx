import type {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'
import {type PortableTextBlock} from 'next-sanity'
import {Suspense} from 'react'

import PageBuilderPage from '@/app/components/PageBuilder'
import Avatar from '@/app/components/Avatar'
import {MorePosts} from '@/app/components/Posts'
import PortableText from '@/app/components/PortableText'
import Image from '@/app/components/SanityImage'
import JsonLd, {articleJsonLd} from '@/app/components/JsonLd'
import {sanityFetch} from '@/sanity/lib/live'
import {getPageQuery, postBySlugQuery, pageOrPostSlugs} from '@/sanity/lib/queries'
import {GetPageQueryResult} from '@/sanity.types'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Props = {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: pageOrPostSlugs,
    perspective: 'published',
    stega: false,
  })
  return data
}

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params

  // Try page first
  const {data: page} = await sanityFetch({query: getPageQuery, params, stega: false})
  if (page?._id) {
    return {title: page.name, description: page.heading} satisfies Metadata
  }

  // Try post
  const {data: post} = await sanityFetch({query: postBySlugQuery, params, stega: false})
  if (post?._id) {
    const previousImages = (await parent).openGraph?.images || []
    const ogImage = resolveOpenGraphImage(post.coverImage)
    return {
      title: post.title,
      description: post.excerpt,
      authors: post.author?.firstName && post.author?.lastName
        ? [{name: `${post.author.firstName} ${post.author.lastName}`}]
        : [],
      openGraph: {
        images: ogImage ? [ogImage, ...previousImages] : previousImages,
      },
    } satisfies Metadata
  }

  return {}
}

export default async function SlugPage(props: Props) {
  const params = await props.params

  // Try page first
  const {data: page} = await sanityFetch({query: getPageQuery, params})
  if (page?._id) {
    return (
      <div className="my-12 lg:my-24">
        <div className="container">
          <div className="pb-6 border-b border-gray-100">
            <div className="max-w-3xl">
              <h1 className="text-4xl text-gray-900 sm:text-5xl lg:text-7xl">{page.heading}</h1>
              <p className="mt-4 text-base lg:text-lg leading-relaxed text-gray-600 uppercase font-light">
                {page.subheading}
              </p>
            </div>
          </div>
        </div>
        <PageBuilderPage page={page as GetPageQueryResult} />
      </div>
    )
  }

  // Try post
  const {data: post} = await sanityFetch({query: postBySlugQuery, params})
  if (post?._id) {
    const authorName =
      post.author?.firstName && post.author?.lastName
        ? `${post.author.firstName} ${post.author.lastName}`
        : undefined

    const jsonLd = articleJsonLd({
      headline: post.title,
      description: post.excerpt || undefined,
      authorName,
      datePublished: post.date,
    })

    return (
      <>
        <JsonLd data={jsonLd} />
        <div className="container my-12 lg:my-24 grid gap-12">
          <div>
            <div className="pb-6 grid gap-6 mb-6 border-b border-gray-100">
              <div className="max-w-3xl flex flex-col gap-6">
                <h1 className="text-4xl text-gray-900 sm:text-5xl lg:text-7xl">{post.title}</h1>
              </div>
              <div className="max-w-3xl flex gap-4 items-center">
                {post.author && post.author.firstName && post.author.lastName && (
                  <Avatar person={post.author} date={post.date} />
                )}
              </div>
            </div>
            <article className="gap-6 grid max-w-4xl">
              {post.coverImage && (
                <Image
                  id={post.coverImage.asset?._ref || ''}
                  alt={post.coverImage.alt || ''}
                  className="rounded-sm w-full"
                  width={1024}
                  height={538}
                  mode="cover"
                  hotspot={post.coverImage.hotspot}
                  crop={post.coverImage.crop}
                />
              )}
              {post.content?.length && (
                <PortableText
                  className="max-w-2xl prose-headings:font-medium prose-headings:tracking-tight"
                  value={post.content as PortableTextBlock[]}
                />
              )}
            </article>
          </div>
        </div>
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="container py-12 lg:py-24 grid gap-12">
            <aside>
              <Suspense>{await MorePosts({skip: post._id, limit: 2})}</Suspense>
            </aside>
          </div>
        </div>
      </>
    )
  }

  return notFound()
}
