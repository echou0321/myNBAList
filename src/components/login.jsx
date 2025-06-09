// src/components/Login.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { auth } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  // 1) Subscribe to Firebase auth state changes so we know if someone is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    // 2) Basic validation: ensure both fields are filled in
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');

    try { // 3) Sign in via Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Logged in:', userCredential.user);
      navigate('/home');
    } catch (firebaseError) {
      setError(firebaseError.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="site-header">
        <div className="site-logo">
          <img src="/icons/Basketball-icon.jpg" alt="Site Icon" className="logo-img" />
          <h1>MyNBAList</h1>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>
        </div>

        {/* Full menu for desktop */}
        <nav className="desktop-nav">
          <div className="nav-left">
            <Link to="/">Home</Link>
            <Link to="/browse">Browse Players</Link>
            <Link to="/5v5">My NBA 5v5</Link>
            <Link to="/profile">My Profile</Link>
          </div>
          <div className="nav-right">
            {currentUser ? (
              <>
                <span style={{ color: '#fff', fontWeight: '600', marginRight: '1rem' }}>
                  Hello, {currentUser.displayName || currentUser.email}
                </span>
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </nav>

        {/* Collapsible menu for mobile */}
        {menuOpen && (
          <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/browse" onClick={() => setMenuOpen(false)}>Browse Players</Link>
            <Link to="/5v5" onClick={() => setMenuOpen(false)}>My NBA 5v5</Link>
            <Link to="/profile" onClick={() => setMenuOpen(false)}>My Profile</Link>
            {currentUser ? (
              <>
                <button onClick={() => { setMenuOpen(false); handleLogout(); }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </nav>
        )}
      </header>

      <main>
        <div
          className="background-container"
          style={{ paddingTop: '4rem', paddingBottom: '4rem' }}
        >
          <div
            className="login-card"
            style={{
              backgroundColor: 'rgb(241, 242, 243)',
              backdropFilter: 'blur(12px)',
              padding: '3rem 2.5rem',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
              maxWidth: '400px',
              width: '100%',
              margin: '0 auto',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                color: '#c8102e',
                marginBottom: '0.5rem',
                fontSize: '2rem',
              }}
            >
              Login
            </h2>

            <form
              onSubmit={handleLogin}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div style={{ textAlign: 'left' }}>
                <label htmlFor="email" style={{ fontWeight: '600' }}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    marginTop: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div style={{ textAlign: 'left' }}>
                <label htmlFor="password" style={{ fontWeight: '600' }}>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    marginTop: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '1rem',
                  }}
                />
              </div>

              {error && (
                <p style={{ color: '#c8102e', fontWeight: '500', fontSize: '0.95rem' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#c8102e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                }}
              >
                Log In
              </button>
            </form>

            <p style={{ marginTop: '1.5rem', fontSize: '0.95rem' }}>
              Don’t have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: '#0b1f40',
                  fontWeight: '600',
                  textDecoration: 'underline',
                }}
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer>
        <p>&copy; 2025 MyNBAList</p>
      </footer>
    </div>
  );
}
