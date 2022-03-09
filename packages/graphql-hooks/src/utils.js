export const pipe = functions => value =>
  functions.reduce(
    (currentValue, currentFunction) => currentFunction(currentValue),
    value
  )
