import { render, screen } from './test-utils'
import Posts, { allPostsQuery } from '../src/components/Posts'
import React from 'react'

const localQueries = {
  [allPostsQuery]: () => ({
    allPosts: [
      {
        id: 1,
        title: 'Test',
        url: 'https://example.com'
      }
    ]
  })
}

describe('Posts', () => {
  it('should render successfully', async () => {
    render(<Posts />, {
      localQueries
    })

    expect(
      await screen.findByRole('link', {
        name: /Test/i
      })
    ).toBeTruthy()
  })
})
