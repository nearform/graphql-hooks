import { render, screen, fireEvent, waitFor } from './test-utils'
import CreatePost, { createPostMutation } from '../src/components/CreatePost'
import React from 'react'

const localQueries = {
  [createPostMutation]: () => ({ createPost: { id: 1 } })
}

describe('CreatePost', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should submit the new post', async () => {
    const createPostSpy = jest.spyOn(localQueries, createPostMutation)

    render(<CreatePost />, {
      localQueries
    })

    fireEvent.input(
      screen.getByRole('textbox', {
        name: /title/i
      }),
      {
        target: {
          value: 'Test'
        }
      }
    )

    fireEvent.input(
      screen.getByRole('textbox', {
        name: /url/i
      }),
      {
        target: {
          value: 'https://example.com'
        }
      }
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: /Add post/i
      })
    )

    waitFor(() =>
      expect(createPostSpy).toHaveBeenCalledWith({
        title: 'Test',
        url: 'https://example.com'
      })
    )
  })
})
