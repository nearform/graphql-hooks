/**
 * Pipe with support for async functions
 * @param {array} array of functions
 * @returns single function
 */
export const pipeP = (fns: (() => any)[]) => (arg: any) =>
  fns.reduce((p, f) => p.then(f), Promise.resolve(arg))
