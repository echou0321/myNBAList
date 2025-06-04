// src/components/UserProfile.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/style.css';

// Firebase imports
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [players, setPlayers] = useState([
    { rank: 1, name: 'Nikola Jokić', team: 'Denver Nuggets', img: '/playerIMGs/Jokic.jpg' },
    { rank: 2, name: 'Giannis Antetokounmpo', team: 'Milwaukee Bucks', img: '/playerIMGs/Antetokounmpo.jpg' },
    { rank: 3, name: 'Shai Gilgeous-Alexander', team: 'Oklahoma City Thunder', img: '/playerIMGs/SGA.jpg' },
    { rank: 4, name: 'Luka Dončić', team: 'Dallas Mavericks', img: '/playerIMGs/Doncic.jpg' },
    { rank: 5, name: 'LeBron James', team: 'Los Angeles Lakers', img: '/playerIMGs/Lebron.jpg' },
    { rank: 6, name: 'Stephen Curry', team: 'Golden State Warriors', img: '/playerIMGs/Steph.jpg' },
    { rank: 7, name: 'Jayson Tatum', team: 'Boston Celtics', img: '/playerIMGs/Tatum.jpg' },
    { rank: 8, name: 'Anthony Edwards', team: 'Minnesota Timberwolves', img: '/playerIMGs/Edwards.jpg' },
    { rank: 9, name: 'Donovan Mitchell', team: 'Cleveland Cavaliers', img: '/playerIMGs/Mitchell.jpg' },
    { rank: 10, name: 'Anthony Davis', team: 'Los Angeles Lakers', img: '/playerIMGs/AD.jpg' },
  ]);

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

  const handleAddPlayer = () => {
    const newPlayer = {
      rank: players.length + 1,
      name: 'New Player',
      team: 'Unknown Team',
      img: '/playerIMGs/placeholder.jpg',
    };
    setPlayers([...players, newPlayer]);
  };

  const handleRemovePlayer = (index) => {
    const newPlayers = players.filter((_, i) => i !== index);
    setPlayers(newPlayers.map((player, i) => ({ ...player, rank: i + 1 })));
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
    console.log('Saved player list:', players);
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
        <section className="profile-header flex items-center mb-8">
          <img
            src="/icons/5f49bf67-4fe6-431d-99e1-bc319cde6b31.png"
            alt="User avatar"
            className="profile-pic w-24 h-24 rounded-full mr-4"
          />
          <div className="profile-info">
            <h2 className="text-2xl font-bold">{currentUser?.displayName || 'Guest User'}</h2>
            <p>Member since January 2025</p>
            <div className="profile-stats flex space-x-4">
              <div className="stat text-center">
                <div className="stat-number text-xl font-semibold">78</div>
                <div className="stat-label">Players Rated</div>
              </div>
              <div className="stat text-center">
                <div className="stat-number text-xl font-semibold">122</div>
                <div className="stat-label">Comments</div>
              </div>
              <div className="stat text-center">
                <div className="stat-number text-xl font-semibold">42</div>
                <div className="stat-label">Followers</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="top-players-header flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">My Top 10 Players of All Time</h2>
            <button
              className="edit-button bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={handleEditToggle}
            >
              {isEditing ? 'Cancel' : 'Edit List'}
            </button>
          </div>

          <div className="top-players-list space-y-4">
            {players.map((player, index) => (
              <div
                key={player.rank}
                className="player-item flex items-center"
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
                  className="player-pic w-12 h-12 rounded-full mr-4"
                />
                <div className="player-info flex-1">
                  <div className="player-name font-semibold">{player.name}</div>
                  <div className="player-team text-gray-600">{player.team}</div>
                </div>
                {isEditing && (
                  <>
                    <div className="drag-handle cursor-move text-gray-500 mr-4">
                      ☰
                    </div>
                    <button
                      className="remove-button text-red-500 hover:text-red-700"
                      onClick={() => handleRemovePlayer(index)}
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            ))}
            {isEditing && (
              <div
                className="add-player text-blue-500 cursor-pointer hover:text-blue-700"
                onClick={handleAddPlayer}
              >
                + Add Player
              </div>
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
