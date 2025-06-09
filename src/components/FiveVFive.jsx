import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Helper function to normalize player ID
const getNormalizedPlayerId = (player) =>
  `${player.Player.replace(/\s+/g, '-').toLowerCase()}-${player.Team}`; // Keep team code as is (e.g., 'LAL')

// Helper function to generate image paths with proper capitalization
const getImagePath = (name) => {
  if (!name || name === 'Unknown') return '/playerIMGs/default.jpg';
  const cleanName = name.replace(/\s+/g, '-'); // Preserve case, just replace spaces with hyphens
  const path = `/playerIMGs/${cleanName}.jpg`;
  console.log(`Generated image path for ${name}: ${path}`);
  return path;
};

// TeamSelector Component
function TeamSelector({ teamNumber, setPlayers, selectedPlayers, allPlayers, otherTeamPlayers }) {
  const [teamName, setTeamName] = useState(selectedPlayers.teamName || '');

  const playersByPosition = {
    pg: allPlayers.filter(p => p.position === 'PG'),
    sg: allPlayers.filter(p => p.position === 'SG'),
    sf: allPlayers.filter(p => p.position === 'SF'),
    pf: allPlayers.filter(p => p.position === 'PF'),
    c: allPlayers.filter(p => p.position === 'C'),
  };

  const otherTeamPlayerIds = Object.values(otherTeamPlayers.players)
    .filter(p => p)
    .map(p => p.id);

  const handlePlayerChange = (position, value) => {
    const selected = allPlayers.find(p => p.id === value);
    console.log(`Selected player for ${position}:`, selected);
    setPlayers(prev => ({
      ...prev,
      [position]: value,
      players: {
        ...prev.players,
        [position]: selected && value
          ? { id: selected.id, name: selected.name, position: position.toUpperCase(), img: selected.img }
          : null,
      },
    }));
  };

  const handleTeamNameChange = (e) => {
    const newName = e.target.value;
    setTeamName(newName);
    setPlayers(prev => ({ ...prev, teamName: newName }));
  };

  return (
    <div className="team-selector p-4">
      <h3 className="text-xl font-semibold mb-4">Select Players for Team {teamNumber}</h3>
      <div className="player-selection-area space-y-4">
        {['pg', 'sg', 'sf', 'pf', 'c'].map(position => (
          <div className="position-selection flex items-center" key={position}>
            <label htmlFor={`team${teamNumber}-${position}`} className="mr-2">
              {position.toUpperCase()}:
            </label>
            <select
              id={`team${teamNumber}-${position}`}
              className="player-select border p-2 rounded"
              value={selectedPlayers[position] || ''}
              onChange={e => handlePlayerChange(position, e.target.value)}
            >
              <option value="">Select a Player</option>
              {playersByPosition[position].map(player => (
                <option
                  key={player.id}
                  value={player.id}
                  disabled={otherTeamPlayerIds.includes(player.id)}
                >
                  {player.name}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div className="team-name-input flex items-center">
          <label htmlFor={`team${teamNumber}-name`} className="mr-2">Team Name:</label>
          <input
            type="text"
            id={`team${teamNumber}-name`}
            placeholder={`Team ${teamNumber}`}
            className="border p-2 rounded"
            value={teamName}
            onChange={handleTeamNameChange}
          />
        </div>
      </div>
    </div>
  );
}

// CourtVisualization Component
function CourtVisualization({ team1Players, team2Players }) {
  const defaultTeamPlayers = {
    pg: { name: 'Player 1', position: 'PG', img: 'icons/ChatGPT Image Jun 8, 2025 at 04_34_48 AM.png' },
    sg: { name: 'Player 2', position: 'SG', img: 'icons/ChatGPT Image Jun 8, 2025 at 04_34_48 AM.png' },
    sf: { name: 'Player 3', position: 'SF', img: 'icons/ChatGPT Image Jun 8, 2025 at 04_34_48 AM.png' },
    pf: { name: 'Player 4', position: 'PF', img: 'icons/ChatGPT Image Jun 8, 2025 at 04_34_48 AM.png' },
    c: { name: 'Player 5', position: 'C', img: 'icons/ChatGPT Image Jun 8, 2025 at 04_34_48 AM.png' },
  };

  const getTeamPlayers = (teamPlayers, defaults) => {
    const result = {};
    ['pg', 'sg', 'sf', 'pf', 'c'].forEach(pos => {
      result[pos] = teamPlayers.players?.[pos] || defaults[pos];
      if (!result[pos].img) {
        result[pos].img = '/playerIMGs/default.jpg';
        console.warn(`No image for ${pos}, falling back to default`);
      } else {
        console.log(`Team player ${pos} image: ${result[pos].img}`);
      }
    });
    return result;
  };

  const team1ToShow = getTeamPlayers(team1Players, defaultTeamPlayers);
  const team2ToShow = getTeamPlayers(team2Players, defaultTeamPlayers);

  const handleImageError = (e) => {
    console.warn(`Image failed to load: ${e.target.src}, falling back to default`, e);
    e.target.src = '/playerIMGs/default.jpg';
  };

  const team1PlayerElements = ['pg', 'sg', 'sf', 'pf', 'c'].map(pos => {
    const player = team1ToShow[pos];
    return (
      <div className={`player-position ${pos}`} key={pos}>
        <div className="player-marker" data-tooltip={`${player.name}: ${player.position}`}>
          <img
            src={player.img}
            alt={player.position}
            className="player-img"
            onError={handleImageError}
          />
          <div className="player-info">
            <span className="player-name">{player.name}</span>
            <span className="player-position-label">{player.position}</span>
          </div>
        </div>
      </div>
    );
  });

  const team2PlayerElements = ['pg', 'sg', 'sf', 'pf', 'c'].map(pos => {
    const player = team2ToShow[pos];
    return (
      <div className={`player-position ${pos}`} key={pos}>
        <div className="player-marker" data-tooltip={`${player.name}: ${player.position}`}>
          <img
            src={player.img}
            alt={player.position}
            className="player-img"
            onError={handleImageError}
          />
          <div className="player-info">
            <span className="player-name">{player.name}</span>
            <span className="player-position-label">{player.position}</span>
          </div>
        </div>
      </div>
    );
  });

  return (
    <section id="court-visualization" className="p-4">
      <h3 className="text-xl font-semibold mb-4 text-center">
        Team Matchup Visualization
      </h3>
      <div className="basketball-court" style={{ position: 'relative' }}>
        <div className="court-lines" />
        <div className="team team-left">
          <div className="team-name">
            {team1Players.teamName || 'Team 1'}
          </div>
          {team1PlayerElements}
        </div>
        <div className="court-center">
          <div className="court-circle" />
          <div className="versus">VS</div>
        </div>
        <div className="team team-right">
          <div className="team-name">
            {team2Players.teamName || 'Team 2'}
          </div>
          {team2PlayerElements}
        </div>
      </div>
    </section>
  );
}

// MatchupResults Component 
function MatchupResults({ team1Players, team2Players }) {
  const stats = [
    { category: 'Shooting', team1: { score: 8.5, width: '65%' }, team2: { score: 7.2, width: '55%' } },
    { category: 'Dunking', team1: { score: 9.1, width: '70%' }, team2: { score: 7.8, width: '60%' } },
    { category: 'Defense', team1: { score: 7.2, width: '55%' }, team2: { score: 9.7, width: '75%' } },
    { category: 'Playmaking', team1: { score: 10.4, width: '80%' }, team2: { score: 7.8, width: '60%' } },
    { category: 'Rebounding', team1: { score: 9.8, width: '75%' }, team2: { score: 8.5, width: '65%' } },
    { category: 'Overall', team1: { score: 9.0, width: '69%' }, team2: { score: 8.2, width: '63%' } },
  ];

  const overallStat = stats.find(s => s.category === 'Overall');
  const winner =
    overallStat.team1.score > overallStat.team2.score
      ? team1Players.teamName || 'Team 1'
      : team2Players.teamName || 'Team 2';

  return (
    <section id="matchup-results" className="p-4">
      <div className="results-container space-y-4">
        <div className="winner-announcement">
          <h3 className="text-xl font-semibold mb-2">Matchup Winner</h3>
          <div className="winner-badge bg-green-500 text-white p-4 rounded">
            <div className="winner-text text-lg">{winner} Wins!</div>
            <div className="winner-score text-xl font-bold">108 - 102</div>
          </div>
        </div>
        <div className="stat-comparison">
          <h3 className="text-xl font-semibold mb-4">Team Comparison</h3>
          {stats.map(stat => (
            <div className="stat-category mb-4" key={stat.category}>
              <div className="category-name font-semibold">{stat.category}</div>
              <div className="comparison-bar flex">
                <div
                  className="team1-bar bg-blue-500 text-white text-center"
                  style={{ width: stat.team1.width }}
                >
                  {stat.team1.score}
                </div>
                <div
                  className="team2-bar bg-red-500 text-white text-center"
                  style={{ width: stat.team2.width }}
                >
                  {stat.team2.score}
                </div>
              </div>
              <div className="team-names flex justify-between">
                <span>{team1Players.teamName || 'Team 1'}</span>
                <span>{team2Players.teamName || 'Team 2'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Main FiveVFive Component
function FiveVFive() {
  const [team1Players, setTeam1Players] = useState({
    pg: '',
    sg: '',
    sf: '',
    pf: '',
    c: '',
    teamName: '',
    players: {},
  });

  const [team2Players, setTeam2Players] = useState({
    pg: '',
    sg: '',
    sf: '',
    pf: '',
    c: '',
    teamName: '',
    players: {},
  });

  const [allPlayers, setAllPlayers] = useState([]);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

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

  // Fetch player data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/data/players.json');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        console.log('Fetched player data:', data);

        const grouped = {};
        data.forEach((p) => {
          if (p.Team === '2TM') return;
          if (!grouped[p.Player]) grouped[p.Player] = [];
          grouped[p.Player].push(p);
        });

        const transformed = Object.entries(grouped).map(([name, entries]) => {
          const latest = entries[entries.length - 1];
          const playerName = latest.Player || 'Unknown';
          const teamCode = latest.Team || 'Unknown';

          return {
            id: getNormalizedPlayerId(latest),
            name: playerName,
            team: teamCode,
            teamName: teamFullNames[teamCode] || teamCode,
            position: latest.Pos,
            img: getImagePath(playerName),
          };
        });

        console.log('Transformed players:', transformed);
        setAllPlayers(transformed);
      } catch (err) {
        console.error('Failed to load player data:', err);
        setError('Failed to load player data. Please try again later.');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
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

  const handleSimulate = () => {
    const team1Selected = Object.values(team1Players.players).filter(p => p).length === 5;
    const team2Selected = Object.values(team2Players.players).filter(p => p).length === 5;

    if (!team1Selected || !team2Selected) {
      setError('Please select all players for both teams.');
      return;
    }

    setError('');
    console.log('Simulating matchup:', { team1Players, team2Players });
  };

  const handleReset = () => {
    setTeam1Players({ pg: '', sg: '', sf: '', pf: '', c: '', teamName: '', players: {} });
    setTeam2Players({ pg: '', sg: '', sf: '', pf: '', c: '', teamName: '', players: {} });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <div className="site-logo flex items-center">
          <img
            src="/icons/Basketball-icon.jpg"
            alt="Site Icon"
            className="logo-img w-10 h-10 mr-2"
          />
          <h1 className="text-2xl font-bold">MyNBAList</h1>
        </div>
        <nav className="flex justify-between w-full">
          <div className="nav-left flex space-x-4">
            <Link to="/home" className="hover:text-gray-300">Home</Link>
            <Link to="/browse" className="hover:text-gray-300">Browse Players</Link>
            <Link to="/5v5" className="hover:text-gray-300">My NBA 5v5</Link>
            <Link to="/profile" className="hover:text-gray-300">My Profile</Link>
          </div>
          <div className="nav-right flex space-x-4">
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
                <Link to="/login" className="hover:text-gray-300">Login</Link>
                <Link to="/register" className="hover:text-gray-300">Register</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="container mx-auto p-4">
        <section id="intro" className="text-center mb-8">
          <h2 className="text-2xl font-bold">
            5 vs. 5 Custom Team Builder & Match Simulator
          </h2>
          <p className="subtitle text-lg">
            Create your dream lineups and see which team would come out on top!
          </p>
        </section>

        <section id="team-builder" className="mb-8">
          <div className="team-builder-container">
            <div className="team-selector-section flex justify-between space-x-4">
              <TeamSelector
                teamNumber={1}
                setPlayers={setTeam1Players}
                selectedPlayers={team1Players}
                allPlayers={allPlayers}
                otherTeamPlayers={team2Players}
              />
              <TeamSelector
                teamNumber={2}
                setPlayers={setTeam2Players}
                selectedPlayers={team2Players}
                allPlayers={allPlayers}
                otherTeamPlayers={team1Players}
              />
            </div>
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            <div className="simulator-actions flex justify-center space-x-4 mt-4">
              <button
                className="simulate-button bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleSimulate}
              >
                Simulate 5v5 Matchup
              </button>
              <button
                className="reset-button bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={handleReset}
              >
                Reset Teams
              </button>
            </div>
          </div>
        </section>

        <CourtVisualization
          team1Players={team1Players}
          team2Players={team2Players}
        />
        <MatchupResults
          team1Players={team1Players}
          team2Players={team2Players}
        />
      </main>

      <footer className="text-center p-4 bg-gray-800 text-white">
        <p>© 2025 MyNBAList</p>
      </footer>
    </div>
  );
}

export default FiveVFive;