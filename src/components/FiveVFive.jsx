import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, rtdb } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get } from "firebase/database";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      console.error('Error in FiveVFive:', this.state.error);
      return (
        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message || 'Unknown error'}</p>
          <p>Please check the console for details and try refreshing.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Helper function to normalize player ID
const getNormalizedPlayerId = (player) =>
  `${player.Player.replace(/\s+/g, '-').toLowerCase()}-${player.Team.toLowerCase()}`;

// Helper function to format player name for image filename
const formatPlayerNameForImage = (playerName) => {
  return playerName.replace(/\s+/g, '-');
};

// Helper function to show team strength preview
const getTeamStrengthPreview = (teamPlayers) => {
  const selectedCount = Object.values(teamPlayers.players).filter(p => p).length;
  if (selectedCount === 0) return 'No players selected';
  if (selectedCount < 5) return `${selectedCount}/5 players selected`;
  return 'Team complete - ready for simulation';
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
          ? { 
              id: selected.id, 
              name: selected.name, 
              position: position.toUpperCase(), 
              img: selected.img 
            }
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
        <div className="team-status text-sm text-gray-600 mt-2">
          {getTeamStrengthPreview(selectedPlayers)}
        </div>
      </div>
    </div>
  );
}

// CourtVisualization Component
function CourtVisualization({ team1Players, team2Players }) {
  const defaultTeamPlayers = {
    pg: { name: 'Player 1', position: 'PG', img: 'default' },
    sg: { name: 'Player 2', position: 'SG', img: 'default' },
    sf: { name: 'Player 3', position: 'SF', img: 'default' },
    pf: { name: 'Player 4', position: 'PF', img: 'default' },
    c: { name: 'Player 5', position: 'C', img: 'default' },
  };

  const getTeamPlayers = (teamPlayers, defaults) => {
    const result = {};
    ['pg', 'sg', 'sf', 'pf', 'c'].forEach(pos => {
      result[pos] = teamPlayers.players?.[pos] || defaults[pos];
    });
    return result;
  };

  const team1ToShow = getTeamPlayers(team1Players, defaultTeamPlayers);
  const team2ToShow = getTeamPlayers(team2Players, defaultTeamPlayers);

  const handleImageError = (e) => {
    console.warn(`Image failed to load: ${e.target.src}, falling back to default`);
    e.target.src = '/icons/ChatGPT%20Image%20Jun%208,%202025%20at%2004_34_48%20AM.png';
  };

  const getImageSrc = (player) => {
    if (player.img === 'default') {
      return '/icons/ChatGPT%20Image%20Jun%208,%202025%20at%2004_34_48%20AM.png';
    }
    return `/playerIMGs/${player.img}.jpg`;
  };

  const team1PlayerElements = ['pg', 'sg', 'sf', 'pf', 'c'].map(pos => {
    const player = team1ToShow[pos];
    return (
      <div className={`player-position ${pos}`} key={pos}>
        <div className="player-marker" data-tooltip={`${player.name}: ${player.position}`}>
          <img
            src={getImageSrc(player)}
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
            src={getImageSrc(player)}
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
  const [team1Stats, setTeam1Stats] = useState(null);
  const [team2Stats, setTeam2Stats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to fetch average ratings for a player
  const fetchPlayerAverageRating = async (playerId) => {
    try {
      const playerRatingsRef = ref(rtdb, `ratings/${playerId}`);
      const snapshot = await get(playerRatingsRef);

      if (!snapshot.exists()) {
        console.log(`No ratings found for player: ${playerId}`);
        return {
          shooting: 5.0,
          dunking: 5.0,
          defense: 5.0,
          playmaking: 5.0,
          rebounding: 5.0,
          overall: 5.0,
          count: 0
        };
      }

      const ratingsObj = snapshot.val();
      const playerRatings = Object.values(ratingsObj);

      const sum = {
        shooting: 0,
        dunking: 0,
        defense: 0,
        playmaking: 0,
        rebounding: 0
      };

      playerRatings.forEach(rating => {
        sum.shooting += parseFloat(rating.shooting) || 0;
        sum.dunking += parseFloat(rating.dunking) || 0;
        sum.defense += parseFloat(rating.defense) || 0;
        sum.playmaking += parseFloat(rating.playmaking) || 0;
        sum.rebounding += parseFloat(rating.rebounding) || 0;
      });

      const count = playerRatings.length;
      const avgRatings = {
        shooting: (sum.shooting / count),
        dunking: (sum.dunking / count),
        defense: (sum.defense / count),
        playmaking: (sum.playmaking / count),
        rebounding: (sum.rebounding / count),
        count: count
      };

      avgRatings.overall = (
        avgRatings.shooting + avgRatings.dunking + avgRatings.defense + 
        avgRatings.playmaking + avgRatings.rebounding
      ) / 5;

      return avgRatings;
    } catch (err) {
      console.error(`Error fetching ratings for ${playerId}:`, err);
      return {
        shooting: 5.0,
        dunking: 5.0,
        defense: 5.0,
        playmaking: 5.0,
        rebounding: 5.0,
        overall: 5.0,
        count: 0
      };
    }
  };

  // Function to calculate team stats based on selected players
  const calculateTeamStats = async (teamPlayers) => {
    const positions = ['pg', 'sg', 'sf', 'pf', 'c'];
    const teamRatings = {
      shooting: 0,
      dunking: 0,
      defense: 0,
      playmaking: 0,
      rebounding: 0,
      overall: 0,
      playerCount: 0
    };

    let validPlayers = 0;

    for (const position of positions) {
      const player = teamPlayers.players?.[position];
      if (player && player.id) {
        const playerRatings = await fetchPlayerAverageRating(player.id);
        teamRatings.shooting += playerRatings.shooting;
        teamRatings.dunking += playerRatings.dunking;
        teamRatings.defense += playerRatings.defense;
        teamRatings.playmaking += playerRatings.playmaking;
        teamRatings.rebounding += playerRatings.rebounding;
        validPlayers++;
      }
    }

    if (validPlayers > 0) {
      teamRatings.shooting = teamRatings.shooting / validPlayers;
      teamRatings.dunking = teamRatings.dunking / validPlayers;
      teamRatings.defense = teamRatings.defense / validPlayers;
      teamRatings.playmaking = teamRatings.playmaking / validPlayers;
      teamRatings.rebounding = teamRatings.rebounding / validPlayers;
      teamRatings.overall = (
        teamRatings.shooting + teamRatings.dunking + teamRatings.defense + 
        teamRatings.playmaking + teamRatings.rebounding
      ) / 5;
      teamRatings.playerCount = validPlayers;
    }

    return teamRatings;
  };

  // Calculate stats when teams change
  useEffect(() => {
    const calculateBothTeamStats = async () => {
      const team1HasPlayers = Object.values(team1Players.players || {}).some(p => p);
      const team2HasPlayers = Object.values(team2Players.players || {}).some(p => p);

      if (!team1HasPlayers && !team2HasPlayers) {
        setTeam1Stats(null);
        setTeam2Stats(null);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [team1StatsResult, team2StatsResult] = await Promise.all([
          calculateTeamStats(team1Players),
          calculateTeamStats(team2Players)
        ]);

        setTeam1Stats(team1StatsResult);
        setTeam2Stats(team2StatsResult);
      } catch (err) {
        console.error('Error calculating team stats:', err);
        setError('Failed to calculate team stats');
      } finally {
        setLoading(false);
      }
    };

    calculateBothTeamStats();
  }, [team1Players, team2Players]);

  // Generate simulated final score based on overall rating
  const generateScore = (teamOverall) => {
    const baseScore = 95;
    const variance = 15;
    const ratingMultiplier = (teamOverall - 5) * 2;
    const randomFactor = (Math.random() - 0.5) * 10;
    return Math.round(baseScore + ratingMultiplier + variance + randomFactor);
  };

  if (loading) {
    return (
      <section id="matchup-results" className="p-4">
        <div className="results-container">
          <p className="text-center text-lg">Calculating matchup results...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="matchup-results" className="p-4">
        <div className="results-container">
          <p className="text-center text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  if (!team1Stats || !team2Stats) {
    return (
      <section id="matchup-results" className="p-4">
        <div className="results-container">
          <p className="text-center text-gray-500">Select players for both teams to see matchup results</p>
        </div>
      </section>
    );
  }

  // Determine winner and generate scores
  const team1Overall = team1Stats.overall;
  const team2Overall = team2Stats.overall;
  const team1Score = generateScore(team1Overall);
  const team2Score = generateScore(team2Overall);
  
  let finalTeam1Score = team1Score;
  let finalTeam2Score = team2Score;
  
  if (team1Overall > team2Overall && team1Score <= team2Score) {
    finalTeam1Score = team2Score + Math.floor(Math.random() * 5) + 1;
  } else if (team2Overall > team1Overall && team2Score <= team1Score) {
    finalTeam2Score = team1Score + Math.floor(Math.random() * 5) + 1;
  }

  const winner = finalTeam1Score > finalTeam2Score 
    ? team1Players.teamName || 'Team 1'
    : team2Players.teamName || 'Team 2';

  // Calculate percentage widths for comparison bars
  const getComparisonData = (stat) => {
    const team1Value = team1Stats[stat];
    const team2Value = team2Stats[stat];
    const maxValue = Math.max(team1Value, team2Value, 10);
    
    return {
      team1: {
        score: team1Value.toFixed(1),
        width: `${Math.max((team1Value / maxValue) * 100, 10)}%`
      },
      team2: {
        score: team2Value.toFixed(1),
        width: `${Math.max((team2Value / maxValue) * 100, 10)}%`
      }
    };
  };

  const stats = [
    { category: 'Shooting', ...getComparisonData('shooting') },
    { category: 'Dunking', ...getComparisonData('dunking') },
    { category: 'Defense', ...getComparisonData('defense') },
    { category: 'Playmaking', ...getComparisonData('playmaking') },
    { category: 'Rebounding', ...getComparisonData('rebounding') },
    { category: 'Overall', ...getComparisonData('overall') },
  ];

  return (
    <section id="matchup-results" className="p-4">
      <div className="results-container space-y-4">
        <div className="winner-announcement">
          <h3 className="text-xl font-semibold mb-2">Matchup Winner</h3>
          <div className="winner-badge bg-green-500 text-white p-4 rounded">
            <div className="winner-text text-lg">{winner} Wins!</div>
            <div className="winner-score text-xl font-bold">
              {finalTeam1Score} - {finalTeam2Score}
            </div>
          </div>
        </div>
        
        <div className="stat-comparison">
          <h3 className="text-xl font-semibold mb-4">Team Comparison</h3>
          <p className="text-sm text-gray-600 mb-4">
            Based on user ratings • Team 1: {team1Stats.playerCount}/5 players rated • Team 2: {team2Stats.playerCount}/5 players rated
          </p>
          
          {stats.map(stat => (
            <div className="stat-category mb-4" key={stat.category}>
              <div className="category-name font-semibold mb-1">{stat.category}</div>
              <div className="comparison-bar flex rounded overflow-hidden" style={{ height: '40px' }}>
                <div
                  className="team1-bar bg-blue-500 text-white text-center flex items-center justify-center text-sm font-bold"
                  style={{ width: stat.team1.width, minWidth: '60px' }}
                >
                  {stat.team1.score}
                </div>
                <div
                  className="team2-bar bg-red-500 text-white text-center flex items-center justify-center text-sm font-bold"
                  style={{ width: stat.team2.width, minWidth: '60px' }}
                >
                  {stat.team2.score}
                </div>
              </div>
              <div className="team-names flex justify-between mt-1 text-sm">
                <span className="text-blue-600 font-medium">{team1Players.teamName || 'Team 1'}</span>
                <span className="text-red-600 font-medium">{team2Players.teamName || 'Team 2'}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="matchup-details bg-gray-50 p-4 rounded">
          <h4 className="font-semibold mb-2">Matchup Analysis</h4>
          <p className="text-sm text-gray-700">
            {team1Overall > team2Overall 
              ? `${team1Players.teamName || 'Team 1'} has the statistical advantage with an overall rating of ${team1Overall.toFixed(1)} vs ${team2Overall.toFixed(1)}.`
              : team2Overall > team1Overall
              ? `${team2Players.teamName || 'Team 2'} has the statistical advantage with an overall rating of ${team2Overall.toFixed(1)} vs ${team1Overall.toFixed(1)}.`
              : `Both teams are evenly matched with similar overall ratings around ${team1Overall.toFixed(1)}.`
            }
          </p>
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
            img: formatPlayerNameForImage(playerName),
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
      setError('Please select all players for both teams to simulate the matchup.');
      return;
    }

    setError('');
    console.log('Simulating matchup with real player ratings:', { team1Players, team2Players });
    
    const resultsSection = document.getElementById('matchup-results');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setTeam1Players({ pg: '', sg: '', sf: '', pf: '', c: '', teamName: '', players: {} });
    setTeam2Players({ pg: '', sg: '', sf: '', pf: '', c: '', teamName: '', players: {} });
    setError('');
  };

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