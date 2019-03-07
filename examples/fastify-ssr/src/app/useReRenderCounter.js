import React from 'react'

function useReRenderCounter() {
  const [count, updateCount] = React.useState(0)

  return {
    count,
    updateCount
  }
}

module.exports = useReRenderCounter
