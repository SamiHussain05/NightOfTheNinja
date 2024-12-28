import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateLobby from './CreateLobby';
import JoinLobby from './JoinLobby';
import PlayerCards from './PlayerCards';
import AdminPage from './AdminPage';
import NavbarComponent from './NavBar';
// import FootbarComponent from './Footer';
import './App.css'; // Import custom CSS file

function App() {
  return (
    <Router>
      {/* Include Navbar at the top of the app */}
      <h1 class= "name">Night Of The Ninja</h1>
      <NavbarComponent />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<CreateLobby />} />
          <Route path="/join" element={<JoinLobby />} />
          <Route path="/cards/:lobbyCode/:playerId" element={<PlayerCards />} />
          <Route path="/admin/:lobbyCode" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
