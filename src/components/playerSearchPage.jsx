/**
 * Browse.jsx
 * 
 * This component allows users to browse NBA players with filters for team, position, conference, rating, 
 * and sort toggles. It dynamically loads data and merges it with live rating info from Firebase.
 * 
 * AI tools (e.g., ChatGPT by OpenAI) were used to assist with:
 * - Optimizing the data transformation and filtering logic
 * - Implementing sort toggles and rating aggregation
 * - Clarifying error handling and naming consistency
 * 
 * Citation: OpenAI. (2025). ChatGPT (June 2025 version) [Large language model]. https://chat.openai.com
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, rtdb } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';

export default function Browse() {
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

  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState('');
  const [position, setPosition] = useState('');
  const [conference, setConference] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('first');
  const [sortByRating, setSortByRating] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/data/players.json');
        const data = await res.json();

        const grouped = {};
        data.forEach((p) => {
          if (p.Team === '2TM') return; // Skip multi-team entries
          if (!grouped[p.Player]) grouped[p.Player] = [];
          grouped[p.Player].push(p);
        });

        const transformed = Object.entries(grouped).map(([name, entries]) => {
          const latest = entries[entries.length - 1];
          const playerName = latest.Player || 'Unknown';
          const teamCode = latest.Team || 'Unknown';

          return {
            id: `${playerName.replace(/\s+/g, '-').toLowerCase()}-${teamCode.toLowerCase()}`,
            name: playerName,
            team: teamCode,
            teamName: teamFullNames[teamCode] || teamCode,
            position: latest.Pos,
            conference: ['BOS','NYK','MIA','PHI','MIL','IND','ORL','CLE','ATL','TOR','WAS','CHI','CHA','DET','BRK','BKN'].includes(teamCode) ? 'East' : 'West',
            img: playerName.replace(/\s+/g, '-'),
          };
        });

        // Fetch and average ratings from RTDB
        const ratingsRef = ref(rtdb, 'ratings');
        const snapshot = await get(ratingsRef);
        const ratingsData = snapshot.exists() ? snapshot.val() : {};
        const ratingsMap = {};

        for (const playerId in ratingsData) {
          const playerRatings = ratingsData[playerId];
          let sum = 0;
          let count = 0;

          for (const userId in playerRatings) {
            const { overall } = playerRatings[userId];
            if (typeof overall === 'number') {
              sum += overall;
              count += 1;
            }
          }

          if (count > 0) {
            ratingsMap[playerId] = (sum / count).toFixed(1);
          }
        }

        // Merge rating data into player objects
        const playersWithRatings = transformed.map((player) => {
          const avgRating = ratingsMap[player.id] || '-';
          return { ...player, rating: avgRating };
        });

        setPlayers(playersWithRatings);
      } catch (err) {
        console.error('❌ Failed to load player data or ratings from RTDB:', err);
      }
    };

    fetchData();
  }, []);

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

  // Filter player list by all selected filters
  const filteredPlayers = players.filter(player => {
    const ratingInt = Math.floor(player.rating);
    return (
      player.name.toLowerCase().includes(search.toLowerCase()) &&
      (team === '' || player.team === team) &&
      (position === '' || player.position === position) &&
      (conference === '' || player.conference === conference) &&
      (ratingFilter === '' || ratingInt.toString() === ratingFilter)
    );
  });

  // Sort by rating or name
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortByRating !== '') {
      const ratingA = parseFloat(a.rating) || 0;
      const ratingB = parseFloat(b.rating) || 0;
      return sortByRating === 'desc' ? ratingB - ratingA : ratingA - ratingB;
    } else if (sortBy === 'last') {
      const lastA = a.name.split(' ').slice(-1)[0];
      const lastB = b.name.split(' ').slice(-1)[0];
      return lastA.localeCompare(lastB);
    } else {
      const firstA = a.name.split(' ')[0];
      const firstB = b.name.split(' ')[0];
      return firstA.localeCompare(firstB);
    }
  });

  const handleNameSortToggle = () => {
    setSortByRating('');
    setSortBy(prev => (prev === 'first' ? 'last' : 'first'));
  };

  const handleRatingSortToggle = () => {
    setSortBy('');
    setSortByRating(prev => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const resetFilters = () => {
    setSearch('');
    setTeam('');
    setPosition('');
    setConference('');
    setRatingFilter('');
    setSortBy('first');
    setSortByRating('');
  };

  const playerCards = sortedPlayers.map((player) => (
    <Link to={`/playerprofile/${player.id}`} className="player-card-link" key={player.id}>
      <div className="player-card">
        <img
          src={`/playerIMGs/${player.img}.jpg`}
          alt={player.name}
          className="player-img"
        />
        <h3>{player.name}</h3>
        <p>
          {player.teamName} |{' '}
          {(() => {
            switch (player.position) {
              case 'PG': return 'PG';
              case 'SG': return 'SG';
              case 'SF': return 'SF';
              case 'PF': return 'PF';
              case 'C':  return 'C';
              default: return player.position;
            }
          })()}
        </p>
        <p className="player-rating">⭐ {player.rating}</p>
      </div>
    </Link>
  ));

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

      <main>
        <section id="browse-intro">
          <h2>Browse NBA Players</h2>
          <p>Search, filter, and discover your favorite NBA players!</p>
        </section>

        <section id="search-filter" className="filter-row">
          <input
            type="text"
            id="search-bar"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select id="team-filter" value={team} onChange={e => setTeam(e.target.value)}>
            <option value="">All Teams</option>
            {[...new Set(players.map(p => `${p.team}|${p.teamName}`))]
              .sort((a, b) => a.split('|')[1].localeCompare(b.split('|')[1]))
              .map(entry => {
                const [teamCode, teamName] = entry.split('|');
                return (
                  <option key={teamCode} value={teamCode}>
                    {teamName}
                  </option>
                );
              })}
          </select>

          <select id="position-filter" value={position} onChange={e => setPosition(e.target.value)}>
            <option value="">All Positions</option>
            <option value="PG">Point Guard</option>
            <option value="SG">Shooting Guard</option>
            <option value="SF">Small Forward</option>
            <option value="PF">Power Forward</option>
            <option value="C">Center</option>
          </select>

          <select id="conference-filter" value={conference} onChange={e => setConference(e.target.value)}>
            <option value="">All Conferences</option>
            <option value="East">Eastern Conference</option>
            <option value="West">Western Conference</option>
          </select>

          <select id="rating-filter" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
            <option value="">All Ratings</option>
            {[...Array(11)].map((_, i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>

          <button onClick={handleNameSortToggle}>
            Sort by {sortBy === 'first' ? 'Last Name' : 'First Name'}
          </button>

          <button onClick={handleRatingSortToggle}>
            Rating: {sortByRating === 'desc' ? 'High → Low' : 'Low → High'}
          </button>

          <button className="reset-button" onClick={resetFilters}>Reset Filters</button>
        </section>

        <section id="player-grid">
          {playerCards}
        </section>
      </main>

      <footer>
        <p>© 2025 MyNBAList</p>
      </footer>
    </div>
  );
}
