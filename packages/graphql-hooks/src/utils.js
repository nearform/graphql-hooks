/**
 * Pipe with support for async functions
 * @param {array} array of functions
 * @returns single function
 */
export const pipeP = fns => arg =>
  fns.reduce((p, f) => p.then(f), Promise.resolve(arg))
