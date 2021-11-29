import React from 'react'
import * as ReactRouterDom from 'react-router-dom'
const { Link } = ReactRouterDom

// components
import NotFoundPage from './pages/NotFoundPage.js'
import PaginationPage from './pages/PaginationPage.js'
import HomePage from './pages/HomePage.js'

class AppShell extends React.Component {
  render() {
    return (
      <div className="app-shell-component">
        <h1>GraphQL Hooks</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/users">PaginationPage</Link>
        </nav>

        <HomePage path="/" />
        <PaginationPage path="/users" />
        <NotFoundPage default />
      </div>
    )
  }
}

AppShell.propTypes = {}

export default AppShell
