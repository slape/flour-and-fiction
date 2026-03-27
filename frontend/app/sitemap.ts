import {MetadataRoute} from 'next'
import {sanityFetch} from '@/sanity/lib/live'
import {sitemapData} from '@/sanity/lib/queries'
import {headers} from 'next/headers'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allContent = await sanityFetch({
    query: sitemapData,
  })
  const headersList = await headers()
  const sitemap: MetadataRoute.Sitemap = []
  const domain: string = headersList.get('host') as string
  sitemap.push({
    url: domain as string,
    lastModified: new Date(),
    priority: 1,
    changeFrequency: 'monthly',
  })

  if (allContent != null && allContent.data.length != 0) {
    for (const p of allContent.data) {
      let priority: number = 0.5
      let changeFrequency: 'monthly' | 'weekly' | 'never' = 'never'
      let url: string = ''

      switch (p._type) {
        case 'page':
          priority = 0.8
          changeFrequency = 'monthly'
          url = `${domain}/${p.slug}`
          break
        case 'post':
          priority = 0.6
          changeFrequency = 'never'
          url = `${domain}/${p.slug}`
          break
        case 'recipe':
          priority = 0.7
          changeFrequency = 'monthly'
          url = `${domain}/recipes/${p.slug}`
          break
        case 'discussionGuide':
          priority = 0.7
          changeFrequency = 'monthly'
          url = `${domain}/discussion/${p.slug}`
          break
        case 'bookClubKit':
          priority = 0.6
          changeFrequency = 'monthly'
          url = `${domain}/kits/${p.slug}`
          break
      }
      if (url) {
        sitemap.push({
          lastModified: p._updatedAt || new Date(),
          priority,
          changeFrequency,
          url,
        })
      }
    }
  }

  return sitemap
}
