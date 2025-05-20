// src/App.jsx

import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import FiveVFive from './FiveVFive.jsx'
import Login     from './login.jsx'
import Register  from './register.jsx'
import HomePage from './index.jsx'

import '../css/style.css'

export default function App() {
  return (
    <Router>
      <Routes>
        {}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {}
        <Route path="/login"  element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/5v5"    element={<FiveVFive />} />

        {}
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<HomePage />} />

      </Routes>
    </Router>
  )
}
