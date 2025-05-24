// src/components/Browse.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../css/style.css'

const playerData = [
  { name: 'Nikola Jokić', team: 'DEN', teamName: 'Denver Nuggets', position: 'C', conference: 'West', img: 'Jokic', rating: 9.8 },
  { name: 'Luka Dončić', team: 'LAL', teamName: 'Los Angeles Lakers', position: 'G', conference: 'West', img: 'Doncic', rating: 9.6 },
  { name: 'Giannis Antetokounmpo', team: 'MIL', teamName: 'Milwaukee Bucks', position: 'F', conference: 'East', img: 'Antetokounmpo', rating: 9.7 },
  { name: 'Chris Paul', team: 'SAS', teamName: 'San Antonio Spurs', position: 'G', conference: 'West', img: 'CP3', rating: 8.1 }
  // Add more players here...
]

export default function Browse() {
  const [search, setSearch] = useState('')
  const [team, setTeam] = useState('')
  const [position, setPosition] = useState('')
  const [conference, setConference] = useState('')

  const filteredPlayers = playerData.filter(player => {
    return (
      player.name.toLowerCase().includes(search.toLowerCase()) &&
      (team === '' || player.team === team) &&
      (position === '' || player.position === position) &&
      (conference === '' || player.conference === conference)
    )
  })

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
        <section id="browse-intro">
          <h2>Browse NBA Players</h2>
          <p>Search, filter, and discover your favorite NBA players!</p>
        </section>

        <section id="search-filter">
          <input type="text" id="search-bar" placeholder="Search by name..."
            value={search} onChange={e => setSearch(e.target.value)} />

          <select id="team-filter" value={team} onChange={e => setTeam(e.target.value)}>
            <option value="">All Teams</option>
            <option value="LAL">Los Angeles Lakers</option>
            <option value="GSW">Golden State Warriors</option>
            <option value="MIL">Milwaukee Bucks</option>
            <option value="DAL">Dallas Mavericks</option>
            <option value="SAS">San Antonio Spurs</option>
            <option value="DEN">Denver Nuggets</option>
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
        </section>

        <section id="player-grid">
          {filteredPlayers.map((player) => (
            <Link to="/playerprofile" className="player-card-link" key={player.name}>
              <div className="player-card">
                <img src={`/playerIMGs/${player.img}.jpg`} alt={player.name} className="player-img" />
                <h3>{player.name}</h3>
                <p>{player.teamName} | {player.position === 'G' ? 'Guard' : player.position === 'F' ? 'Forward' : 'Center'}</p>
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
  )
}
