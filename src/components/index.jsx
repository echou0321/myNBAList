import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';


const HomePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [topRatedPlayers, setTopRatedPlayers] = useState([]);
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const getNormalizedPlayerId = (player) =>
    `${player.Player.replace(/\s+/g, '-').toLowerCase()}-${player.Team.toLowerCase()}`;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTrendingPlayers = async () => {
      console.log('📍 Fetching trending players...');
      try {
        const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        console.log('🕒 Seven days ago:', sevenDaysAgo.toDate());

        const profileViewsSnapshot = await getDocs(collection(db, 'profileViews'));
        const trendingData = [];

        console.log('👤 Found player IDs:', profileViewsSnapshot.docs.map(d => d.id));

        for (const docSnap of profileViewsSnapshot.docs) {
          const playerId = docSnap.id;

          const visitsQuery = query(
            collection(db, 'profileViews', playerId, 'visits'),
            where('visitedAt', '>=', sevenDaysAgo)
          );
          const visitsSnapshot = await getDocs(visitsQuery);

          console.log(`🔍 Player: ${playerId}, visit count: ${visitsSnapshot.size}`);

          if (visitsSnapshot.size > 0) {
            const sampleDoc = visitsSnapshot.docs[0].data();
            console.log('🧾 Sample doc:', sampleDoc);

            trendingData.push({
              id: playerId,
              name: sampleDoc.playerName,
              img: sampleDoc.imgFile,
              count: visitsSnapshot.size,
            });
          }
        }

        trendingData.sort((a, b) => b.count - a.count);
        console.log('🎯 Final trending data:', trendingData);
        setTrending(trendingData.slice(0, 10));
      } catch (err) {
        console.error('❌ Failed to fetch trending players:', err);
      }
    };

    fetchTrendingPlayers();
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
                        <section id="top-rated-players">
              <h2>🏆 Top Rated Players</h2>
              <p className="leaderboard-description">
                Top rated players are ranked based on their highest overall fan rating across all categories.
              </p>
              <ol>
                {topRatedPlayers.map((player, index) => (
                  <Link to={`/playerprofile/${player.id}`} className="player-card-link" key={player.id}>
                    <li key={player.name}>
                      <img
                        src={`/playerIMGs/${player.img}.jpg`}
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
                      <span>{player.name} — 🔥 {player.count} visits</span>
                    </li>
                  </Link>
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


