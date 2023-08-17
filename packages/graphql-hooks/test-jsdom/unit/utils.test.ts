import { isEqualFirstLevel, pipeP } from '../../src/utils'

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

  describe('isEqualFirstLevel', () => {
    it('returns true for two empty objects', () => {
      expect(isEqualFirstLevel({}, {})).toBe(true)
    })

    it('returns true for two objects with the same keys and values', () => {
      expect(isEqualFirstLevel({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
    })

    it('returns true for two objects with the same keys and values but different keys order', () => {
      expect(isEqualFirstLevel({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true)
    })

    it('returns true with the same object', () => {
      const obj = { a: 1, b: 2 }
      expect(isEqualFirstLevel(obj, obj)).toBe(true)
    })

    it('returns false for two objects with different keys', () => {
      expect(isEqualFirstLevel({ a: 1, b: 2 }, { a: 1, c: 2 })).toBe(false)
    })

    it('returns false for two objects with different values', () => {
      expect(isEqualFirstLevel({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false)
    })
  })
})
