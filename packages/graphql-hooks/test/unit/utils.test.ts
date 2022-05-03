import { pipeP } from '../../src/utils'

describe('GraphQLClient utils', () => {
  describe('pipeP', () => {
    it('pipes through sync functions in order', async () => {
      const mock = jest.fn()
      const fnA = () => {
        mock('fnA')
      }
      const fnB = () => mock('fnB')
      await pipeP([fnA, fnB])({})
      expect(mock).toHaveBeenCalledTimes(2)
      expect(mock.mock.calls).toEqual([['fnA'], ['fnB']])
    })

    it('pipes through async functions in order', async () => {
      const mock = jest.fn()
      const fnA = async () => {
        await new Promise(res => setTimeout(res, 20))
        mock('fnA')
      }
      const fnB = async () => {
        await new Promise(res => setTimeout(res, 30))
        mock('fnB')
      }
      await pipeP([fnA, fnB])({})
      expect(mock).toHaveBeenCalledTimes(2)
      expect(mock.mock.calls).toEqual([['fnA'], ['fnB']])
    })

    it('pipes through async and sync functions in order', async () => {
      const mock = jest.fn()
      const fnA = async () => {
        await new Promise(res => setTimeout(res, 20))
        mock('fnA')
      }
      const fnB = () => mock('fnB')
      const fnC = async () => {
        await new Promise(res => setTimeout(res, 30))
        mock('fnC')
      }
      await pipeP([fnA, fnB, fnC])({})
      expect(mock).toHaveBeenCalledTimes(3)
      expect(mock.mock.calls).toEqual([['fnA'], ['fnB'], ['fnC']])
    })
  })
})
