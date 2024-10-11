import type { User } from './payload-types'

import payload from '../../packages/payload/src'
import { devUser } from '../credentials'
import { initPayloadTest } from '../helpers/configHelpers'
import { postsSlug } from './collections/Posts'
import { usersSlug } from './collections/Users'

require('isomorphic-fetch')

let apiUrl
let jwt
let exampleUser: User

const headers = {
  'Content-Type': 'application/json',
}
const { email, password } = devUser
describe('_Community Tests', () => {
  // --__--__--__--__--__--__--__--__--__
  // Boilerplate test setup/teardown
  // --__--__--__--__--__--__--__--__--__
  beforeAll(async () => {
    const { serverURL } = await initPayloadTest({ __dirname, init: { local: false } })
    apiUrl = `${serverURL}/api`

    const response = await fetch(`${apiUrl}/users/login`, {
      body: JSON.stringify({
        email,
        password,
      }),
      headers,
      method: 'post',
    })

    const data = await response.json()
    jwt = data.token
    exampleUser = (await payload.create({
      collection: usersSlug,
      data: {
        email: 'user@example.com',
        password: 'pa55w0rD',
      },
    })) as unknown as User
    if (!/[a-f]+/i.test(exampleUser.id)) {
      throw new Error('id must contain at least one alphabetical symbol')
    }
  })

  afterAll(async () => {
    if (typeof payload.db.destroy === 'function') {
      await payload.db.destroy(payload)
    }
  })

  // --__--__--__--__--__--__--__--__--__
  // You can run tests against the local API or the REST API
  // use the tests below as a guide
  // --__--__--__--__--__--__--__--__--__

  it('create example', async () => {
    const newPosts = await Promise.all([
      payload.create({
        collection: postsSlug,
        data: {
          text: 'LOWER CASE ID PASSING',
          author: exampleUser.id,
        },
        depth: 10,
        overrideAccess: true,
      }),
      payload.create({
        collection: postsSlug,
        data: {
          text: 'UPPER CASE ID PASSING',
          author: exampleUser.id.toUpperCase(),
        },
        depth: 10,
        overrideAccess: true,
      }),
    ])
    expect(newPosts).toHaveLength(2)
    // first post will be populated
    // but second will be just a string
    newPosts.forEach((post) => {
      expect(typeof post.author).toBe('object')
    })
  })

  it('find example', async () => {
    const newPosts = await Promise.all([
      payload.create({
        collection: postsSlug,
        data: {
          text: 'LOWER CASE ID PASSING',
          author: exampleUser.id,
        },
      }),
      payload.create({
        collection: postsSlug,
        data: {
          text: 'UPPER CASE ID PASSING',
          author: exampleUser.id.toUpperCase(),
        },
      }),
    ])

    expect(newPosts).toHaveLength(2)

    const posts = await payload.find({
      collection: postsSlug,
      where: {
        id: {
          in: newPosts.map((x) => x.id),
        },
      },
      depth: 10,
      overrideAccess: true,
    })

    expect(posts.totalDocs).toBe(2)
    posts.docs.forEach((doc) => {
      expect(typeof doc.author).toBe('object')
    })
  })

  it('rest API internal error', async () => {
    const res = await fetch(`${apiUrl}/${postsSlug}`, {
      method: 'POST',
      headers: {
        ...headers,
        Authorization: `JWT ${jwt}`,
      },
      body: JSON.stringify({
        text: 'REST API EXAMPLE',
        author: 'any value not casted to ObjectId',
      }),
    }).catch((e) => e)

    // passing wrong id via non localAPI is a client error, not a server
    expect(res.status).toBeGreaterThanOrEqual(400)
    expect(res.status).toBeLessThan(500)
  })
})
