import type { CollectionConfig } from '../../../../packages/payload/src/collections/config/types'

import { mediaSlug } from '../Media'
import { usersSlug } from '../Users'

export const postsSlug = 'posts'

export const PostsCollection: CollectionConfig = {
  defaultSort: 'title',
  fields: [
    {
      name: 'text',
      type: 'text',
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'associatedMedia',
      access: {
        create: () => true,
        update: () => false,
      },
      relationTo: mediaSlug,
      type: 'upload',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: usersSlug,
      required: true,
    },
  ],
  slug: postsSlug,
}
