// src/components/Register.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ← Firebase imports
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]       = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');

    try {
      // 1) Create new Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log('Registered user:', userCredential.user);

      // 2) Update the Firebase user’s displayName to be the “username”
      await updateProfile(userCredential.user, {
        displayName: username,
      });

      // 3) Redirect to /home (or any other page)
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
              Create Account
            </h2>

            <form
              onSubmit={handleRegister}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            >
              <div style={{ textAlign: 'left' }}>
                <label htmlFor="username" style={{ fontWeight: '600' }}>
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={inputStyle}
                />
              </div>

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
                  style={inputStyle}
                />
              </div>

              <div style={{ textAlign: 'left' }}>
                <label htmlFor="password" style={{ fontWeight: '600' }}>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ textAlign: 'left' }}>
                <label htmlFor="confirmPassword" style={{ fontWeight: '600' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
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
                  marginTop: '0.75rem',
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
                Register
              </button>
            </form>

            <p style={{ marginTop: '1.5rem', fontSize: '0.95rem' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: '#0b1f40',
                  fontWeight: '600',
                  textDecoration: 'underline',
                }}
              >
                Log in here
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

// Shared input style constant
const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  marginTop: '0.25rem',
  border: '1px solid #ccc',
  borderRadius: '6px',
  fontSize: '1rem',
};
