import {CogIcon} from '@sanity/icons'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S: StructureBuilder) =>
  S.list()
    .title('Flour & Fiction')
    .items([
      S.documentTypeListItem('post').title('Posts'),
      S.documentTypeListItem('recipe').title('Recipes'),
      S.documentTypeListItem('discussionGuide').title('Discussion Guides'),
      S.documentTypeListItem('bookClubKit').title('Book Club Kits'),
      S.divider(),
      S.documentTypeListItem('person').title('Authors'),
      S.documentTypeListItem('page').title('Pages'),
      S.divider(),
      S.listItem()
        .title('Site Settings')
        .child(S.document().schemaType('settings').documentId('siteSettings'))
        .icon(CogIcon),
    ])
