// src/components/playerSearchPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Firebase imports
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const playerData = [
  { name: 'Anthony Davis', team: 'DAL', teamName: 'Dallas Mavericks', position: 'C', conference: 'West', img: 'AD', rating: 8.9 },
  { name: 'Anthony Edwards', team: 'MIN', teamName: 'Minnesota Timberwolves', position: 'G', conference: 'West', img: 'Edwards', rating: 9.2 },
  { name: 'Chris Paul', team: 'SAS', teamName: 'San Antonio Spurs', position: 'G', conference: 'West', img: 'CP3', rating: 8.1 },
  { name: 'Chet Holmgren', team: 'OKC', teamName: 'Oklahoma City Thunder', position: 'C', conference: 'West', img: 'Holmgren', rating: 8.3 },
  { name: 'Devin Booker', team: 'PHX', teamName: 'Phoenix Suns', position: 'G', conference: 'West', img: 'booker', rating: 8.8 },
  { name: 'Donovan Mitchell', team: 'CLE', teamName: 'Cleveland Cavaliers', position: 'G', conference: 'East', img: 'Mitchell', rating: 8.9 },
  { name: 'Draymond Green', team: 'GSW', teamName: 'Golden State Warriors', position: 'F', conference: 'West', img: 'draymond', rating: 7.9 },
  { name: 'Giannis Antetokounmpo', team: 'MIL', teamName: 'Milwaukee Bucks', position: 'F', conference: 'East', img: 'Antetokounmpo', rating: 9.7 },
  { name: 'Jalen Green', team: 'HOU', teamName: 'Houston Rockets', position: 'G', conference: 'West', img: 'JalenGreen', rating: 7.8 },
  { name: 'Ja Morant', team: 'MEM', teamName: 'Memphis Grizzlies', position: 'G', conference: 'West', img: 'Morant', rating: 8.5 },
  { name: 'Jayson Tatum', team: 'BOS', teamName: 'Boston Celtics', position: 'F', conference: 'East', img: 'Tatum', rating: 9.2 },
  { name: 'Kawhi Leonard', team: 'LAC', teamName: 'Los Angeles Clippers', position: 'F', conference: 'West', img: 'kawhi', rating: 8.5 },
  { name: 'LaMelo Ball', team: 'CHA', teamName: 'Charlotte Hornets', position: 'G', conference: 'East', img: 'Lamelo', rating: 8.0 },
  { name: 'LeBron James', team: 'LAL', teamName: 'Los Angeles Lakers', position: 'F', conference: 'West', img: 'Lebron', rating: 9.3 },
  { name: 'Luka Dončić', team: 'LAL', teamName: 'Los Angeles Lakers', position: 'G', conference: 'West', img: 'Doncic', rating: 9.6 },
  { name: 'Nikola Jokić', team: 'DEN', teamName: 'Denver Nuggets', position: 'C', conference: 'West', img: 'Jokic', rating: 9.8 },
  { name: 'Paolo Banchero', team: 'ORL', teamName: 'Orlando Magic', position: 'F', conference: 'East', img: 'Banchero', rating: 8.2 },
  { name: 'Shai Gilgeous-Alexander', team: 'OKC', teamName: 'Oklahoma City Thunder', position: 'G', conference: 'West', img: 'SGA', rating: 9.6 },
  { name: 'Stephen Curry', team: 'GSW', teamName: 'Golden State Warriors', position: 'G', conference: 'West', img: 'Steph', rating: 9.3 },
  { name: 'Tyrese Haliburton', team: 'IND', teamName: 'Indiana Pacers', position: 'G', conference: 'East', img: 'Haliburton', rating: 8.7 },
  { name: 'Victor Wembanyama', team: 'SAS', teamName: 'San Antonio Spurs', position: 'C', conference: 'West', img: 'Wembanyama', rating: 9.0 },
  { name: 'Zion Williamson', team: 'NOP', teamName: 'New Orleans Pelicans', position: 'F', conference: 'West', img: 'Williamson', rating: 8.4 }
];

export default function Browse() {
  const [search, setSearch]               = useState('');
  const [team, setTeam]                   = useState('');
  const [position, setPosition]           = useState('');
  const [conference, setConference]       = useState('');
  const [ratingFilter, setRatingFilter]   = useState('');
  const [sortBy, setSortBy]               = useState('first'); // 'first' | 'last' | ''
  const [sortByRating, setSortByRating]   = useState('');     // 'asc' | 'desc' | ''
  const [currentUser, setCurrentUser]     = useState(null);

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

  const filteredPlayers = playerData.filter(player => {
    const ratingInt = Math.floor(player.rating);
    return (
      player.name.toLowerCase().includes(search.toLowerCase()) &&
      (team === '' || player.team === team) &&
      (position === '' || player.position === position) &&
      (conference === '' || player.conference === conference) &&
      (ratingFilter === '' || ratingInt.toString() === ratingFilter)
    );
  });

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortByRating !== '') {
      return sortByRating === 'desc' ? b.rating - a.rating : a.rating - b.rating;
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
    setSortByRating(''); // clear rating sort
    setSortBy(prev => (prev === 'first' ? 'last' : 'first'));
  };

  const handleRatingSortToggle = () => {
    setSortBy(''); // clear name sort
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
            <Link to="/home">Home</Link>
            <Link to="/browse">Browse Players</Link>
            <Link to="/5v5">My NBA 5v5</Link>
            <Link to="/profile">My Profile</Link>
          </div>
          <div className="nav-right">
            {currentUser ? (
              <>
                <span className="font-semibold">
                  Hello, {currentUser.displayName || currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-4 text-white border border-white px-3 py-1 rounded hover:bg-gray-700"
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
            {[...new Set(playerData.map(p => `${p.team}|${p.teamName}`))]
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
            <option value="G">Guard</option>
            <option value="F">Forward</option>
            <option value="C">Center</option>
          </select>

          <select id="conference-filter" value={conference} onChange={e => setConference(e.target.value)}>
            <option value="">All Conferences</option>
            <option value="East">Eastern Conference</option>
            <option value="West">Western Conference</option>
          </select>

          <select id="rating-filter" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
            <option value="">All Ratings</option>
            {[...Array(10)].map((_, i) => (
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
          {sortedPlayers.map((player) => (
            <Link to="/playerprofile" className="player-card-link" key={player.name}>
              <div className="player-card">
                <img
                  src={`/playerIMGs/${player.img}.jpg`}
                  alt={player.name}
                  className="player-img"
                />
                <h3>{player.name}</h3>
                <p>
                  {player.teamName} |{' '}
                  {player.position === 'G' ? 'Guard' : player.position === 'F' ? 'Forward' : 'Center'}
                </p>
                <p className="player-rating">⭐ {player.rating}</p>
              </div>
            </Link>
          ))}
        </section>
      </main>

      <footer>
        <p>&copy; 2025 MyNBAList</p>
      </footer>
    </>
  );
}
