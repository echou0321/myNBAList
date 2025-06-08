import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// TeamSelector Component
function TeamSelector({ teamNumber, setPlayers, selectedPlayers }) {
  const playersByPosition = {
    pg: teamNumber === 1
      ? [
          { value: '', label: 'Select a Player', img: '/playerIMGs/placeholder.jpg' },
          { value: 'stephen-curry', label: 'Stephen Curry', img: '/playerIMGs/Stephen-Curry.jpg' },
          { value: 'luka-doncic', label: 'Luka Dončić', img: 'public/playerIMGs/Luka-Dončić.jpg' },
          { value: 'shai-gilgeous-alexander', label: 'Shai Gilgeous-Alexander', img: '/playerIMGs/Shai-Gilgeous-Alexander.jpg' },
          { value: 'damian-lillard', label: 'Damian Lillard', img: '/playerIMGs/Damian-Lillard.jpg' },
          { value: 'tyrese-haliburton', label: 'Tyrese Haliburton', img: '/playerIMGs/Tyrese-Haliburton.jpg' },
          { value: 'jalen-brunson', label: 'Jalen Brunson', img: '/playerIMGs/Jalen-Brunson.jpg' },
          { value: 'trae-young', label: 'Trae Young', img: 'public/playerIMGs/Trae-Young.jpg' },
          { value: 'deaaron-fox', label: 'De’Aaron Fox', img: "public/playerIMGs/De'Aaron-Fox.jpg" },
        ]
      : [
          { value: '', label: 'Select a Player', img: '/playerIMGs/placeholder.jpg' },
          { value: 'ja-morant', label: 'Ja Morant', img: '/playerIMGs/Ja-Morant.jpg' },
          { value: 'kyrie-irving', label: 'Kyrie Irving', img: '/playerIMGs/Kyrie-Irving.jpg' },
          { value: 'darius-garland', label: 'Darius Garland', img: '/playerIMGs/Darius-Garland.jpg' },
          { value: 'lamelo-ball', label: 'LaMelo Ball', img: '/playerIMGs/Lamelo-Ball.jpg' },
          { value: 'cade-cunningham', label: 'Cade Cunningham', img: '/playerIMGs/Cade-Cunningham.jpg' },
          { value: 'tyrese-maxey', label: 'Tyrese Maxey', img: '/playerIMGs/Tyrese-Maxey.jpg' },
          { value: 'jamal-murray', label: 'Jamal Murray', img: '/playerIMGs/Jamal-Murray.jpg' },
          { value: 'donovan-mitchell', label: 'Donovan Mitchell', img: '/playerIMGs/Donovan-Mitchell.jpg' },
        ],
    sg: teamNumber === 1
      ? [
          { value: '', label: 'Select a Player', img: '/playerIMGs/placeholder.jpg' },
          { value: 'devin-booker', label: 'Devin Booker', img: '/playerIMGs/Devin-Booker.jpg' },
          { value: 'anthony-edwards', label: 'Anthony Edwards', img: '/playerIMGs/Anthony-Edwards.jpg' },
          { value: 'jaylen-brown', label: 'Jaylen Brown', img: '/playerIMGs/Jaylen-Brown.jpg' },
          { value: 'bradley-beal', label: 'Bradley Beal', img: '/playerIMGs/Bradley-Beal.jpg' },
          { value: 'zach-lavine', label: 'Zach LaVine', img: 'public/playerIMGs/Zach-Lavine.jpg' },
          { value: 'demar-derozan', label: 'DeMar DeRozan', img: '/playerIMGs/DeMar-DeRozan.jpg' },
          { value: 'desmond-bane', label: 'Desmond Bane', img: '/playerIMGs/Desmond-Bane.jpg' },
          { value: 'jalen-green', label: 'Jalen Green', img: '/playerIMGs/Jalen-Green.jpg' },
        ]
      : [
          { value: '', label: 'Select a Player', img: '/playerIMGs/placeholder.jpg' },
          { value: 'donovan-mitchell', label: 'Donovan Mitchell', img: '/playerIMGs/Donovan-Mitchell.jpg' },
          { value: 'mikal-bridges', label: 'Mikal Bridges', img: '/playerIMGs/Mikal-Bridges.jpg' },
          { value: 'jalen-williams', label: 'Jalen Williams', img: '/playerIMGs/Jalen-Williams.jpg' },
          { value: 'tyler-herro', label: 'Tyler Herro', img: '/playerIMGs/Tyler-Herro.jpg' },
          { value: 'austin-reaves', label: 'Austin Reaves', img: '/playerIMGs/Austin-Reaves.jpg' },
          { value: 'anfernee-simons', label: 'Anfernee Simons', img: '/playerIMGs/Anfernee-Simons.jpg' },
          { value: 'cj-mccollum', label: 'C.J. McCollum', img: '/playerIMGs/CJ-McCollum.jpg' },
          { value: 'devin-vassell', label: 'Devin Vassell', img: '/playerIMGs/Devin-Vassell.jpg' },
        ],
    sf: teamNumber === 1
      ? [
          { value: '', label: 'Select a Player', img: '/playerIMGs/placeholder.jpg' },
          { value: 'lebron-james', label: 'LeBron James', img: '/playerIMGs/LeBron-James.jpg' },
          { value: 'kevin-durant', label: 'Kevin Durant', img: '/playerIMGs/Kevin-Durant.jpg' },
          { value: 'jayson-tatum', label: 'Jayson Tatum', img: '/playerIMGs/Jayson-Tatum.jpg' },
          { value: 'jimmy-butler', label: 'Jimmy Butler', img: '/playerIMGs/Jimmy-Butler.jpg' },
          { value: 'paul-george', label: 'Paul George', img: '/playerIMGs/Paul-George.jpg' },
          { value: 'brandon-ingram', label: 'Brandon Ingram', img: '/playerIMGs/Brandon-Ingram.jpg' },
          { value: 'scottie-barnes', label: 'Scottie Barnes', img: '/playerIMGs/Scottie-Barnes.jpg' },
          { value: 'franz-wagner', label: 'Franz Wagner', img: '/playerIMGs/Franz-Wagner.jpg' },
        ]
      : [
          { value: '', label: 'Select a Player', img: '/playerIMGs/placeholder.jpg' },
          { value: 'kawhi-leonard', label: 'Kawhi Leonard', img: '/playerIMGs/Kawhi-Leonard.jpg' },
          { value: 'khris-middleton', label: 'Khris Middleton', img: '/playerIMGs/Khris-Middleton.jpg' },
          { value: 'mikal-bridges', label: 'Mikal Bridges', img: '/playerIMGs/Mikal-Bridges.jpg' },
          { value: 'klay-thompson', label: 'Klay Thompson', img: '/playerIMGs/Klay-Thompson.jpg' },
          { value: 'og-anunoby', label: 'OG Anunoby', img: '/playerIMGs/OG-Anunoby.jpg' },
          { value: 'deandre-hunter', label: 'De’Andre Hunter', img: "public/playerIMGs/De'Andre-Hunter.jpg" },
          { value: 'kyle-kuzma', label: 'Kyle Kuzma', img: '/playerIMGs/Kyle-Kuzma.jpg' },
          { value: 'jaden-mcdaniels', label: 'Jaden McDaniels', img: 'public/playerIMGs/Jaden-Mcdaniels.jpg' },
        ],
    pf: teamNumber === 1
      ? [
          { value: '', label: 'Select a Player', img: '/playerIMGs/placeholder.jpg' },
          { value: 'giannis-antetokounmpo', label: 'Giannis Antetokounmpo', img: '/playerIMGs/Giannis-Antetokounmpo.jpg' },
          { value: 'anthony-davis', label: 'Anthony Davis', img: '/playerIMGs/Anthony-Davis.jpg' },
          { value: 'zion-williamson', label: 'Zion Williamson', img: '/playerIMGs/Zion-Williamson.jpg' },
          { value: 'pascal-siakam', label: 'Pascal Siakam', img: '/playerIMGs/Pascal-Siakam.jpg' },
          { value: 'evan-mobley', label: 'Evan Mobley', img: '/playerIMGs/Evan-Mobley.jpg' },
          { value: 'karl-anthony-towns', label: 'Karl-Anthony Towns', img: '/playerIMGs/Karl-Anthony-Towns.jpg' },
          { value: 'lauri-markkanen', label: 'Lauri Markkanen', img: '/playerIMGs/Lauri-Markkanen.jpg' },
          { value: 'paolo-banchero', label: 'Paolo Banchero', img: '/playerIMGs/Paolo-Banchero.jpg' },
        ]
      : [
          { value: '', label: 'Select a Player', img: '/playerIMGs/placeholder.jpg' },
          { value: 'draymond-green', label: 'Draymond Green', img: 'public/playerIMGs/Draymond-Green.jpg'},
          { value: 'karl-anthony-towns', label: 'Karl-Anthony Towns', img: '/playerIMGs/Karl-Anthony-Towns.jpg' },
          { value: 'domantas-sabonis', label: 'Domantas Sabonis', img: '/playerIMGs/Domantas-Sabonis.jpg' },
          { value: 'julius-randle', label: 'Julius Randle', img: '/playerIMGs/Julius-Randle.jpg' },
          { value: 'john-collins', label: 'John Collins', img: '/playerIMGs/John-Collins.jpg' },
          { value: 'aaron-gordon', label: 'Aaron Gordon', img: '/playerIMGs/Aaron-Gordon.jpg' },
          { value: 'jaren-jackson-jr', label: 'Jaren Jackson Jr.', img: 'public/playerIMGs/Jaren-Jackson-Jr..jpg' },
          { value: 'chet-holmgren', label: 'Chet Holmgren', img: '/playerIMGs/Chet-Holmgren.jpg' },
        ],
    c: teamNumber === 1
      ? [
          { value: '', label: 'Select a Player', img: '/playerIMGs/placeholder.jpg' },
          { value: 'nikola-jokic', label: 'Nikola Jokić', img: 'public/playerIMGs/Nikola-Jokić.jpg' },
          { value: 'joel-embiid', label: 'Joel Embiid', img: '/playerIMGs/Joel-Embiid.jpg' },
          { value: 'bam-adebayo', label: 'Bam Adebayo', img: '/playerIMGs/Bam-Adebayo.jpg' },
          { value: 'victor-wembanyama', label: 'Victor Wembanyama', img: '/playerIMGs/Victor-Wembanyama.jpg' },
          { value: 'rudy-gobert', label: 'Rudy Gobert', img: '/playerIMGs/Rudy-Gobert.jpg' },
          { value: 'al-horford', label: 'Al Horford', img: '/playerIMGs/Al-Horford.jpg' },
          { value: 'myles-turner', label: 'Myles Turner', img: '/playerIMGs/Myles-Turner.jpg' },
          { value: 'walker-kessler', label: 'Walker Kessler', img: '/playerIMGs/Walker-Kessler.jpg' },
        ]
      : [
          { value: '', label: 'Select a Player', img: '/playerIMGs/placeholder.jpg' },
          { value: 'domantas-sabonis', label: 'Domantas Sabonis', img: '/playerIMGs/Domantas-Sabonis.jpg' },
          { value: 'jarrett-allen', label: 'Jarrett Allen', img: '/playerIMGs/Jarrett-Allen.jpg' },
          { value: 'deandre-ayton', label: 'Deandre Ayton', img: '/playerIMGs/Deandre-Ayton.jpg' },
          { value: 'brook-lopez', label: 'Brook Lopez', img: '/playerIMGs/Brook-Lopez.jpg' },
          { value: 'clint-capela', label: 'Clint Capela', img: '/playerIMGs/Clint-Capela.jpg' },
          { value: 'nikola-vucevic', label: 'Nikola Vučević', img: 'public/playerIMGs/Nikola-Vučević.jpg' },
          { value: 'zach-edey', label: 'Zach Edey', img: '/playerIMGs/Zach-Edey.jpg' },
          { value: 'daniel-gafford', label: 'Daniel Gafford', img: '/playerIMGs/Daniel-Gafford.jpg' },
        ],
  };

  const handlePlayerChange = (position, value) => {
    const selected = playersByPosition[position].find(p => p.value === value);
    console.log(`Selected player for ${position}:`, selected); // Debug log
    setPlayers(prev => ({
      ...prev,
      [position]: value,
      players: {
        ...prev.players,
        [position]: selected && value
          ? { name: selected.label, position: position.toUpperCase(), img: selected.img }
          : null,
      }
    }));
  };

  const handleTeamNameChange = e => {
    setPlayers(prev => ({ ...prev, teamName: e.target.value }));
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
              {playersByPosition[position].map(player => (
                <option key={player.value} value={player.value}>
                  {player.label}
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
            value={selectedPlayers.teamName || ''}
            onChange={handleTeamNameChange}
          />
        </div>
      </div>
    </div>
  );
}

// CourtVisualization Component
function CourtVisualization({ team1Players, team2Players }) {
  const defaultTeam1Players = {
    pg: { name: 'Player 1', position: 'PG', img: 'public/icons/ChatGPT Image Jun 8, 2025 at 04_34_48 AM.png' },
    sg: { name: 'Player 2', position: 'SG', img: 'public/icons/ChatGPT Image Jun 8, 2025 at 04_34_48 AM.png' },
    sf: { name: 'Player 3', position: 'SF', img: 'public/icons/ChatGPT Image Jun 8, 2025 at 04_34_48 AM.png' },
    pf: { name: 'Player 4', position: 'PF', img: 'public/icons/ChatGPT Image Jun 8, 2025 at 04_34_48 AM.png' },
    c: { name: 'Player 5', position: 'C', img: 'public/icons/ChatGPT Image Jun 8, 2025 at 04_34_48 AM.png' },
  };

  const defaultTeam2Players = {
    pg: { name: 'Player 1', position: 'PG', img: 'public/icons/ChatGPT Image Jun 8, 2025 at 04_34_48 AM.png' },
    sg: { name: 'Player 2', position: 'SG', img: 'public/icons/ChatGPT Image Jun 8, 2025 at 04_34_48 AM.png' },
    sf: { name: 'Player 3', position: 'SF', img: 'public/icons/ChatGPT Image Jun 8, 2025 at 04_34_48 AM.png' },
    pf: { name: 'Player 4', position: 'PF', img: 'public/icons/ChatGPT Image Jun 8, 2025 at 04_34_48 AM.png' },
    c: { name: 'Player 5', position: 'C', img: 'public/icons/ChatGPT Image Jun 8, 2025 at 04_34_48 AM.png' },
  };

  const getTeamPlayers = (teamPlayers, defaults) => {
    const result = {};
    ['pg', 'sg', 'sf', 'pf', 'c'].forEach(pos => {
      result[pos] = teamPlayers.players?.[pos] || defaults[pos];
      // Ensure img is never undefined
      if (!result[pos].img) {
        result[pos].img = '/playerIMGs/placeholder.jpg';
      }
    });
    return result;
  };

  const team1ToShow = getTeamPlayers(team1Players, defaultTeam1Players);
  const team2ToShow = getTeamPlayers(team2Players, defaultTeam2Players);
  
  const team1PlayerElements = ['pg', 'sg', 'sf', 'pf', 'c'].map(pos => {
    const player = team1ToShow[pos];
    return (
      <div className={`player-position ${pos}`} key={pos}>
        <div className="player-marker" data-tooltip={`${player.name}: ${player.position}`}>
          <img src={player.img} alt={player.position} className="player-img" />
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
          <img src={player.img} alt={player.position} className="player-img" />
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

  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

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
              />
              <TeamSelector
                teamNumber={2}
                setPlayers={setTeam2Players}
                selectedPlayers={team2Players}
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