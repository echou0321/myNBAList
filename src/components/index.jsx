import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { rtdb } from '../firebase';

const HomePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [topRatedPlayers, setTopRatedPlayers] = useState([]);
  const [trending, setTrending] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
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

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        const ratingsRef = ref(rtdb, 'ratings');
        const snapshot = await get(ratingsRef);

        if (!snapshot.exists()) {
          setTopRatedPlayers([]);
          return;
        }

        const allRatings = snapshot.val(); // playerId -> userId -> ratingObj
        const playerMap = {};

        for (const playerId in allRatings) {
          const userRatings = allRatings[playerId];
          for (const uid in userRatings) {
            const data = userRatings[uid];

            if (!playerMap[playerId]) {
              playerMap[playerId] = {
                total: 0,
                count: 0,
                playerName: data.playerName,
                imgFile: data.imgFile,
              };
            }

            playerMap[playerId].total += data.overall;
            playerMap[playerId].count += 1;
          }
        }

        const players = Object.entries(playerMap)
          .map(([playerId, player]) => ({
            id: playerId,
            name: player.playerName || "Unknown",
            img: player.imgFile || "default",
            rating: (player.total / player.count).toFixed(1),
          }))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 10);

        setTopRatedPlayers(players);
      } catch (err) {
        console.error('Error fetching top players from RTDB:', err);
      }
    };

    fetchTopPlayers();
  }, []);

  useEffect(() => {
    const fetchTrendingPlayers = async () => {
      try {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const profileViewsRef = ref(rtdb, 'profileViews');
        const snapshot = await get(profileViewsRef);

        if (!snapshot.exists()) {
          setTrending([]);
          return;
        }

        const trendingData = [];
        const profileViews = snapshot.val(); 

        for (const playerId in profileViews) {
          const visits = profileViews[playerId].visits;
          if (!visits) continue;

          let count = 0;
          let sampleData = null;

          for (const visitId in visits) {
            const visit = visits[visitId];
            if (visit.visitedAt >= sevenDaysAgo) {
              count++;
              if (!sampleData) sampleData = visit;
            }
          }

          if (count > 0 && sampleData) {
            trendingData.push({
              id: playerId,
              name: sampleData.playerName,
              img: sampleData.imgFile,
              count,
            });
          }
        }

        trendingData.sort((a, b) => b.count - a.count);
        setTrending(trendingData.slice(0, 10));
      } catch (err) {
        console.error('❌ Failed to fetch trending players from RTDB:', err);
      }
    };

    fetchTrendingPlayers();
  }, []);

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
            <p>Rate, rank, and discover NBA players based on fan opinions and official stats.</p>
          </section>

          <div className="player-lists">
            <section id="top-rated-players">
              <h2>🏆 Top Rated Players</h2>
              <p className="leaderboard-description">
                Top rated players are ranked based on their highest overall fan rating across all categories.
              </p>
              <ol>
                {topRatedPlayers.map((player) => (
                  <Link to={`/playerprofile/${player.id}`} className="player-card-link" key={player.id}>
                    <li>
                      <img
                        src={`/playerIMGs/${player.img || 'default'}.jpg`}
                        alt={player.name}
                        className="player-img"
                      />
                      {` ${player.name} — ⭐ ${player.rating}`}
                    </li>
                  </Link>
                ))}
              </ol>
            </section>

            <section id="trending-players">
              <h2>🔥 Trending Players</h2>
              <p className="leaderboard-description">
                Trending players are ranked by how many times their profile was viewed in the past week (7 days), including visits from both logged-in and guest users.
              </p>
              <ol>
                {trending.map((player) => (
                  <Link to={`/playerprofile/${player.id}`} className="player-card-link-trending" key={player.id}>
                    <li>
                      <img
                        src={`/playerIMGs/${player.img || 'default'}.jpg`}
                        alt={player.name}
                        className="player-img"
                      />
                      {` ${player.name} — 🔥 ${player.count} visits`}
                    </li>
                  </Link>
                ))}
              </ol>
            </section>
          </div>

          <section id="cta">
            <h2>Get Started</h2>
            <p>
              <Link to="/register">Create an Account</Link> or <Link to="/login">Log In</Link> to start building your Top 10 list.
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



