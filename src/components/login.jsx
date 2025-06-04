// src/components/Login.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ← Firebase imports
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  // Rename “username” state to hold the email string
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log('Logged in:', userCredential.user);

      // Redirect to "/home" (or any protected route)
      navigate('/home');
    } catch (firebaseError) {
      setError(firebaseError.message);
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
            <Link to="/userProfile">My Profile</Link>
          </div>
          <div className="nav-right">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
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
