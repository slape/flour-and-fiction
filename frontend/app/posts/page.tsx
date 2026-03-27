import type {Metadata} from 'next'
import {Suspense} from 'react'

import {AllPosts} from '@/app/components/Posts'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Baking tips, book reviews, tea recommendations, and more from Flour & Fiction.',
}

export default async function PostsPage() {
  return (
    <div className="container my-12 lg:my-24">
      <div className="max-w-3xl mb-10">
        <h1 className="text-4xl text-gray-900 sm:text-5xl lg:text-7xl">Blog</h1>
        <p className="mt-4 text-lg text-gray-600">
          Baking tips, book reviews, tea recommendations, and more.
        </p>
      </div>
      <Suspense>{await AllPosts()}</Suspense>
    </div>
  )
}
