// src/App.jsx

import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

// note: the file in components is literally named "5v5.jsx"
import FiveVFive from './components/FiveVFive.jsx'
import Login     from './components/login.jsx'
import Register  from './components/register.jsx'

// make sure this matches the actual CSS path under src/css
import './css/style.css'

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Your routes */}
        <Route path="/login"  element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/5v5"    element={<FiveVFive />} />

        {/* Catch-all -> back to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}
