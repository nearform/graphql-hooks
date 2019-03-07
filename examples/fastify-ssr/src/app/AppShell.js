import React from 'react'
import { Link, Router } from '@reach/router'

// components
import NotFoundPage from './pages/NotFoundPage'
import HomePage from './pages/HomePage'
import ArticlePage from './pages/ArticlePage'
import PaginationPage from './pages/PaginationPage'

class AppShell extends React.Component {
  render() {
    return (
      <div className="app-shell-component">
        <h1>GraphQL Hooks</h1>
        <nav>
          <Link to="/">Home</Link> <Link to="/article/sluggy">Article</Link>{' '}
          <Link to="/users">PaginationPage</Link>
        </nav>
        <Router>
          <HomePage path="/" />
          <ArticlePage path="/article/:slug" />
          <PaginationPage path="/users" />
          <NotFoundPage default />
        </Router>
      </div>
    )
  }
}

AppShell.propTypes = {}

export default AppShell
