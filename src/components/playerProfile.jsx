import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

function PlayerProfile() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [ratings, setRatings] = useState({
    shooting: '',
    dunking: '',
    defense: '',
    playmaking: '',
    rebounding: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [averageRating, setAverageRating] = useState(null);
  const navigate = useNavigate();
  const getNormalizedPlayerId = (player) => 
  `${player.Player.replace(/\s+/g, '-').toLowerCase()}-${player.Team.toLowerCase()}`;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetch('/data/players.json')
      .then(res => res.json())
      .then(data => {
        const playerData = data.find(p =>
          `${p.Player}-${p.Team}`.replace(/\s+/g, '_').toLowerCase() === id
        );
        setPlayer(playerData);
      })
      .catch(err => console.error("Failed to load player data", err));
  }, [id]);

  const fetchUserRating = async () => {
    if (player && currentUser) {
      const playerId = getNormalizedPlayerId(player);
      const docId = `${playerId}_${currentUser.uid}`;
      const ratingRef = doc(db, 'ratings', docId);
      const snapshot = await getDoc(ratingRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
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
    }
  };

  useEffect(() => {
    fetchUserRating();
  }, [player, currentUser, id]);

  const fetchAverageRating = async () => {
    if (!id) return;
    const playerId = getNormalizedPlayerId(player);
    const q = query(collection(db, 'ratings'), where('playerId', '==', playerId));
    const snapshot = await getDocs(q);

    const playerRatings = [];
    snapshot.forEach(doc => playerRatings.push(doc.data()));

    if (playerRatings.length > 0) {
      const sum = {
        shooting: 0,
        dunking: 0,
        defense: 0,
        playmaking: 0,
        rebounding: 0,
      };

      playerRatings.forEach(r => {
        sum.shooting += r.shooting;
        sum.dunking += r.dunking;
        sum.defense += r.defense;
        sum.playmaking += r.playmaking;
        sum.rebounding += r.rebounding;
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

      setAverageRating({
        ...avg,
        count: playerRatings.length
      });
    } else {
      setAverageRating(null);
    }
  };

  useEffect(() => {
    if (player) {
      fetchAverageRating();
    }
  }, [player, id]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
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

    const { shooting, dunking, defense, playmaking, rebounding } = ratings;
    const numericRatings = [shooting, dunking, defense, playmaking, rebounding].map(parseFloat);

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

    const userId = currentUser.uid;
    const playerId = getNormalizedPlayerId(player);
    const docId = `${playerId}_${userId}`;
    const ratingRef = doc(db, 'ratings', docId);
    const overall = (
      (parseFloat(shooting) + parseFloat(dunking) + parseFloat(defense) +
        parseFloat(playmaking) + parseFloat(rebounding)) / 5
    ).toFixed(1);

    document.getElementById('user-overall').value = overall;

    try {
      await setDoc(ratingRef, {
        playerId,
        userId,
        playerName: player.Player, // full name with casing
        imgFile: player.Player.replace(/\s+/g, '-'), // exact filename used in playerIMGs/
        shooting: parseFloat(shooting),
        dunking: parseFloat(dunking),
        defense: parseFloat(defense),
        playmaking: parseFloat(playmaking),
        rebounding: parseFloat(rebounding),
        overall: parseFloat(overall),
        submittedAt: new Date(),
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

  if (!player) {
    return <p style={{ color: 'white', textAlign: 'center' }}>Loading player data...</p>;
  }

  return (
    <>
      <header>
        <div className="site-logo">
          <img src="/icons/Basketball-icon.jpg" alt="Site Icon" className="logo-img" />
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
          <h2>Last 5 Games</h2>
          <p style={{ color: '#ccc' }}>Game log not available in dataset.</p>
        </section>

        <section className="awards-section">
          <h2>Awards and Honors</h2>
          <p style={{ color: '#ccc' }}>Award data not included.</p>
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
    </>
  );
}

export default PlayerProfile;

