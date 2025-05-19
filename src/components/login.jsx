import React, { useState } from 'react'
import '../css/style.css'  // adjust path if your CSS lives elsewhere

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
    // TODO: hook this up to your real auth API
    console.log('Login attempt:', { username, password })
  }

  return (
    <>
      {/* Header/Nav */}
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

      {/* Login Form */}
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
                placeholder="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />

              <label>Password</label>
              <input
                type="password"
                className="placeholder"
                placeholder="password"
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

      {/* Footer */}
      <footer>
        <p>&copy; 2025 MyNBAList</p>
      </footer>
    </>
  )
}
