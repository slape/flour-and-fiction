import Link from 'next/link'
import type {Metadata} from 'next'

import Image from '@/app/components/SanityImage'
import {sanityFetch} from '@/sanity/lib/live'
import {allDiscussionGuidesQuery} from '@/sanity/lib/queries'

export const metadata: Metadata = {
  title: 'Discussion Guides',
  description: 'Book club discussion questions and guides for great conversation.',
}

export default async function DiscussionGuidesPage() {
  const {data: guides} = await sanityFetch({query: allDiscussionGuidesQuery})

  return (
    <div className="container my-12 lg:my-24">
      <div className="max-w-3xl mb-10">
        <h1 className="text-4xl text-gray-900 sm:text-5xl lg:text-7xl">Book Club</h1>
        <p className="mt-4 text-lg text-gray-600">
          Discussion questions and guides for your next book club meeting.
        </p>
      </div>

      {guides && guides.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <Link
              key={guide._id}
              href={`/discussion/${guide.slug}`}
              className="group border border-gray-200 rounded-sm overflow-hidden hover:shadow-md transition-shadow flex gap-4 p-4"
            >
              {guide.bookCover?.asset?._ref && (
                <div className="shrink-0">
                  <Image
                    id={guide.bookCover.asset._ref}
                    alt={guide.bookCover.alt || `Cover of ${guide.bookTitle}`}
                    className="rounded-sm shadow-sm"
                    width={100}
                    height={150}
                    mode="contain"
                  />
                </div>
              )}
              <div>
                <span className="text-xs font-mono uppercase text-gray-500">Discussion Guide</span>
                <h2 className="text-lg font-medium mt-1">{guide.bookTitle}</h2>
                {guide.bookAuthor && (
                  <p className="text-sm text-gray-500 mt-1">by {guide.bookAuthor}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No discussion guides yet. Check back soon.</p>
      )}
    </div>
  )
}
