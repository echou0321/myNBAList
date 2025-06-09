import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { auth, rtdb } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref , push, set, get, remove, update } from "firebase/database";

function PlayerProfile() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [ratings, setRatings] = useState({
    shooting: '', dunking: '', defense: '', playmaking: '', rebounding: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [averageRating, setAverageRating] = useState(null);
  const navigate = useNavigate();
  const visitLogged = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const getNormalizedPlayerId = (player) =>
    `${player.Player.replace(/\s+/g, '-').toLowerCase()}-${player.Team.toLowerCase()}`;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetch('/data/players.json')
      .then(res => res.json())
      .then(data => {
        const playerData = data.find(p =>
          `${p.Player}-${p.Team}`.replace(/\s+/g, '-').toLowerCase() === id
        );
        setPlayer(playerData);
      })
      .catch(err => console.error("Failed to load player data", err));
  }, [id]);

  useEffect(() => {
    if (!player) return;

    const playerId = getNormalizedPlayerId(player);
    const sessionKey = `visited-${playerId}`;
    if (sessionStorage.getItem(sessionKey) || visitLogged.current) return;

    visitLogged.current = true;

    const logVisit = async () => {
      try {
        const parentRef = ref(rtdb, `profileViews/${playerId}`);
        await update(parentRef, { updatedAt: Date.now() });  // ✅ safe

        const visitsRef = ref(rtdb, `profileViews/${playerId}/visits`);
        await push(visitsRef, {
          visitedAt: Date.now(),
          playerName: player.Player,
          imgFile: player.Player.replace(/\s+/g, '-'),
          userId: currentUser?.uid || 'anonymous',
        });

        sessionStorage.setItem(sessionKey, 'true');
        console.log(`✅ Visit logged for ${player.Player}`);
      } catch (err) {
        console.error('Error logging visit in RTDB:', err);
      }
    };

    logVisit();
  }, [player]);

  const fetchUserRating = async () => {
    if (!player || !currentUser) return;

    const playerId = getNormalizedPlayerId(player);
    const ratingPath = `ratings/${playerId}/${currentUser.uid}`;
    const ratingRef = ref(rtdb, ratingPath);

    try {
      const snapshot = await get(ratingRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        setRatings({
          shooting: data.shooting || '',
          dunking: data.dunking || '',
          defense: data.defense || '',
          playmaking: data.playmaking || '',
          rebounding: data.rebounding || '',
        });

        const avg = (
          (parseFloat(data.shooting) +
          parseFloat(data.dunking) +
          parseFloat(data.defense) +
          parseFloat(data.playmaking) +
          parseFloat(data.rebounding)) / 5
        ).toFixed(1);

        const overallField = document.getElementById('user-overall');
        if (overallField) overallField.value = avg;
      }
    } catch (err) {
      console.error("Error fetching user rating from RTDB:", err);
    }
  };

  useEffect(() => { fetchUserRating(); }, [player, currentUser, id]);

  const fetchAverageRating = async () => {
    if (!player) return;

    const playerId = getNormalizedPlayerId(player);
    const playerRatingsRef = ref(rtdb, `ratings/${playerId}`);

    try {
      const snapshot = await get(playerRatingsRef);

      if (snapshot.exists()) {
        const ratingsObj = snapshot.val();
        const playerRatings = Object.values(ratingsObj);

        const sum = {
          shooting: 0,
          dunking: 0,
          defense: 0,
          playmaking: 0,
          rebounding: 0
        };

        playerRatings.forEach(r => {
          sum.shooting += parseFloat(r.shooting) || 0;
          sum.dunking += parseFloat(r.dunking) || 0;
          sum.defense += parseFloat(r.defense) || 0;
          sum.playmaking += parseFloat(r.playmaking) || 0;
          sum.rebounding += parseFloat(r.rebounding) || 0;
        });

        const count = playerRatings.length;
        const avg = {
          shooting: (sum.shooting / count).toFixed(1),
          dunking: (sum.dunking / count).toFixed(1),
          defense: (sum.defense / count).toFixed(1),
          playmaking: (sum.playmaking / count).toFixed(1),
          rebounding: (sum.rebounding / count).toFixed(1),
          overall: (
            (sum.shooting + sum.dunking + sum.defense + sum.playmaking + sum.rebounding) / (5 * count)
          ).toFixed(1),
        };

        console.log('📊 Calculated average rating:', avg);
        setAverageRating({ ...avg, count });
      } else {
        console.log('❌ No ratings found for', playerId);
        setAverageRating(null);
      }
    } catch (err) {
      console.error("Error fetching average rating from RTDB:", err);
    }
  };

  useEffect(() => { if (player) fetchAverageRating(); }, [player, id]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!currentUser || !player) return;

    const playerId = getNormalizedPlayerId(player);
    const ratingPath = `ratings/${playerId}/${currentUser.uid}`;
    const ratingRef = ref(rtdb, ratingPath);

    try {
      await remove(ratingRef);

      setRatings({
        shooting: '', dunking: '', defense: '', playmaking: '', rebounding: ''
      });

      const overallField = document.getElementById('user-overall');
      if (overallField) overallField.value = '';

      setModalMessage("Your rating was successfully removed.");
      setShowModal(true);

      await fetchAverageRating();
    } catch (err) {
      console.error("Error deleting rating from RTDB:", err);
      setModalMessage("There was a problem deleting your rating.");
      setShowModal(true);
    }
  };

  const handleAddToFavorites = async () => {
    if (!currentUser) {
      alert('Please log in to add players to your Top 10 list.');
      return;
    }

    const favoritesRef = ref(rtdb, `users/${currentUser.uid}/favorites`);
    const snapshot = await get(favoritesRef);
    const currentFavorites = snapshot.exists() ? snapshot.val() : [];

    const playerId = getNormalizedPlayerId(player);

    // Prevent duplicates
    if (currentFavorites.includes(playerId)) {
      alert('This player is already in your Top 10 list!');
      return;
    }

    if (currentFavorites.length >= 10) {
      alert('Your Top 10 list is full! Remove a player before adding more.');
      return;
    }

    const updatedFavorites = [...currentFavorites, playerId];
    try {
      await set(favoritesRef, updatedFavorites);
      alert('Player added to your Top 10!');
    } catch (err) {
      console.error('Failed to update favorites:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRatings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      const proceed = window.confirm("You need to be logged in to submit ratings. Would you like to register now?");
      if (proceed) navigate('/register');
      return;
    }

    const numericRatings = Object.values(ratings).map(parseFloat);
    if (numericRatings.some(val => isNaN(val))) {
      setModalMessage("Please fill out all rating fields before submitting.");
      setShowModal(true); 
      return;
    }
    if (numericRatings.some(val => val < 1 || val > 10)) {
      setModalMessage("Ratings must be between 1 and 10.");
      setShowModal(true);
      return;
    }

    const playerId = getNormalizedPlayerId(player);
    const ratingPath = `ratings/${playerId}/${currentUser.uid}`;
    const ratingRef = ref(rtdb, ratingPath);
    const overall = (numericRatings.reduce((a, b) => a + b, 0) / 5).toFixed(1);
    document.getElementById('user-overall').value = overall;

    try {
      await set(ratingRef, {
        playerId,
        userId: currentUser.uid,
        playerName: player.Player,
        imgFile: player.Player.replace(/\s+/g, '-'),
        ...Object.fromEntries(['shooting', 'dunking', 'defense', 'playmaking', 'rebounding']
          .map((attr, i) => [attr, numericRatings[i]])),
        overall: parseFloat(overall),
        submittedAt: Date.now(),
        lastUpdatedAt: Date.now(),
      });

      await fetchUserRating();
      await fetchAverageRating();
      setModalMessage("Your rating was submitted successfully!");
      setShowModal(true);
    } catch (err) {
      console.error("Error submitting rating:", err);
      setModalMessage("There was a problem submitting your rating.");
      setShowModal(true);
    }
  };

  if (!player) return <p style={{ color: 'white', textAlign: 'center' }}>Loading player data...</p>;

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

      <div className="player-header">
        <img src={`/teamIMGs/${player.Team}.png`} alt={`${player.Team} logo`} className="team-logo" />
        <div className="player-basic-info">
          <h1>{player.Player}</h1>
          <p>{player.Team} | #{player.Number || 'N/A'} | {player.Pos}</p>
        </div>
        <div className="player-ratings">
          <div className="rating-badge overall">Overall<br /><span>{averageRating?.overall || '-'}</span></div>
          <div className="rating-badge">Shooting<br /><span>{averageRating?.shooting || '-'}</span></div>
          <div className="rating-badge">Dunking<br /><span>{averageRating?.dunking || '-'}</span></div>
          <div className="rating-badge">Defense<br /><span>{averageRating?.defense || '-'}</span></div>
          <div className="rating-badge">Playmaking<br /><span>{averageRating?.playmaking || '-'}</span></div>
          <div className="rating-badge">Rebounding<br /><span>{averageRating?.rebounding || '-'}</span></div>
        </div>
        {averageRating?.count && (
          <p className="rating-count-text">
            <em>{averageRating.count} rating{averageRating.count !== 1 ? 's' : ''} submitted</em>
          </p>
        )}
        {currentUser && (
          <button
            className="favorite-button"
            onClick={handleAddToFavorites}
          >
            ⭐ Add to Favorite Players
          </button>
        )}
      </div>

      <div className="user-rating-form">
        <h3>Your Ratings</h3>
        <form className="rating-form">
          <input type="text" id="user-overall" placeholder="Overall" readOnly />
          {['shooting', 'dunking', 'defense', 'playmaking', 'rebounding'].map(attr => (
            <input
              key={attr}
              type="number"
              name={attr}
              step="0.1"
              min="1"
              max="10"
              placeholder={attr.charAt(0).toUpperCase() + attr.slice(1)}
              value={ratings[attr]}
              onChange={handleChange}
            />
          ))}
        <div className="submit-rating">
          <button type="button" onClick={handleSubmit}>Submit Your Ratings</button>
          {Object.values(ratings).some(val => val !== '') && (
            <button type="button" onClick={handleDelete} style={{ marginLeft: '1rem' }}>
              Remove Rating
            </button>
          )}
        </div>
        </form>
      </div>

      <main className="player-main">
        <div className="player-profile-top">
          <img src={`/playerIMGs/${player.Player.replace(/\s+/g, '-')}.jpg`} alt={player.name} className="player-profile-img" />
          <div className="player-stats">
            <div><span>PPG</span> <strong>{player.PTS || '-'}</strong></div>
            <div><span>RPG</span> <strong>{player.TRB || '-'}</strong></div>
            <div><span>APG</span> <strong>{player.AST || '-'}</strong></div>
          </div>
        </div>

        <section className="player-details">
          <div><span>Height:</span> {player.Height || 'Unknown'}</div>
          <div><span>Weight:</span> {player.Weight || 'Unknown'}</div>
          <div><span>College:</span> {player.College || 'N/A'}</div>
          <div><span>Experience:</span> {player.Exp || 'Rookie'}</div>
        </section>

        <section className="last-five-games">
  <h2 style={{ color: '#d0021b' }}>2025 Stats Summary</h2>
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
    <div style={{ flex: 1 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#111', fontSize: '16px' }}>
        <tbody>
          <tr><td><strong>Games Played</strong></td><td>{player.G}</td></tr>
          <tr><td><strong>Minutes/Game</strong></td><td>{player.MP}</td></tr>
          <tr><td><strong>FG</strong></td><td>{player.FG}/{player.FGA} ({player["FG%"]})</td></tr>
          <tr><td><strong>3P</strong></td><td>{player["3P"]}/{player["3PA"]} ({player["3P%"]})</td></tr>
          <tr><td><strong>2P</strong></td><td>{player["2P"]}/{player["2PA"]} ({player["2P%"]})</td></tr>
          <tr><td><strong>FT</strong></td><td>{player.FT}/{player.FTA} ({player["FT%"]})</td></tr>
          <tr><td><strong>eFG%</strong></td><td>{player["eFG%"]}</td></tr>
        </tbody>
      </table>
    </div>
    <div style={{ flex: 1 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#111', fontSize: '16px' }}>
        <tbody>
          <tr><td><strong>Rebounds</strong></td><td>ORB {player.ORB}, DRB {player.DRB}, TRB {player.TRB}</td></tr>
          <tr><td><strong>AST</strong></td><td>{player.AST}</td></tr>
          <tr><td><strong>STL</strong></td><td>{player.STL}</td></tr>
          <tr><td><strong>BLK</strong></td><td>{player.BLK}</td></tr>
          <tr><td><strong>TO</strong></td><td>{player.TOV}</td></tr>
          <tr><td><strong>PF</strong></td><td>{player.PF}</td></tr>
          <tr><td><strong>PTS/Game</strong></td><td>{player.PTS}</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

      </main>

      <footer>
        <p>&copy; 2025 MyNBAList</p>
      </footer>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>{modalMessage}</p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerProfile;

