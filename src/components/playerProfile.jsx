import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
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
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

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

  useEffect(() => {
  const fetchUserRating = async () => {
    if (player && currentUser) {
      const docId = `${id}_${currentUser.uid}`;
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

        const avg =
          (parseFloat(data.shooting) +
            parseFloat(data.dunking) +
            parseFloat(data.defense) +
            parseFloat(data.playmaking) +
            parseFloat(data.rebounding)) / 5;

        const overallField = document.getElementById('user-overall');
        if (overallField) overallField.value = avg.toFixed(1);
      }
    }
  };

  fetchUserRating();
}, [player, currentUser, id]);

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

    if (![shooting, dunking, defense, playmaking, rebounding].every(val => val !== '')) {
      alert("Please fill out all rating fields before submitting.");
      return;
    }

    const playerId = id;
    const userId = currentUser.uid;
    const docId = `${playerId}_${userId}`;
    const ratingRef = doc(db, 'ratings', docId);

    const overall = (
      (parseFloat(shooting) +
      parseFloat(dunking) +
      parseFloat(defense) +
      parseFloat(playmaking) +
      parseFloat(rebounding)) / 5
    ).toFixed(1);

    document.getElementById('user-overall').value = overall;

    try {
      await setDoc(ratingRef, {
        playerId,
        userId,
        shooting: parseFloat(shooting),
        dunking: parseFloat(dunking),
        defense: parseFloat(defense),
        playmaking: parseFloat(playmaking),
        rebounding: parseFloat(rebounding),
        overall: parseFloat(overall),
        submittedAt: new Date(),
      });
      alert("Your rating was submitted successfully!");
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert("There was a problem submitting your rating.");
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
                <button onClick={handleLogout} style={{
                  backgroundColor: 'transparent',
                  border: '1px solid white',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}>
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

      <div className="player-header">
        <img src={`/teamIMGs/${player.Team}.png`} alt={`${player.Team} logo`} className="team-logo"/>
        <div className="player-basic-info">
          <h1>{player.Player}</h1>
          <p>{player.Team} | #{player.Number || 'N/A'} | {player.Pos}</p>
        </div>
        <div className="player-ratings">
          <div className="rating-badge overall">
            Overall<br />
            <span>{player.Overall || '-'}</span>
          </div>
          <div className="rating-badge">
            Shooting<br /><span>{player.Shooting || '-'}</span>
          </div>
          <div className="rating-badge">
            Dunking<br /><span>{player.Dunking || '-'}</span>
          </div>
          <div className="rating-badge">
            Defense<br /><span>{player.Defense || '-'}</span>
          </div>
          <div className="rating-badge">
            Playmaking<br /><span>{player.Playmaking || '-'}</span>
          </div>
          <div className="rating-badge">
            Rebounding<br /><span>{player.Rebounding || '-'}</span>
          </div>
        </div>
      </div>

      <div className="user-rating-form">
        <h3>Your Ratings</h3>
        <form className="rating-form">
          <input type="text" id="user-overall" name="user-overall" placeholder="Overall" aria-label="Your Overall" readOnly />
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
          <img
            src={`/playerIMGs/${player.Player.replace(/\s+/g, '-')}.jpg`}
            alt={player.name}
            className="player-profile-img"
          />
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
    </>
  );
}

export default PlayerProfile;