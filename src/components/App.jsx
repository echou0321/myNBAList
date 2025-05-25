// src/App.jsx

import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import FiveVFive from './FiveVFive.jsx';
import Login from './login.jsx';
import Register from './register.jsx';
import HomePage from './index.jsx';
import PlayerProfile from './playerProfile.jsx';
import PlayerSearchPage from './playerSearchPage.jsx' 
import '../css/style.css';

export default function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/5v5" element={<FiveVFive />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/playerprofile" element={<PlayerProfile />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/browse" element={<PlayerSearchPage />} />
        </Routes>
      </div>
    </Router>
  );
}

