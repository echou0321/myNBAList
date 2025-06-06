// src/components/index.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const trendingPlayers = [
  { name: "Victor Wembanyama", img: "Wembanyama", rating: 9.0 },
  { name: "Anthony Edwards", img: "Edwards", rating: 9.2 },
  { name: "Ja Morant", img: "Morant", rating: 8.5 },
  { name: "Luka Dončić", img: "Doncic", rating: 9.6 },
  { name: "Tyrese Haliburton", img: "Haliburton", rating: 8.7 },
  { name: "Chet Holmgren", img: "Holmgren", rating: 8.3 },
  { name: "Zion Williamson", img: "Williamson", rating: 8.4 },
  { name: "Jalen Green", img: "JalenGreen", rating: 7.8 },
  { name: "Paolo Banchero", img: "Banchero", rating: 8.2 },
  { name: "LaMelo Ball", img: "Lamelo", rating: 8.0 },
];

const topRatedPlayers = [
  { name: "Nikola Jokić", img: "Jokic", rating: 9.8 },
  { name: "Giannis Antetokounmpo", img: "Antetokounmpo", rating: 9.7 },
  { name: "Shai Gilgeous-Alexander", img: "SGA", rating: 9.6 },
  { name: "Luka Dončić", img: "Doncic", rating: 9.5 },
  { name: "LeBron James", img: "Lebron", rating: 9.3 },
  { name: "Stephen Curry", img: "Steph", rating: 9.3 },
  { name: "Jayson Tatum", img: "Tatum", rating: 9.2 },
  { name: "Anthony Edwards", img: "Edwards", rating: 9.0 },
  { name: "Donovan Mitchell", img: "Mitchell", rating: 8.9 },
  { name: "Anthony Davis", img: "AD", rating: 8.7 },
];

const HomePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

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
        <div className="container">
          <section id="intro">
            <h2>Welcome to MyNBAList</h2>
            <p>
              Rate, rank, and discover NBA players based on fan opinions and official stats.
            </p>
          </section>

          <div className="player-lists">
            <section id="trending-players">
              <h2>🔥 Trending Players</h2>
              <p className="leaderboard-description">
                Trending players are ranked based on the number of votes received or changes in fan ratings this month.
              </p>
              <ol>
                {trendingPlayers.map((player) => (
                  <li key={player.name}>
                    <img
                      src={`/playerIMGs/${player.img}.jpg`}
                      alt={player.name}
                      className="player-img"
                    />
                    {` ${player.name} — ⭐ ${player.rating}`}
                  </li>
                ))}
              </ol>
            </section>

            <section id="top-rated-players">
              <h2>🏆 Top Rated Players</h2>
              <p className="leaderboard-description">
                Top rated players are ranked based on their highest overall fan rating across all categories.
              </p>
              <ol>
                {topRatedPlayers.map((player) => (
                  <li key={player.name}>
                    <img
                      src={`/playerIMGs/${player.img}.jpg`}
                      alt={player.name}
                      className="player-img"
                    />
                    {` ${player.name} — ⭐ ${player.rating}`}
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <section id="cta">
            <h2>Get Started</h2>
            <p>
              <Link to="/register">Create an Account</Link> or{' '}
              <Link to="/login">Log In</Link> to start building your Top 10 list.
            </p>
          </section>
        </div>
      </main>

      <footer>
        <p>&copy; 2025 MyNBAList</p>
      </footer>
    </>
  );
};

export default HomePage;
