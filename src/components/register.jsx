import React, { useState } from 'react'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleRegister = (e) => {
    e.preventDefault()
    if (!username.trim() || !email.trim() || !password) {
      setError('All fields are required.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    console.log('Registering:', { username, email, password })
  }

  return (
    <>
      {}
      <header>
        <div className="site-logo">
          <img
            src="/icons/Basketball-icon.jpg"
            alt="Site Icon"
            className="logo-img"
          />
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
              Create Account
            </h2>

            <form onSubmit={handleRegister}>
              <label>Username</label>
              <input
                type="text"
                className="placeholder"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <label>Email</label>
              <input
                type="email"
                className="placeholder"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label>Password</label>
              <input
                type="password"
                className="placeholder"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <label>Confirm Password</label>
              <input
                type="password"
                className="placeholder"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {error && (
                <p style={{ color: '#c8102e', marginTop: '0.5rem' }}>{error}</p>
              )}

              <button type="submit" className="login-button">
                Register
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              Already have an account?{' '}
              <a href="/login" style={{ color: '#0b1f40', fontWeight: 'bold' }}>
                Log in here
              </a>
            </p>
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
