import React from 'react'
import { Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
// components
import NotFoundPage from './pages/NotFoundPage'
import PaginationPage from './pages/PaginationPage'

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
