// src/components/Login.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Firebase imports
import { auth } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

  // Subscribe to auth‐state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');

    try {
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
    <>
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
            <Link to="/home">Home</Link>
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
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid white',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </nav>
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
    </>
  );
}
