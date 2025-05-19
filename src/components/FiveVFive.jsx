import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/style.css'; // Assumes style.css is copied to App.css

function FiveVFive() {
  const [team1, setTeam1] = useState({
    pg: '', sg: '', sf: '', pf: '', c: '',
  });
  const [team2, setTeam2] = useState({
    pg: '', sg: '', sf: '', pf: '', c: '',
  });

  const players = [
    { id: 1, name: 'Nikola Jokić', position: 'C', image: '/playerIMGs/Jokic.jpg' },
    { id: 2, name: 'Giannis Antetokounmpo', position: 'PF', image: '/playerIMGs/Antetokounmpo.jpg' },
    { id: 3, name: 'Shai Gilgeous-Alexander', position: 'PG', image: '/playerIMGs/SGA.jpg' },
    { id: 4, name: 'Luka Dončić', position: 'PG', image: '/playerIMGs/Doncic.jpg' },
    { id: 5, name: 'LeBron James', position: 'SF', image: '/playerIMGs/Lebron.jpg' },
  ];

  const handleTeam1Change = (position, value) => {
    setTeam1({ ...team1, [position]: value });
  };

  const handleTeam2Change = (position, value) => {
    setTeam2({ ...team2, [position]: value });
  };

  const simulateMatchup = () => {
    console.log('Team 1:', team1);
    console.log('Team 2:', team2);
    alert('Matchup simulated! Check console for team details.');
  };

  const resetTeams = () => {
    setTeam1({ pg: '', sg: '', sf: '', pf: '', c: '' });
    setTeam2({ pg: '', sg: '', sf: '', pf: '', c: '' });
  };

  return (
    <>
      <header>
        <div className="site-logo">
          <img src="/icons/Basketball-icon.jpg" alt="Site Icon" className="logo-img" />
          <h1>MyNBAList</h1>
        </div>
        <nav>
          <div className="nav-left">
            <Link to="/">Home</Link>
            <Link to="/browse">Browse Players</Link>
            <Link to="/5v5">My NBA 5v5</Link>
            <Link to="/profile">My Profile</Link>
          </div>
          <div className="nav-right">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="team-builder-container">
          <h2>My NBA 5v5 Team Builder</h2>
          <div className="team-selector-section">
            <div className="team-selector">
              <h3>Team 1</h3>
              <div className="player-selection-area">
                {['pg', 'sg', 'sf', 'pf', 'c'].map((position) => (
                  <div className="position-selection" key={position}>
                    <label>{position.toUpperCase()}</label>
                    <select
                      className="player-select"
                      value={team1[position]}
                      onChange={(e) => handleTeam1Change(position, e.target.value)}
                    >
                      <option value="">Select Player</option>
                      {players
                        .filter((p) => p.position === position.toUpperCase() || !Object.values(team1).includes(p.name))
                        .map((player) => (
                          <option key={player.id} value={player.name}>
                            {player.name}
                          </option>
                        ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div className="team-selector">
              <h3>Team 2</h3>
              <div className="player-selection-area">
                {['pg', 'sg', 'sf', 'pf', 'c'].map((position) => (
                  <div className="position-selection" key={position}>
                    <label>{position.toUpperCase()}</label>
                    <select
                      className="player-select"
                      value={team2[position]}
                      onChange={(e) => handleTeam2Change(position, e.target.value)}
                    >
                      <option value="">Select Player</option>
                      {players
                        .filter((p) => p.position === position.toUpperCase() || !Object.values(team2).includes(p.name))
                        .map((player) => (
                          <option key={player.id} value={player.name}>
                            {player.name}
                          </option>
                        ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="simulator-actions">
            <button className="simulate-button" onClick={simulateMatchup}>
              Simulate Matchup
            </button>
            <button className="reset-button" onClick={resetTeams}>
              Reset Teams
            </button>
          </div>
        </section>

        <section id="court-visualization">
          <h3>Court Visualization</h3>
          <div className="basketball-court">
            <div className="court-lines">
              <div className="court-center">
                <div className="court-circle"></div>
                <div className="versus">VS</div>
              </div>
            </div>
            <div className="team team-left">
              <div className="team-name">Team 1</div>
              {['pg', 'sg', 'sf', 'pf', 'c'].map((position) => (
                <div className={`player-position ${position}`} key={position}>
                  {team1[position] && (
                    <div className="player-marker">
                      <img
                        src={players.find((p) => p.name === team1[position])?.image}
                        alt={team1[position]}
                        className="player-img"
                      />
                      <div className="player-info">
                        <span className="player-name">{team1[position]}</span>
                        <span className="player-position-label">{position.toUpperCase()}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="team team-right">
              <div className="team-name">Team 2</div>
              {['pg', 'sg', 'sf', 'pf', 'c'].map((position) => (
                <div className={`player-position ${position}`} key={position}>
                  {team2[position] && (
                    <div className="player-marker">
                      <img
                        src={players.find((p) => p.name === team2[position])?.image}
                        alt={team2[position]}
                        className="player-img"
                      />
                      <div className="player-info">
                        <span className="player-name">{team2[position]}</span>
                        <span className="player-position-label">{position.toUpperCase()}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>© 2025 MyNBAList</p>
      </footer>
    </>
  );
}

export default FiveVFive;