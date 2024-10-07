import type { Payload } from 'payload'

import path from 'path'
import { fileURLToPath } from 'url'

import type { NextRESTClient } from '../helpers/NextRESTClient.js'
import type { Post } from './payload-types.js'

import { initPayloadInt } from '../helpers/initPayloadInt.js'

let payload: Payload
let restClient: NextRESTClient

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
let post: Post
let postId: number | string

describe('Select Fields', () => {
  // --__--__--__--__--__--__--__--__--__
  // Boilerplate test setup/teardown
  // --__--__--__--__--__--__--__--__--__
  beforeAll(async () => {
    const initialized = await initPayloadInt(dirname)
    ;({ payload, restClient } = initialized)
    post = await createPost()
    postId = post.id
  })

  afterAll(async () => {
    if (typeof payload.db.destroy === 'function') {
      await payload.db.destroy()
    }
  })

  describe('Local API - Base', () => {
    it('should select id as default', async () => {
      const res = await payload.findByID({
        collection: 'posts',
        id: postId,
        select: {},
      })

      expect(res).toStrictEqual({
        id: postId,
      })
    })

    it('should select number', async () => {
      const res = await payload.findByID({
        collection: 'posts',
        id: postId,
        select: {
          number: true,
        },
      })

      expect(res).toStrictEqual({
        id: postId,
        number: post.number,
      })
    })

    it('should select number and text', async () => {
      const res = await payload.findByID({
        collection: 'posts',
        id: postId,
        select: {
          number: true,
          text: true,
        },
      })

      expect(res).toStrictEqual({
        id: postId,
        number: post.number,
        text: post.text,
      })
    })

    it('should select all the fields inside of array', async () => {
      const res = await payload.findByID({
        collection: 'posts',
        id: postId,
        select: {
          array: true,
        },
      })

      expect(res).toStrictEqual({
        id: postId,
        array: post.array,
      })
    })

    it('should select text field inside of array', async () => {
      const res = await payload.findByID({
        collection: 'posts',
        id: postId,
        select: {
          array: {
            text: true,
          },
        },
      })

      expect(res).toStrictEqual({
        id: postId,
        array: post.array.map((item) => ({
          id: item.id,
          text: item.text,
        })),
      })
    })

    it('should select all the fields inside of blocks', async () => {
      const res = await payload.findByID({
        collection: 'posts',
        id: postId,
        select: {
          blocks: true,
        },
      })

      expect(res).toStrictEqual({
        id: postId,
        blocks: res.blocks,
      })
    })

    it('should select all the fields inside of specific block', async () => {
      const res = await payload.findByID({
        collection: 'posts',
        id: postId,
        select: {
          blocks: {
            cta: true,
          },
        },
      })

      expect(res).toStrictEqual({
        id: postId,
        blocks: res.blocks.map((block) =>
          block.blockType === 'cta'
            ? block
            : {
                id: block.id,
                blockType: block.blockType,
              },
        ),
      })
    })

    it('should select a specific field inside of specific block', async () => {
      const res = await payload.findByID({
        collection: 'posts',
        id: postId,
        select: {
          blocks: {
            cta: { ctaText: true },
          },
        },
      })

      expect(res).toStrictEqual({
        id: postId,
        blocks: res.blocks.map((block) =>
          block.blockType === 'cta'
            ? { id: block.id, blockType: block.blockType, ctaText: block.ctaText }
            : {
                id: block.id,
                blockType: block.blockType,
              },
        ),
      })
    })
  })
})

function createPost() {
  return payload.create({
    collection: 'posts',
    data: {
      number: 1,
      text: 'text',
      blocks: [
        {
          blockType: 'cta',
          ctaText: 'cta-text',
          text: 'text',
        },
        {
          blockType: 'intro',
          introText: 'intro-text',
          text: 'text',
        },
      ],
      array: [
        {
          text: 'text',
          number: 1,
        },
      ],
    },
  })
}
