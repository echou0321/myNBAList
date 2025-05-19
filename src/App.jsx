import { Routes, Route } from 'react-router-dom';
import FiveVFive from './components/FiveVFive.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import './css'; // Assumes style.css is copied here

function App() {
  return (
    <Routes>
      <Route path="/5v5" element={<FiveVFive />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;