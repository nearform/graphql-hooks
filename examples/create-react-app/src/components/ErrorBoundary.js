import React from 'react'
import T from 'prop-types'

function stringify(value) {
  return JSON.stringify(
    value,
    (key, value) => {
      if (key && typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch (err) {
          return value
        }
      }

      return value
    },
    2
  )
}

export default class ErrorBoundary extends React.Component {
  static propTypes = {
    children: T.node
  }

  constructor(props) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          <div>Something went wrong.</div>
          <details>
            <summary>
              <span>More details</span>
            </summary>
            <pre>{stringify(this.state.error)}</pre>
            <pre>{this.state.errorInfo?.componentStack}</pre>
          </details>
        </div>
      )
    }
    return this.props.children
  }
}
