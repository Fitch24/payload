import type { GlobalConfig } from 'payload'

export const menuSlug = 'menu'

export const MenuGlobal: GlobalConfig = {
  slug: menuSlug,
  fields: [
    {
      name: 'globalText',
      type: 'text',
      defaultValue: () => 'This field must have default value if no "global" document exists in db',
    },
  ],
}
