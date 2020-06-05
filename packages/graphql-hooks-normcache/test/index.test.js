import normCache from '../src'

const initialState = {
  ROOT_QUERY: {
    posts: ['Post:123']
  },
  'Post:123': {
    id: '123',
    __typename: 'Post',
    author: 'Author:1',
    title: 'My awesome blog post',
    comments: ['Comment:324']
  },
  'Author:1': { id: '1', __typename: 'Author', name: 'Paul' },
  'Comment:324': {
    id: '324',
    __typename: 'Comment',
    commenter: 'Author:2'
  },
  'Author:2': { id: '2', __typename: 'Author', name: 'Nicole' }
}

const testKey = {
  operation: {
    query: `query TestQuery {
            posts {
            id
            __typename
            author {
                id
                __typename
                name
            }
            title
            comments {
                id
                __typename
                commenter {
                id
                __typename
                name
                }
            }
            }
        }`
  }
}

const testValue = {
  data: {
    posts: [
      {
        id: '123',
        __typename: 'Post',
        author: {
          id: '1',
          __typename: 'Author',
          name: 'Paul'
        },
        title: 'My awesome blog post',
        comments: [
          {
            id: '324',
            __typename: 'Comment',
            commenter: {
              id: '2',
              __typename: 'Author',
              name: 'Nicole'
            }
          }
        ]
      }
    ]
  },
  error: false
}

describe('normcache', () => {
  let cache
  beforeEach(() => {
    cache = normCache({ initialState })
  })
  it('sets and gets key', () => {
    cache.set(testKey, testValue)
    expect(cache.get(testKey)).toEqual(testValue)
  })
  it('gets value from a raw key', () => {
    expect(cache.rawGet('Post:123')).toEqual(initialState['Post:123'])
  })
  it('does not throw on delete', () => {
    expect(() => cache.delete(testKey)).not.toThrow()
  })
  it('lists all keys', () => {
    expect(cache.keys().length).toEqual(5)
  })
  it('clears all keys', () => {
    cache.clear()
    expect(cache.keys().length).toEqual(0)
  })
  it('returns initial state', () => {
    cache = normCache({ initialState })
    expect(cache.getInitialState()).toEqual(initialState)
  })
})
