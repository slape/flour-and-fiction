import {person} from './documents/person'
import {page} from './documents/page'
import {post} from './documents/post'
import {recipe} from './documents/recipe'
import {discussionGuide} from './documents/discussionGuide'
import {bookClubKit} from './documents/bookClubKit'
import {callToAction} from './objects/callToAction'
import {infoSection} from './objects/infoSection'
import {settings} from './singletons/settings'
import {link} from './objects/link'
import {blockContent} from './objects/blockContent'
import button from './objects/button'
import {blockContentTextOnly} from './objects/blockContentTextOnly'
import {seo} from './objects/seo'
import {ingredientGroup} from './objects/ingredientGroup'
import {ingredientItem} from './objects/ingredientItem'

export const schemaTypes = [
  // Singletons
  settings,
  // Documents
  page,
  post,
  recipe,
  discussionGuide,
  bookClubKit,
  person,
  // Objects
  button,
  blockContent,
  blockContentTextOnly,
  infoSection,
  callToAction,
  link,
  seo,
  ingredientGroup,
  ingredientItem,
]
