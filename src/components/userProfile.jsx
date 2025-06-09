import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, rtdb } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref as dbRef, get, set } from 'firebase/database';

function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [players, setPlayers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [playerRatingCount, setPlayerRatingCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const teamFullNames = {
    ATL: 'Atlanta Hawks', BOS: 'Boston Celtics', BRK: 'Brooklyn Nets',
    CHO: 'Charlotte Hornets', CHI: 'Chicago Bulls', CLE: 'Cleveland Cavaliers',
    DAL: 'Dallas Mavericks', DEN: 'Denver Nuggets', DET: 'Detroit Pistons',
    GSW: 'Golden State Warriors', HOU: 'Houston Rockets', IND: 'Indiana Pacers',
    LAC: 'Los Angeles Clippers', LAL: 'Los Angeles Lakers', MEM: 'Memphis Grizzlies',
    MIA: 'Miami Heat', MIL: 'Milwaukee Bucks', MIN: 'Minnesota Timberwolves',
    NOP: 'New Orleans Pelicans', NYK: 'New York Knicks', OKC: 'Oklahoma City Thunder',
    ORL: 'Orlando Magic', PHI: 'Philadelphia 76ers', PHO: 'Phoenix Suns',
    POR: 'Portland Trail Blazers', SAC: 'Sacramento Kings', SAS: 'San Antonio Spurs',
    TOR: 'Toronto Raptors', UTA: 'Utah Jazz', WAS: 'Washington Wizards'
  };
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const fetchPlayerRatingCount = async () => {
      try {
        const ratingsRef = dbRef(rtdb, 'ratings');
        const snapshot = await get(ratingsRef);

        if (!snapshot.exists()) {
          setPlayerRatingCount(0);
          return;
        }

        let count = 0;
        const data = snapshot.val();

        for (const playerId in data) {
          if (data[playerId][currentUser.uid]) {
            count += 1;
          }
        }

        setPlayerRatingCount(count);
      } catch (err) {
        console.error('Error counting rated players:', err);
      }
    };

    fetchPlayerRatingCount();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!currentUser) return;

      const favoritesRef = dbRef(rtdb, `users/${currentUser.uid}/favorites`);
      const snapshot = await get(favoritesRef);

      if (!snapshot.exists()) {
        setPlayers([]); // No favorites yet
        return;
      }

      const favoriteIds = snapshot.val(); // Array of player IDs

      // Load player data from local JSON
      const res = await fetch('/data/players.json');
      const allPlayersRaw = await res.json();

      // Group player entries by name
      const grouped = {};
      allPlayersRaw.forEach(p => {
        if (!grouped[p.Player]) grouped[p.Player] = [];
        grouped[p.Player].push(p);
      });

      // Map normalized IDs to player data
      const playerMap = {};
      for (const entries of Object.values(grouped)) {
        const latest = entries[entries.length - 1];
        const id = `${latest.Player.replace(/\s+/g, '-').toLowerCase()}-${latest.Team.toLowerCase()}`;
        playerMap[id] = {
          rank: 0,
          name: latest.Player,
          team: latest.Team,
          img: `/playerIMGs/${latest.Player.replace(/\s+/g, '-')}.jpg`,
        };
      }

      // Final list based on favoriteIds
      const loadedFavorites = favoriteIds
        .map((id, index) => {
          const p = playerMap[id];
          return p ? { ...p, rank: index + 1 } : null;
        })
        .filter(p => p !== null);

      setPlayers(loadedFavorites);
    };

    fetchFavorites();
  }, [currentUser]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    const newPlayers = [...players];
    const [draggedPlayer] = newPlayers.splice(dragIndex, 1);
    newPlayers.splice(dropIndex, 0, draggedPlayer);
    setPlayers(newPlayers.map((player, i) => ({ ...player, rank: i + 1 })));
  };

  const handleRemovePlayer = async (index) => {
    const newPlayers = players.filter((_, i) => i !== index);
    const reordered = newPlayers.map((player, i) => ({ ...player, rank: i + 1 }));
    setPlayers(reordered);

    if (!currentUser) return;

    const updatedIds = reordered.map(p =>
      `${p.name.replace(/\s+/g, '-').toLowerCase()}-${p.team.toLowerCase()}`
    );

    try {
      const favoritesRef = dbRef(rtdb, `users/${currentUser.uid}/favorites`);
      await set(favoritesRef, updatedIds);
      console.log('✅ Synced updated list after deletion.');
    } catch (err) {
      console.error('❌ Failed to sync after deletion:', err);
    }
  };

  const handleSaveChanges = async () => {
    setIsEditing(false);

    if (!currentUser) return;

    // Convert current player objects to favorite IDs
    const updatedIds = players.map(p => {
      return `${p.name.replace(/\s+/g, '-').toLowerCase()}-${p.team.toLowerCase()}`;
    });

    try {
      const favoritesRef = dbRef(rtdb, `users/${currentUser.uid}/favorites`);
      await set(favoritesRef, updatedIds);
      console.log('✅ Updated favorites in Firebase:', updatedIds);
    } catch (err) {
      console.error('❌ Failed to update favorites in Firebase:', err);
    }
  };

  const playerItems = players.map((player, index) => {
    const normalizedId = `${player.name.replace(/\s+/g, '-').toLowerCase()}-${player.team.toLowerCase()}`;

    return (
      <Link
        to={`/playerprofile/${normalizedId}`}
        key={player.rank}
        className="player-item flex items-center no-underline text-black hover:bg-gray-100 transition duration-200"
        draggable={isEditing}
        onDragStart={(e) => isEditing && handleDragStart(e, index)}
        onDragOver={handleDragOver}
        onDrop={(e) => isEditing && handleDrop(e, index)}
      >
        <div className="player-rank text-lg font-semibold w-8">
          {player.rank}
        </div>

        <img
          src={player.img}
          alt={player.name}
          className="profile-player-pic"
        />

        <div className="profile-player-info flex-1">
          <div className="profile-player-name">{player.name}</div>
          <div className="profile-player-team">
            {teamFullNames[player.team] || player.team}
          </div>
        </div>

        {isEditing && (
          <>
            <div className="drag-handle cursor-move text-gray-500 mr-4">☰</div>
            <button
              className="remove-button text-red-500 hover:text-red-700"
              onClick={(e) => {
                e.preventDefault(); // prevents Link from navigating
                handleRemovePlayer(index);
              }}
              role="button"
            >
              ✕
            </button>
          </>
        )}
      </Link>
    );
  });

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

      <main className="container mx-auto p-4">
        <section className="profile-header flex items-center mb-8">
          <img
            src="/icons/5f49bf67-4fe6-431d-99e1-bc319cde6b31.png"
            alt="User avatar"
            className="profile-pic w-24 h-24 rounded-full mr-4"
          />
          <div className="profile-info">
            <h2 className="text-2xl font-bold">{currentUser?.displayName || 'Guest User'}</h2>
          <div className="profile-stats flex space-x-4 mt-2">
            <div className="stat text-center">
              <div className="stat-number text-xl font-semibold">{playerRatingCount}</div>
              <div className="stat-label">Players Rated</div>
            </div>
          </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="top-players-header flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">My Top 10 Players Right Now</h2>
            <button
              className="edit-button bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={handleEditToggle}
            >
              {isEditing ? 'Cancel' : 'Edit List'}
            </button>
          </div>

          <div className="top-players-list space-y-4">
            {!currentUser ? (
              <div className="guest-prompt text-center text-gray-700 bg-white rounded-md p-6 shadow-md">
                <p className="text-lg font-semibold mb-2">Want to rate players and create your Top 10 list?</p>
                <p className="mb-4">Log in or register to start building your dream lineup!</p>
                <div className="flex justify-center space-x-4">
                  <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Login
                  </Link>
                  <Link to="/register" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    Register
                  </Link>
                </div>
              </div>
            ) : players.length > 0 ? (
              playerItems
            ) : (
              <p className="text-gray-600 italic">You haven’t added any players yet.</p>
            )}

            {isEditing && (
              <button
                className="save-changes bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4"
                onClick={handleSaveChanges}
              >
                Save Changes
              </button>
            )}
          </div>
        </section>

        <section id="cta" className="text-center">
          <h2 className="text-2xl font-bold mb-2">Share Your List</h2>
          <p className="mb-2">
            Let other basketball fans see your top picks and spark a conversation about who deserves to be
            on the list!
          </p>
          <p>
            <a href="https://twitter.com/intent/tweet" className="text-blue-500 hover:underline">
              Share on Twitter
            </a>{' '}
            or{' '}
            <button
              className="text-blue-500 hover:underline"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
            >
              Copy Link
            </button>
          </p>
        </section>
      </main>

      <footer className="text-center p-4 bg-gray-800 text-white">
        <p>© 2025 MyNBAList</p>
      </footer>
    </div>
  );
}

export default UserProfile;