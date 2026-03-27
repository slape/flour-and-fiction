import {Suspense} from 'react'
import Image from 'next/image'
import Link from 'next/link'

import {EXPLORE_CATEGORIES} from '@/app/lib/navigation'
import {sanityFetch} from '@/sanity/lib/live'
import {recentPostsQuery} from '@/sanity/lib/queries'
import {RecentPostsQueryResult} from '@/sanity.types'
import SanityImage from '@/app/components/SanityImage'

function PostCard({post}: {post: RecentPostsQueryResult[number]}) {
  return (
    <Link href={`/${post.slug}`} className="group block no-underline">
      {post.coverImage?.asset?._ref && (
        <div className="mb-3 overflow-hidden aspect-[4/3]">
          <SanityImage
            id={post.coverImage.asset._ref}
            width={400}
            height={300}
            className="w-full h-full object-cover"
            alt={post.title || ''}
          />
        </div>
      )}
      <h3 className="font-serif text-lg group-hover:text-crimson transition-colors text-black">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>
      )}
    </Link>
  )
}

async function LatestPosts() {
  const {data: posts} = await sanityFetch({query: recentPostsQuery})
  if (!posts || posts.length === 0) return null

  return (
    <section className="container py-12 lg:py-16">
      <h2 className="text-2xl mb-8 text-center font-serif">Latest Posts</h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-wide mx-auto">
        {posts.map((post: RecentPostsQueryResult[number]) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  )
}

function ExploreSection() {
  return (
    <section className="container py-12 lg:py-16">
      <h2 className="text-2xl mb-8 text-center font-serif">Explore</h2>
      <div className="grid grid-cols-3 gap-4 max-w-wide mx-auto">
        {EXPLORE_CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="relative aspect-[4/3] overflow-hidden group no-underline"
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-2xl sm:text-3xl font-serif tracking-wide uppercase">
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default async function Page() {
  return (
    <>
      {/* Hero */}
      <div className="container">
        <div className="max-w-3xl mx-auto text-center py-16 lg:py-20">
          <h1 className="text-4xl sm:text-5xl font-serif text-black">
            Welcome, Bakers and Booklovers!
          </h1>
          <p className="mt-3 text-lg text-gray-500 italic">Let&apos;s get cozy.</p>
        </div>
      </div>

      {/* Literary Baking Adventure */}
      <div className="bg-gray-50">
        <div className="container py-12 lg:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-serif mb-4">
              Go on a Literary
              <br />
              Baking Adventure
            </h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Let books inspire your baking. Learn how to become a better baker, and explore
              the world through literature and food!
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Join our newsletter for creative recipes, book reviews, and tea recommendations.
            </p>

            {/* Newsletter signup */}
            <form
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              action="#"
            >
              <input
                type="text"
                placeholder="Name"
                className="flex-1 px-4 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-crimson"
              />
              <input
                type="email"
                placeholder="Email"
                className="flex-1 px-4 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-crimson"
              />
              <button
                type="submit"
                className="bg-crimson text-white px-6 py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-crimson-dark transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Seasonal Feature */}
      <div className="border-t border-gray-200">
        <div className="container py-12 lg:py-16">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Featured</p>
            <h2 className="text-3xl font-serif mb-3">Spring Has Sprung</h2>
            <p className="text-gray-600 leading-relaxed">
              Fruity bakes, floral teas, bright flavors, and rainy days that are made for you
              and your next great read.
            </p>
          </div>
        </div>
      </div>

      {/* Latest Posts */}
      <div className="border-t border-gray-200">
        <Suspense>{await LatestPosts()}</Suspense>
      </div>

      {/* Explore */}
      <ExploreSection />
    </>
  )
}
