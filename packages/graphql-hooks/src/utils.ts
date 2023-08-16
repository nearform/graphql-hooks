/**
 * Pipe with support for async functions
 * @param {array} array of functions
 * @returns single function
 */
export const pipeP = (fns: (() => any)[]) => (arg: any) =>
  fns.reduce((p, f) => p.then(f), Promise.resolve(arg))

/**
 * Compares two objects for equality _only considering the first level of object keys_.
 * @example
 * var o1 = {a: 1, b: 2}
 * var o2 = {a: 1, b: 2}
 * isEqual(o1, o2) === true
 *
 * var o1 = {a: 2, b: 4}
 * var o2 = {a: 9, b: 'fish', c: 'why is this here?'}
 * isEqual(o1, o2) === false
 */
export function isEqualFirstLevel<T extends Record<string, any>>(
  obj1: T,
  obj2: T
): boolean {
  if (obj1 === obj2) return true

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || obj1[key] !== obj2[key]) {
      return false
    }
  }

  return true
}
