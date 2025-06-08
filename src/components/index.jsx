import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const HomePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [topRatedPlayers, setTopRatedPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'ratings'));
        const playerMap = {};

        snapshot.forEach(doc => {
          const data = doc.data();
          const playerId = data.playerId;

          if (!playerMap[playerId]) {
            playerMap[playerId] = {
              total: 0,
              count: 0,
              playerId: playerId,
              playerName: data.playerName,
              imgFile: data.imgFile,
            };
          }

          playerMap[playerId].total += data.overall;
          playerMap[playerId].count += 1;
        });

        const players = Object.values(playerMap)
          .map(player => {
            const average = player.count > 0 ? (player.total / player.count).toFixed(1) : null;

            return {
              name: player.playerName || "Unknown",
              img: player.imgFile || "default",
              rating: average,
            };
          })
          .filter(p => p.rating !== null)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 10);

        setTopRatedPlayers(players);
      } catch (err) {
        console.error('Error fetching top players:', err);
      }
    };

    fetchTopPlayers();
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
          <img src="/icons/Basketball-icon.jpg" alt="Site Icon" className="logo-img" />
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
              {/* Left untouched for now */}
            </section>

            <section id="top-rated-players">
              <h2>🏆 Top Rated Players</h2>
              <p className="leaderboard-description">
                Top rated players are ranked based on their highest overall fan rating across all categories.
              </p>
              <ol>
                {topRatedPlayers.map((player, index) => (
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


