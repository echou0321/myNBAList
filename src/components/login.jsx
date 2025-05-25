import React, { useState } from 'react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('Please enter both username and password.')
      return
    }
    setError('')
    console.log('Login attempt:', { username, password })
  }

  return (
    <>
      {}
      <header>
        <div className="site-logo">
          <img src="/icons/Basketball-icon.jpg" alt="Site Icon" className="logo-img" />
          <h1>MyNBAList</h1>
        </div>
        <nav>
          <div className="nav-left">
            <a href="/">Home</a>
            <a href="/browse">Browse Players</a>
            <a href="/5v5">My NBA 5v5</a>
            <a href="/userProfile">My Profile</a>
          </div>
          <div className="nav-right">
            <a href="/login">Login</a>
            <a href="/register">Register</a>
          </div>
        </nav>
      </header>

      {}
      <main>
        <div className="background-container">
          <div className="login-card">
            <h2 style={{ textAlign: 'center', color: '#c8102e', marginBottom: '2rem' }}>
              Login
            </h2>
            <form onSubmit={handleLogin}>
              <label>Username</label>
              <input
                type="text"
                className="placeholder"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />

              <label>Password</label>
              <input
                type="password"
                className="placeholder"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />

              {error && <p style={{ color: '#c8102e', marginTop: '0.5rem' }}>{error}</p>}

              <button type="submit" className="login-button">
                Log In
              </button>
            </form>

            <div className="login-link">
              <p>
                Don't have an account? <a href="/register">Sign up here</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {}
      <footer>
        <p>&copy; 2025 MyNBAList</p>
      </footer>
    </>
  )
}
