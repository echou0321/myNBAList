// src/components/PlayerProfile.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Firebase imports
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function PlayerProfile() {
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

  const handleSubmit = () => {
    const { shooting, dunking, defense, playmaking, rebounding } = ratings;
    const overall = (
      (parseFloat(shooting || 0) +
        parseFloat(dunking || 0) +
        parseFloat(defense || 0) +
        parseFloat(playmaking || 0) +
        parseFloat(rebounding || 0)) / 5
    ).toFixed(1);
    document.getElementById('user-overall').value = overall;
  };

  return (
    <>
      <header>
        <div className="site-logo">
          <img
            src="../icons/Basketball-icon.jpg"
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

      <div className="player-header">
        <img
          src="../teamIMGs/spurs.png"
          alt="San Antonio Spurs Logo"
          className="team-logo"
        />
        <div className="player-basic-info">
          <h1>Chris Paul</h1>
          <p>San Antonio Spurs | #3 | Guard</p>
        </div>
        <div className="player-ratings">
          <div className="rating-badge overall">
            Overall<br />
            <span>8.0</span>
          </div>
          <div className="rating-badge">
            Shooting<br /><span>8.1</span>
          </div>
          <div className="rating-badge">
            Dunking<br /><span>4.0</span>
          </div>
          <div className="rating-badge">
            Defense<br /><span>7.0</span>
          </div>
          <div className="rating-badge">
            Playmaking<br /><span>8.5</span>
          </div>
          <div className="rating-badge">
            Rebounding<br /><span>4.4</span>
          </div>
        </div>
      </div>

      <div className="user-rating-form">
        <h3>Your Ratings</h3>
        <form className="rating-form">
          <input
            type="text"
            id="user-overall"
            name="user-overall"
            placeholder="Overall"
            aria-label="Your Overall"
            readOnly
          />
          <input
            type="number"
            name="shooting"
            step="0.1"
            min="1"
            max="10"
            placeholder="Shooting"
            value={ratings.shooting}
            onChange={handleChange}
          />
          <input
            type="number"
            name="dunking"
            step="0.1"
            min="1"
            max="10"
            placeholder="Dunking"
            value={ratings.dunking}
            onChange={handleChange}
          />
          <input
            type="number"
            name="defense"
            step="0.1"
            min="1"
            max="10"
            placeholder="Defense"
            value={ratings.defense}
            onChange={handleChange}
          />
          <input
            type="number"
            name="playmaking"
            step="0.1"
            min="1"
            max="10"
            placeholder="Playmaking"
            value={ratings.playmaking}
            onChange={handleChange}
          />
          <input
            type="number"
            name="rebounding"
            step="0.1"
            min="1"
            max="10"
            placeholder="Rebounding"
            value={ratings.rebounding}
            onChange={handleChange}
          />

          <div className="submit-rating">
            <button type="button" onClick={handleSubmit}>
              Submit Your Ratings
            </button>
          </div>
        </form>
      </div>

      <main className="player-main">
        <div className="player-profile-top">
          <img
            src="../playerIMGs/CP3.avif"
            alt="Chris Paul"
            className="player-photo"
          />
          <div className="player-stats">
            <div><span>PPG</span> <strong>8.8</strong></div>
            <div><span>RPG</span> <strong>3.6</strong></div>
            <div><span>APG</span> <strong>7.4</strong></div>
          </div>
        </div>

        <section className="player-details">
          <div><span>Height:</span> 6'0" (1.83m)</div>
          <div><span>Weight:</span> 175lb (79kg)</div>
          <div><span>Country:</span> USA</div>
          <div><span>Last Attended:</span> Wake Forest</div>
          <div><span>Age:</span> 39 years</div>
          <div><span>Birthdate:</span> May 6, 1985</div>
          <div><span>Draft:</span> 2005 R1 Pick 4</div>
          <div><span>Experience:</span> 19 Years</div>
        </section>

        <section className="last-five-games">
          <h2>Last 5 Games</h2>
          <table className="games-table">
            <thead>
              <tr>
                <th>Game Date</th><th>Matchup</th><th>W/L</th><th>MIN</th><th>PTS</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th><th>TO</th><th>PF</th><th>+/-</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Apr 13, 2025</td><td>SAS vs TOR</td><td>W</td><td>34</td><td>15</td><td>7</td><td>6</td><td>4</td><td>0</td><td>1</td><td>2</td><td>6</td></tr>
              <tr><td>Apr 11, 2025</td><td>SAS @ PHX</td><td>L</td><td>14</td><td>0</td><td>0</td><td>1</td><td>0</td><td>2</td><td>1</td><td>1</td><td>-8</td></tr>
              <tr><td>Apr 09, 2025</td><td>SAS @ GSW</td><td>W</td><td>29</td><td>12</td><td>5</td><td>5</td><td>1</td><td>0</td><td>3</td><td>3</td><td>-9</td></tr>
              <tr><td>Apr 08, 2025</td><td>SAS @ LAC</td><td>L</td><td>25</td><td>9</td><td>2</td><td>2</td><td>0</td><td>0</td><td>3</td><td>2</td><td>-12</td></tr>
              <tr><td>Apr 06, 2025</td><td>SAS @ POR</td><td>L</td><td>29</td><td>8</td><td>3</td><td>9</td><td>1</td><td>0</td><td>2</td><td>5</td><td>-4</td></tr>
            </tbody>
          </table>
        </section>

        <section className="awards-section">
          <h2>Awards and Honors</h2>
          <ul>
            <li>9 All-Defensive Team</li>
            <li>11 All-NBA</li>
            <li>1 All-Rookie Team</li>
            <li>12 NBA All-Star</li>
            <li>1 NBA All-Star Most Valuable Player</li>
            <li>8 NBA Player of the Month</li>
            <li>14 NBA Player of the Week</li>
            <li>6 NBA Rookie of the Month</li>
            <li>1 NBA Rookie of the Year</li>
            <li>1 NBA Sporting News Rookie of the Year</li>
            <li>2 Olympic Gold Medals</li>
          </ul>
        </section>
      </main>

      <footer>
        <p>&copy; 2025 MyNBAList</p>
      </footer>
    </>
  );
}

export default PlayerProfile;
